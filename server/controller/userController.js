// import model
const User = require( "../model/user" );

// import services
const userService = require( "../service/userService" );
const stripeService = require( "../service/stripeService" );

// dependencies
const nodemailer = require( "nodemailer" );
const fs = require( 'fs' );
let path = require( 'path' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const IMAGE_PATH = process.env.AVATAR_IMAGE_PATH;

exports.orcidSignUpPassthrough = async function(req, res) {
    if (!res.headersSent) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    res.render( 'orcid-sign-up-loading' );
} 

exports.orcidSignUp = async function( req, res ) {
    if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json; charset=utf-8")
    }
    

    // TODO: Get email from ORCID user record
    const orcidID = req.body.orcidId.replace('https://sandbox.orcid.org/', ''); // "0000-0003-4863-649X";

    const apiUrl = `/v3.0/${orcidID}/email`;

    let xmlString = '';

    const http = require("https");

    const options = {
    "method": "GET",
    "hostname": "pub.sandbox.orcid.org",
    "port": null,
    "path": apiUrl,
    "headers": {
        "Accept": "*/*",
    }
    };

    const HTTPreq = http.request(options, function (HTTPres) {
        const chunks = [];

        HTTPres.on("data", function (chunk) {
            chunks.push(chunk);
        });

        HTTPres.on("end", function () {
            const body = Buffer.concat(chunks);
            //console.log(body.toString());
            xmlString = body.toString();

            const { DOMParser } = require('xmldom');

            // Parse the XML string
            var parser = new DOMParser();
            var xmlDoc = parser.parseFromString(xmlString, "text/xml");

            // Get all email elements
            var emailElements = xmlDoc.getElementsByTagName("email:email");
            
            for (var i = 0; i < emailElements.length; i++) {
                var emailElement = emailElements[i];
                var email = getEmailAddress(emailElement);
                const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
                if (emailPattern.test(email)){
                    createOrcidAccount(email);
                    break;
                }
            }
            
            if (emailElements.length === 0){
                //console.log('No email found in ORCID record');
                res.end(JSON.stringify({"redirect": "/user/orcid-user-issue"}));
            }
            
            function getEmailAddress(emailElement) {
                var emailNodes = emailElement.childNodes;
                for (var i = 0; i < emailNodes.length; i++) {
                    var node = emailNodes[i];
                    if (node.nodeType === 3) { // Text node
                        return node.textContent.trim();
                    }
                }
                return null;
            }
        });
    });

    async function createOrcidAccount(primaryEmail) {
        const userid = req.body.orcidGivenName;

        let profileImage = 'profile-default.png';
        
        // randomly generate a 7 character extesion
        const extension = createRandomExtension( 7 );
        const usename = req.body.orcidGivenName + "-" + extension;
        createUser(primaryEmail, usename, req.body.orcidGivenName, req.body.orcidFamilyName, req.body.orcidIdToken, profileImage, req, res, false, true);                
    }

    HTTPreq.end();
    
    //res.end(JSON.stringify({"redirect": "/about"}))


};

const { OAuth2Client } = require( 'google-auth-library' );

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client( '${process.env.GOOGLE_CLIENT_ID}' );


exports.googleSignUp = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    req.session.messageType = null;
    req.session.messageTitle = null;
    req.session.messageBody = null;


    if( req.body.credential ) {
        const ticket = await client.verifyIdToken( {
            idToken: req.body.credential,
            audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        } );
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        let profileImage = 'profile-default.png';
        if( payload['picture'] ) {
            profileImage = payload['picture'];
        }

        // randomly generate a 7 character extesion
        const extension = createRandomExtension( 7 );
        const usename = payload['given_name'] + "-" + extension;

        createUser( payload['email'], usename, payload['given_name'], payload['family_name'], req.body.credential, profileImage, req, res, true );
        
    }
    else {
        res.render( 'user-signup', {error_message: "Google Authentication failure"} );
    }


};


exports.createUserForm = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );

    if( req && req.body ) {
        if( req.body.userEmail ) {

            // create model
            let email = req.body.userEmail;
            let username = req.body.userUsername;
            let firstName = req.body.firstName;
            let lastName = req.body.lastName;

            let profileImage = 'profile-default.png';
            
            createUser( email, username, firstName, lastName, req.body.psw, profileImage, req, res, false );

        }
        else {
            res.render( 'user-signup', {error_message: "Error signing up!"} );
        }
    }
    else {
        res.render( 'user-signup', {error_message: "Error Siging up!"} );
    }
};

/**
 * Creates a user
 * @param {} req 
 * @param {*} res 
 */
