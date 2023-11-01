/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import model
const User = require( "../model/user" );
const Role = require( "../model/role" );
const UserRole = require( "../model/userRole" );
const Event = require( '../model/event' );

// import services
const workspaceService = require( "./workspaceService" );
const topicService = require( "./topicService" );
const productService = require( "./productService" );


// bcrypt
const bcrypt = require ( 'bcrypt' );
/*
The higher the saltRounds value, the more time the hashing algorithm takes. 
You want to select a number that is high enough to prevent attacks, 
but not slower than potential user patience. In this example, 
we use the default value, 10.
*/
const saltRounds = 10;

// random generator for email verification hashes
const crypto = require( 'crypto' );

exports.saveUserRole = async function( record ) {
    let text = 'INSERT INTO user_roles (user_id, role_id, active, end_time)'
            + 'VALUES($1, $2, $3, $4);';
    let values = [ record.userId, record.roleId, record.active, record.endTime ];
    try {
         
        await db.query( text, values );
        
        return true;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
        
};

exports.getActiveRoleById = async function( roleId ) {
    let text = "SELECT * FROM roles WHERE active = $1 AND role_id = $2";
    let values = [ true, roleId ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return Role.ormRole( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

exports.getActiveRoleByName = async function( name ) {
    let text = "SELECT * FROM roles WHERE active = $1 AND LOWER(role_name) = LOWER($2)";
    let values = [ true, name ];
    
    try {
         
        let res = await db.query( text, values );
        if( res.rows.length > 0 ) {
            return Role.ormRole( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

exports.getActiveRolesForUserId = async function( userId ) {
    let text = "SELECT * FROM user_roles WHERE active = $1 AND user_id = $2";
    let values = [ true, userId ];
    
    let roles = [];
    try {

         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            let role = await exports.getActiveRoleById( res.rows[i].role_id );
            roles.push( role );
        }

        return roles;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

exports.useAccessTokensById = async function( userId, numberOfTokens ) {
    if( userId > 0 && numberOfTokens > 0 ) {
        let text = "UPDATE users SET available_access_tokens=available_access_tokens - $1 WHERE user_id=$2";
        let values = [ numberOfTokens, userId ];
        //console.log("taking away a token");
        try {
            let response = await db.query( text, values );
            
            return true;
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
    }
    else {
        return false;
    }
};

exports.addAccessTokensToUserById = async function( userId, numberOfTokens ) {
    //console.log("adding tokens - userId : " + userId + " tokens: " + numberOfTokens);
    if( userId > 0 && numberOfTokens > 0 ) {
        let text = "UPDATE users SET available_access_tokens=available_access_tokens + $1 WHERE user_id=$2";
        let values = [ numberOfTokens, userId ];
        try {
             
            let response = await db.query( text, values );
            
            return true;
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
    }
    else {
        return false;
    }
};

/**
 * Saves a user (either as a new record if id is -1 or as an update if the id has a value)
 * checks for username and email uniqueness on the server side.
 * @param {User} record 
 * @returns emailVerificationToken if successful or false on failure.
 */
exports.saveUser = async function( record ) {

    // verify username and email does not already exist!
    if( record.id === -1 && ( await exports.verifyUsername( record.username ) || await exports.verifyEmail( record.email ) ) ) {
        // if username already exists exit
        console.log( "prevented username or email duplication that sliped by client!" );
        return false;
    }

    let currentEmail = await exports.verifyEmail( record.email );
    // if email exists do update, else create
    if( !currentEmail ) {
        // create a random hash for email varification
        const token = await crypto.randomBytes( 20 ).toString( 'hex' );

        // hash the token
        let emailVerificationToken = await crypto.createHash( 'sha256' ).update( token ).digest( 'hex' );

        let text = 'INSERT INTO users (email, username, profile_filename, email_token, email_validated, first_name, last_name, hashed_password, role_id, subscription_active, stripe_id, available_access_tokens, user_id)'
            + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)';
        let values = [ record.email, record.username, record.profileFilename, emailVerificationToken, record.emailValidated, record.firstName, record.lastName, record.hashedPassword, record.roleId, record.subscriptionActive, record.stripeId, 1, record.userId ];

        try {
             
            await db.query( text, values );
            
            
            // create the users role
            // get the new user
            let newUser = await exports.getUserByEmail( record.email );
            const uRole = await exports.getActiveRoleByName( "User" );
            // create the UserRole
            let userRole = UserRole.emptyUserRole();
            userRole.userId = newUser.userId;
            userRole.roleId = uRole.roleId;
            userRole.active = true;
            userRole.endTime = 'infinity';

            // create a user role record for this user
            exports.saveUserRole( userRole );

            return emailVerificationToken;
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
        
    }
    else {
        let text = 'UPDATE users SET first_name=$2, last_name=$3, subscription_active=$4 WHERE email=$1';
        let values = [ record.email, record.firstName, record.lastName, record.subscriptionActive ];

        try {
            
            await db.query( text, values );
            
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
        return true;
    }
    
};

exports.reValidateEmail = async function( email ) {
    // create a random hash for email varification
    const token = await crypto.randomBytes( 20 ).toString( 'hex' );

    // hash a new token
    let emailVerificationToken = await crypto.createHash( 'sha256' ).update( token ).digest( 'hex' );

    let text = 'UPDATE users SET email_token=$2 WHERE email=$1';
    let values = [ email, emailVerificationToken ];

    try {
         
        let response = await db.query( text, values );
        
        response.rows[0];
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
    return emailVerificationToken;

};

/**
 * Returns the active user matching a given id
 * 
 * @param {integer} id id to lookup
 * @returns User associated with id with an active status or false in none found.
 */
exports.getActiveUserById = async function( id ) {
    const text = "SELECT * FROM users WHERE user_id = $1;";
    const values = [ id ];
    
    try {
        console.log( "u-1" );
        let res = await db.query( text, values );
        console.log( "u-2" );
        if( res.rows.length > 0 ) {
            let user = User.ormUser( res.rows[0] );
            console.log( "u-1 user: " + JSON.stringify( user ) );

            // get roles for the user
            let userRoles = await exports.getActiveRolesForUserId( user.userId );

            // append the roles
            user.roles = userRoles;

            // note if the user is an admin 
            user.admin = await topicService.verifyUserHasAdminRole( user );

            // note if the user is a member
            user.member = await topicService.verifyUserHasMembershipAccessRole( user );

            // note if the user is a creator
            user.creator = await topicService.verifyUserHasCreatorAccessRole( user );

            // note if the user bought a 3pi
            user.codebot = await productService.verifyUserCodeBotPurchase( user );

            // get enrolled paths for user, 
            //let paths = await workspaceService.getActiveEnrolledWorkspacesForUserId(user.userId, false);

            // get completed paths for the user
            //let completedPaths = await workspaceService.getActiveEnrolledWorkspacesForUserId(user.userId, true);

            let enrollments = await workspaceService.getActiveEnrollmentsForUserId( user.userId );

            // get enrolled topics for user
            let topics = await topicService.getActiveTopicEnrollmentsForUserId( user.userId );    

            // note if the user is a member
            user.member = await topicService.verifyUserHasMembershipAccessRole( user );

            //append enrolled topics
            user.enrollments = enrollments;
            user.topicEnrollments = topics;

            return user;
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};




exports.getUserByUsername = async function( username ) {
    let text = "SELECT * FROM users WHERE LOWER(username) = LOWER($1)";
    let values = [ username ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return User.ormUser( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Returns the user matching a given stripeCustomerId returned with stripe customer
 * Note: This means that there should only be one row for each user with a particular stripe customer id. 
 * If a new row is created for a existing user a new stripe customer id should be generated and used!
 * @param {String} stripeCustomerId Stripe customer id to lookup
 * @returns User associated with stripe customer id or false in none found.
 */
exports.getUserByStripeCustomerId = async function( stripeCustomerId ) {
    const text = "SELECT * FROM users WHERE stripe_id = $1";
    const values = [ stripeCustomerId ];
    
    let user = null;
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return User.ormUser( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};


exports.getUserByEmail = async function( email ) {
    let text = "SELECT * FROM users WHERE LOWER(email) = LOWER($1)";
    let values = [ email ];
    
    try {
        // 
        let res = await db.query( text, values );
        //
        if( res.rows.length > 0 ) {
            return User.ormUser( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};


exports.getUserByEmailWithRoles = async function( email ) {
    let user = await exports.getUserByEmail( email );

    // get roles for the user
    let userRoles = await exports.getActiveRolesForUserId( user.userId );

    // append the roles
    user.roles = userRoles;

    return user;
};


exports.setUserSession = async function( email ) {
    let user = await exports.getUserByEmail( email );
    
    // get roles for the user
    let userRoles = await exports.getActiveRolesForUserId( user.userId );

    // append the roles
    user.roles = userRoles;

    // get enrolled paths for user, 
    //let paths = await workspaceService.getActiveEnrolledWorkspacesForUserId(user.userId, false);

    // get completed paths for the user
    //let completedPaths = await workspaceService.getActiveEnrolledWorkspacesForUserId(user.userId, true);

    let enrollments = await workspaceService.getActiveEnrollmentsForUserId( user.userId );

    // get enrolled topics for user
    let topics = await topicService.getActiveTopicEnrollmentsForUserId( user.userId );    

    // note if the user is a member
    user.member = await topicService.verifyUserHasMembershipAccessRole( user );

    //append enrolled topics
    user.enrollments = enrollments;
    user.topicEnrollments = topics;

    // created session
    // console.log("---------------------------------------------");
    // console.log("Session created: " + JSON.stringify(user));
    // console.log("---------------------------------------------");

    return user;
};

/**
 * Verifies if a user already exists with a passed email (case insensative)
 * @param {String} email 
 * @returns true if a user already exists having that email, false otherwise
 */
exports.verifyEmail = async function( email ) {
    let text = "SELECT * FROM users WHERE LOWER(email) = LOWER($1)";
    let values = [ email ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return true;
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }

};

/**
 * Verifies a user exists with the username passed (case insensative)
 * @param {String} username 
 * @returns True if a user already exists with that username, false otherwise
 */
exports.verifyUsername = async function( username ) {
    let text = "SELECT * FROM users WHERE LOWER(username) = LOWER($1)";
    let values = [ username ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            // check case insensitive!
            return true;
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }

};

/*
 * Update the user profile picture
 * This value is combined with the default directory stored in the env file
 */
exports.updateProfileFilename = async ( email, filename ) => {
    // get the user
    let user = await exports.getUserByEmail( email );

    // save the current filename so that we can delete it after.
    let prevFileName = "";

    if( user ) {
        try {
            // save the current filename so that we can delete it after.
            let text = "SELECT profile_filename FROM users WHERE email = $1";
            let values = [ email ];

             
            let res = await db.query( text, values );
            
            if( res.rows.length > 0 ) {
                prevFileName = res.rows[0].profile_filename;
            }

            text = "UPDATE users SET profile_filename = $2 WHERE email = $1";
            values = [ email, filename ];

        
            db.query( text, values );
            
        }
        catch( e ) {
            console.log( e.stack );
        }

        return prevFileName;
    }
    else {
        // invalid db response!
        return false;
    }
};

exports.createPasswordToken = async ( email ) => {
    // get the user
    let user = await exports.getUserByEmail( email );

    if( user ) {
        const token = await crypto.randomBytes( 20 ).toString( 'hex' );

        // hash the token
        let resetPasswordToken = await crypto.createHash( 'sha256' ).update( token ).digest( 'hex' );
        // set expire (1 day)
        let resetPasswordTokenExpiration = Date.now() + parseInt( process.env.PW_TOKEN_EXPIRATION );

        let text = "UPDATE users SET password_token = $2, password_token_expiration = $3 WHERE LOWER(email) = LOWER($1)";
        let values = [ email, resetPasswordToken, parseInt( resetPasswordTokenExpiration ) ];

        try {
             
            db.query( text, values );
            
        }
        catch( e ) {
            console.log( e.stack );
        }

        return resetPasswordToken;
    }
    else {
        // invalid user!
        return false;
    }
};

exports.verifyEmailTokenVerifyCombo = async ( email, token ) => {
    if( email && token ) {
        let text = "SELECT * FROM users WHERE email = $1 AND email_token = $2";
        let values = [ email, token ];
        
        try {
            
            let res = await db.query( text, values );
            if( res.rows.length > 0 ) {
                //update verify flag and cleanup
                let text = "UPDATE users SET email_validated = $3, email_token = $4 WHERE LOWER(email) = LOWER($1) AND email_token = $2";
                let values = [ email, token, true, "" ];
                
                try {
                    await db.query( text, values );
                    
                    return true;
                }
                catch( e ) {
                    
                    console.log( e.stack );
                    return false;
                }
            }
            else {
                
                return false;
            }
        }
        catch( e ) {
            
            console.log( e.stack );
            return false;
        }
    }
    else {
        return false;
    }
};

exports.verifyEmailTokenResetCombo = async ( email, token ) => {
    if( email && token ) {
        let text = "SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND password_token = $2";
        let values = [ email, token ];
        
        try {
            
            let res = await db.query( text, values );
            
            if( res.rows.length > 0 ) {
                // check that the token has not expired
                let tokenExp = res.rows[0].password_token_expiration;
                //console.log("token set to expire on: " + tokenExp + " current time: " + Date.now());
                if( Date.now() <= tokenExp ) {
                    return true;
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
    }
    else {
        return false;
    }
};

exports.resetPassword = async ( email, token, hashedPassword ) => {
    if( email && token && hashedPassword ) {

        let text = "UPDATE users SET hashed_password = $3, password_token = $4 WHERE LOWER(email) = LOWER($1) AND password_token = $2";
        let values = [ email, token, hashedPassword, "" ];
        
        try {
             
            let response = await db.query( text, values );
            
            return true;
        }
        catch( e ) {
            console.log( e.stack );
            return false;
        }
    }
    else {
        return false;
    }
};

exports.passwordHasher = async function( plainTxtPassword ) {
    return await bcrypt.hash( plainTxtPassword, saltRounds );
};

exports.checkPassword = async function( email, enteredPassword ) {
    let text = "SELECT * FROM users WHERE LOWER(email) = LOWER($1)";
    let values = [ email ];
    
    try {
        
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            let hashedSaltedPass = res.rows[0].hashed_password;            
            let auth =  bcrypt.compareSync( enteredPassword, hashedSaltedPass );
            
            if ( auth ) {
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};

exports.logUserSession = async function( userId, ipAddress, device ) {
    let text = 'INSERT INTO user_sessions (user_id, ip_address, client_type, client_name, client_version, client_engine, client_engine_version, os_name, os_version, os_platform, device_type, device_brand, device_model, bot)'
            + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)';

    // null checks on device    
    if( !device ) {
        device = { client:null, os:null, device:null, bot:null };
    }
    if ( !device.client ) {
        device.client = { type: "unknown", name: "unknown", version: "unknown", engineVersion: "unknown" };
    }
    if( !device.os ) {
        device.os = { name: "unknown", version: "unknown", platform: "unknown" };
    }
    if( !device.device ) {
        device.device = { type: "unknown", brand: "unknown", model: "unknown" };
    }
    
    let values = [ userId, ipAddress, device.client.type, device.client.name, device.client.version, device.client.engine, device.client.engineVersion, device.os.name, device.os.version, device.os.platform, device.device.type, device.device.brand, device.device.model, device.bot ];

    try {
         
        await db.query( text, values );
        return true;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};

exports.getRecentnewUserEvents = async function( limit ) {
    limit = ( !limit ) ? 10 : limit;
    let text = "select * from users order by create_time desc limit $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let recentUserEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].id;
                event.eventItem = "user";
                event.eventType = "New User";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].id + "'>" + res.rows[i].username + "</a> Just signed up!"; // TODO Say hello < TODO: STUB>! Add a link so that a user can use disscussions to say hi!
                event.eventImage = res.rows[i].profile_filename;

                recentUserEvents.push( event );

            }
        }
        else {
            return false;
        }
        return recentUserEvents;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
    
};

/**
 * Returns a list of the most recent supporting members of the site
 * @param {numer of entries from this list to include in the feed} limit 
 * @returns 
 */
exports.getRecentSupportingMembers = async function( limit ) {
    limit = ( !limit ) ? 10 : limit;
    let text = "select ur.user_role_id as user_role_id, r.role_id as role_id, ud.user_id as users_id, r.role_name as role_name, ud.username as username, ud.profile_filename as profile_filename, ur.create_time as create_time, ud.user_id as id "
     + "from user_roles ur inner join users as ud on ur.user_id = ud.user_id inner join roles as r on ur.role_id = r.role_id where ur.role_id in (3) and end_time > now() order by ur.create_time desc limit $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let recentUserEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].id;
                event.eventItem = "supporter";
                event.eventType = "New Founding Member";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].id + "'>" + res.rows[i].username + "</a> <span class='founder-event-card'>Became a Founding Member!!! Thank you for your support! &#127881;&#127881;</span>"; // TODO Say hello < TODO: STUB>! Add a link so that a user can use disscussions to say hi!
                event.eventImage = res.rows[i].profile_filename;

                recentUserEvents.push( event );

            }
        }
        else {
            return false;
        }
        return recentUserEvents;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
    
};