const createUser = async function( email, username, firstName, lastName, password, profileImage, req, res, isGoogle, isOrcid ) {
    let user = "";

    let subscriptionActive = true;

    // create a stripe account and retrieve the generated id
    let fullname = firstName + " " + lastName;
    
    let stripeId = "null";
    if( process.env.STRIPE_TOGGLE == "true" ) {
        stripeId = await stripeService.createStripeCustomer( email, fullname );
    }
    
    let hashedPassword = await userService.passwordHasher( password );

    let emailValidated = false;

    if( isGoogle || isOrcid ) {
        emailValidated = true;
    }

    user = User.createUser( email, username, profileImage, emailValidated, firstName, lastName, hashedPassword, 0, subscriptionActive, stripeId, 0 );
    
    // save the user to the database!
    userService.saveUser( user ).then( ( insertResult ) => {
        if( email && insertResult ) {
            // send verification email
            if( process.env.EMAIL_TOGGLE == "true" && !isGoogle ) {
                let secure = ( process.env.EMAIL_SECURE === 'true' );
                let transporter = nodemailer.createTransport( {
                    host: process.env.EMAIL_HOST,
                    secure: secure,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                } );

                let siteUrl = "";
                if( process.env.SITE_PORT && process.env.SITE_PORT > 0 ) {
                    siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' +process.env.SITE_PORT;
                }
                else {
                    siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST;
                }

                const mailOptions = {
                    from: process.env.EMAIL_FROM, // sender address
                    to: email,
                    subject: "Verify your email", // Subject line
                    html: "<p>Hello, we hope this email finds you well!</p>"
                        + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                        + "Complete the process by <strong><a href='" + siteUrl + "/verifyEmail/" + email + "/" + insertResult + "'>clicking this link!</a></strong></p>"
                        + "<p>Carpe Diem!</p>"
                        + "<p>The Agora Team</p>", // plain text body
                };

                transporter.sendMail( mailOptions, function( err, info ) {

                    if ( err ) {
                        // handle error
                        console.log( err );
                    }
                } );

                if( req.query.redirect ) {
                    res.render( 'user-welcome', { redirect: req.query.redirect, message: "Please check your email for our verification to complete the process!" } );
                }
                else {
                    res.render( 'user-welcome', { message: "Please check your email for our verification to complete the process!" } );
                }
            }
            else {
                if( !isGoogle && !isOrcid) {
                    console.log( "[WARN] Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" );
                    if( req.query.redirect ) {
                        res.render( 'user-welcome', { redirect: req.query.redirect, message: "Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" } );
                    }
                    else {
                        res.render( 'user-welcome', { message: "Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" } );
                    }
                }
                else if(isOrcid){
                    res.end(JSON.stringify({"redirect": "/signin"})) //res.render("user-signup", {message: "Login with orcid"} );
                }
                else {
                    res.redirect( 307, "/google-auth" );
                }
                    
            }
            
            
        }
        else if( !insertResult ) {
            res.render( 'user-signup', {error_message: "Email account already exists in Agora! (Perhaps you signed up using Google?)"} );

        }
        else {
            res.render( 'user-signup', {error_message: "Error creating account"} );
        }
    } );
        
        
    
};

exports.updateUser = async function( req, res ){

    res.setHeader( 'Content-Type', 'text/html' );
    let user = "";

    if( req && req.body ) {
        // create model
        let email = req.body.manageEmail;

        // get current user
        let user = await userService.getUserByEmail( email );

        let subscriptionActive = ( req.body.subscriptionActive == "on" ) ? true : false;

        user.email = email;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.subscriptionActive =subscriptionActive;

        // TODO:Tags may need to parsed here when form is submitted, previously interests were done here.

        // save the user to the database!
        userService.saveUser( user ).then( () => {
            req.session.reload( () => {
                req.session.authUser = user;

                // TODO: can this be removed to make this a pure API, how will the profile page refresh
                res.redirect( 303, "/profile/manageProfile" );
            } );

        } );
    }
    else {
        // TODO: can this be removed to make this a pure API, how will the profile page refresh
        res.redirect( 303, "/userError" );
    }
    
};

exports.reValidateEmail = async function( req, res ) {
    // check to see that user is logged in with matching email address
    if( req.session.authUser.email && req.params.email === req.session.authUser.email ) {
        let newToken = await userService.reValidateEmail( req.session.authUser.email );

        if( process.env.EMAIL_TOGGLE == "true" ) {
            // send verification email
            let secure = ( process.env.EMAIL_SECURE === 'true' );
            let transporter = nodemailer.createTransport( {
                host: process.env.EMAIL_HOST,
                secure: secure,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL,
                    pass: process.env.EMAIL_PASSWORD,
                },
            } );

            let siteUrl = "";
            if( process.env.SITE_PORT && process.env.SITE_PORT > 0 ) {
                siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' +process.env.SITE_PORT;
            }
            else {
                siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST;
            }

            const mailOptions = {
                from: process.env.EMAIL_FROM, // sender address
                to: req.session.authUser.email,
                subject: "Verify your email", // Subject line
                html: "<p>Hello, we hope this email finds you well!</p>"
                    + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                    + "Complete the process by <strong><a href='" + siteUrl + "/verifyEmail/" + req.session.authUser.email + "/" + newToken + "'>clicking this link!</a></strong></p>"
                    + "<p>Carpe Diem!</p>"
                    + "<p>The Agora Team</p>", // plain text body
            };

            transporter.sendMail( mailOptions, function( err, info ) {

                if ( err ) {
                    // handle error
                    console.log( err );
                }
            } );

            res.render( 'user-welcome', { message: "Please check your email for our verification to complete the process!" } );
        }
        else {
            res.render( 'user-welcome', { message: "re-validate email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" } );
            console.log( "[WARN] re-validate email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" );
        }
        
        

    }
    else {
        res.render( 'user-error' );
    }
};





exports.saveProfileImage = async function( req, res, email, filename ) {

    console.log( "upload 2!" );
    
    // save image in db and delete old file  
    if( email ) {
        userService.updateProfileFilename( email, filename ).then( async ( rValue ) => {
            console.log( "rValue: " + rValue );
            if( rValue && ( rValue != 'profile-default.png' ) ) {
                await fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[userController] file delete error status: " + err );
                        return false;
                    }
                    else {
                        return true;
                    }
                    
                } );
            } 
            else {
                return true;
            }

        } );
    }
    
    
};

function createRandomExtension( length ) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while ( counter < length ) {
        result += characters.charAt( Math.floor( Math.random() * charactersLength ) );
        counter += 1;
    }
    return result;
}


