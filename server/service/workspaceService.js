/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const User = require( "../model/user" );
const Workspace = require( "../model/workspace" );
const Topic = require( "../model/topic" );
const WorkspaceEnrollment = require( "../model/workspaceEnrollment" );
const Event = require( '../model/event' );


/**
 * Retrieves all active workspaces with the highest version number that are either
 * public, owned by the requestor, or shared with the requesting user.
 * Retrvievs all workspaces
 * TODO: sharing is not implemented yet so currently this function will return 
 * all user workspaces and other public ones.
 * @returns List<Workspace>
 */
exports.getAllVisibleWorkspaces = async ( ownerId ) => {

    if( ownerId > -1 ) {

        //const text = "select * from workspaces where owned_by = $1 AND active = $2 AND (visibility = $3 OR visibility = $4) ORDER BY id"; ??
        const text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $2 group by id) goalmax on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version and (gl.owned_by = $1 OR gl.visibility = 0 ) order by gl.id;";
        const values = [ ownerId, true ];

        let workspaces = [];
        
        try {
            
            let res = await db.query( text, values );
            

            for( let i=0; i<res.rows.length; i++ ) {
                workspaces.push( Workspace.ormWorkspace( res.rows[i] ) );
            }

            return workspaces;
            
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
 * Returns all active workspaces including topics associated, that are either
 * public, owned by the requestor, or shared with the requesting user.
 * Retrvievs all workspaces
 * TODO: sharing is not implemented yet so currently this function will return 
 * all user workspaces and other public ones.
 * @returns List<workspace> with topics
 */
exports.getAllVisibleWorkspacesWithTopics = async ( ownerId ) => {

    if( ownerId > -1 ) {

        let text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 group by id) goalmax on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version and (gl.owned_by = $2 OR gl.visibility = 0 ) order by gl.id;";
        let values = [ true, ownerId ];

        let workspaces = [];
        
        try {
            
            let res = await db.query( text, values );
            for( let i=0; i<res.rows.length; i++ ) {
                text = "select * from goal_path where active = $1 and goal_rid = $2 order by position;";
                values = [ true, res.rows[i].rid ];
                let topics = [];
                let res2 = await db.query( text, values );

                for( let j=0; j<res2.rowCount; j++ ) {
                    text = "select * from topics where active = $1 and id = $2;";
                    values = [ true, res2.rows[j].topic_id ];

                    let res3 = await db.query( text, values );
                    if( res3.rows[0] ) {
                        topics.push( Topic.ormTopic( res3.rows[0] ) );
                    }
                    
                }
                let workspace = Workspace.ormWorkspace( res.rows[i] );
                workspace.topics = topics;
                
                workspaces.push( workspace );
            }

            
            return workspaces;
            
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
 * Retrieves all workspaces created by a particular owner with the highest version number
 * @param {Integer} ownerId - Id of the topic owner
 * @param {boolean} isActive - if true require that the topic is active to return, false returns all topics both active and in-active.
 * @returns All active workspaces as a list
 */
exports.getAllWorkspacesForOwner = async ( ownerId, isActive ) => {

    let text = "";
    let values = [];
    if( !isActive ) {
        text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version and gl.owned_by = $1 order by gl.id;";
        values = [ ownerId ];
    }
    else {
        // default to only retreiving active topics
        text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version and gl.owned_by = $2 order by gl.id;";
        values = [ true, ownerId ];
    }

    let workspaces = [];
    
    try {
         
        let res = await db.query( text, values );
        

        for( let i=0; i<res.rows.length; i++ ) {
            workspaces.push( Workspace.ormWorkspace( res.rows[i] ) );
        }

        return workspaces;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};


/**
 * Get an active workspace by id including associated topics
 * @param {Integer} workspaceId 
 * @param {boolean} isActive - if true require that the topic is active to return, false returns all topics both active and in-active.
 * @returns workspace with topics
 */
exports.getActiveWorkspaceWithTopicsById = async ( workspaceId, isActive ) => {

    let text = "";
    let values = [];
    if( !isActive ) {
        text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where id = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
        values = [ workspaceId ];
    }
    else {
        // default to only retreiving active topics
        text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 AND id = $2 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
        values = [ true, workspaceId ];
    }


    try {
        let workspace = null;
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            text = "select * from goal_path where active = $1 and goal_rid = $2 order by position;";
            values = [ true, res.rows[0].rid ];
            let topics = [];
            let res2 = await db.query( text, values );

            for( let j=0; j<res2.rowCount; j++ ) {
                text = "select * from topics where active = $1 and id = $2;";
                values = [ true, res2.rows[j].topic_id ];

                let res3 = await db.query( text, values );
                if( res3.rowCount > 0 ) {
                    topics.push( Topic.ormTopic( res3.rows[0] ) );
                }
                
            }
            workspace = Workspace.ormWorkspace( res.rows[0] );
            workspace.topics = topics;
               
        }

        return workspace;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Get the most recent version of an workspace by id
 * @param {Integer} workspaceId 
 * @returns workspace
 */
exports.getMostRecentWorkspaceById = async ( workspaceId ) => {
    let text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where id = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
    let values = [ workspaceId ];
    try {
        let workspace = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            workspace = Workspace.ormWorkspace( res.rows[0] );
                  
        }
        return workspace;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Get the most recent version of an workspace by id
 * @param {Integer} workspaceId 
 * @returns workspace
 */
exports.getWorkspaceById = async ( workspaceId ) => {
   
    let text = "select * from goals WHERE id = $1;";
    let values = [ workspaceId ];
    try {
        let workspace = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            workspace = Workspace.ormWorkspace( res.rows[0] );
                  
        }
       
        return workspace;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/*
 * Update / set the user workspace image
 * The previous filename that was overwritten (if any) is returned
 */
exports.updateWorkspaceImage = async ( workspaceId, filename ) => {
    // get the workspace (required to exist)
    let workspace = await exports.getMostRecentWorkspaceById( workspaceId );

    // save the current filename so that we can delete it after.
    let prevFileName = "";

    if( workspace ) {
        try {
            // retrieve the current filename so that we can delete it after.
            let text = "SELECT goal_image FROM goals WHERE rid = $1";
            let values = [ workspace.rid ];

            // perform the query
            let res = await db.query( text, values );
            
            // set the prevFileName with the prev name
            if( res.rows.length > 0 ) {
                prevFileName = res.rows[0].goal_image;
            }

            // create the update query to set the new name
            text = "UPDATE goals SET goal_image = $2 WHERE rid = $1";
            values = [ workspace.rid, filename ];

            // perform query
            await db.query( text, values );
            
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

/**
 * Saves a workspace to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Workspace} workspace 
 * @returns Workspace object with id 
 */
exports.saveWorkspace = async ( workspace ) => {
    // check to see if an id exists - insert / update check
    //console.log( "about to save workspace " + JSON.stringify( workspace ) );
    if( workspace ) {
        if( workspace.workspaceId > 0 ) {
            // update
            console.log( "[workspaceController.saveWorkspace]: Updating Workspace in DB - " + JSON.stringify( workspace ) );
            let text = "UPDATE goals SET goal_version = $1, goal_name = $2, goal_description = $3, active = $4, completable = $5, owned_by = $6, visibility = $7 WHERE id = $8 RETURNING rid;";
            let values = [ workspace.workspaceVersion, workspace.workspaceName, workspace.workspaceDescription, workspace.active, workspace.completable, workspace.ownedBy, workspace.visibility, workspace.workspaceId ];
    
            try {
                let res = await db.query( text, values );
                workspace.rid = res.rows[0].rid;
            }
            catch( e ) {
                console.log( "[ERR]: Error updating workspace - " + e );
                return false;
            }
            
        }
        else {
            // get the current max workspace id
            console.log( "[workspaceController.saveWorkspace]: New Workspace in DB - " + JSON.stringify( workspace ) );
            let text = "select max(id) from goals;";
            let values = [];
            try {
                let res = await db.query( text, values );
                workspace.workspaceId = res.rows[0].max; 
                workspace.workspaceId++;
                if( res.rowCount > 0 ) {
                    // insert
                    text = "INSERT INTO goals (id, goal_version, goal_name, goal_description, active, completable, owned_by, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, rid;";
                    values = [ workspace.workspaceId, workspace.workspaceVersion, workspace.workspaceName, workspace.workspaceDescription, workspace.active, workspace.completable, workspace.ownedBy, workspace.visibility ];
                    
                    let res2 = await db.query( text, values );
        
                    if( res2.rowCount > 0 ) {
                        workspace.workspaceId = res2.rows[0].id;
                        workspace.rid = res2.rows[0].rid;
                    }
                }
            }
            catch( e ) {
                console.log( "[ERR]: Error inserting workspace - " + e );
                return false;
            }
        }
        return workspace;
    }
    else {
        return false;
    }
};

/**
 * Will save or update pathway for workspace.  Pathway represents the topics associated with a workspace
 * and is passed as an Array of integers.  This function will replace any existing pathway for
 * the workspace with the topics represented by the topic id's passed.
 * @param {Integer} workspaceId id of the workspace for the pathway
 * @param {*} pathway Array of topic id's that make up the pathway
 * @returns true for success / false for failure
 */
exports.savePathwayToMostRecentWorkspaceVersion = async ( workspaceId, pathway ) => {
    // get the most recent version of the workspace
    let text = "SELECT rid, MAX(goal_version) as version from goals where id = $1 group by rid";
    let values = [ workspaceId ];

    try {
         
        let res = await db.query( text, values );
        
        if( res.rowCount > 0 ) {
            /**
             * TODO: the idea behind the workspace version was to keep track of changes to the pathway and not 
             * just delete it and replace it.  This way if students finished a workspace under with a particular 
             * pathway and completed but then the pathway changed after they would not be "incomplete" because
             * of the change.  This is will need to be explored, but for MVP I just want to work, as  it 
             * matures this should be re-evaluated.
             */
            // first remove current workspace enrollments
            text = "DELETE FROM goal_path WHERE goal_rid=$1";
            let values = [ res.rows[0].rid ];

            let res2 = await db.query( text, values );

            // now loop through the array and add the new pathway
            /**
             * TODO: is_required needs to be passed in from the UI so we are just making everything required for now.  
             * This probably means having the pathway be an array of objects containing id and isRequired
             */
            if( pathway && pathway.length > 0 ) {
                for( let i=0; i < pathway.length; i++ ) {
                    text = "INSERT INTO goal_path (goal_rid, topic_id, position, is_required, active) VALUES ($1, $2, $3, $4, $5);";
                    values = [ res.rows[0].rid, pathway[i], ( i + 1 ), true, true ];

                    let res3 = await db.query( text, values );
                }
            }
        }
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }


    return true;
};


/**
 * Add a user enrollment to the most recent version of a workspace 
 * @param {Integer} userId id of user to enroll
 * @param {Integer} workspaceId id of workspace
 * @returns true for successful operation or false if enrollment fails
 */
exports.saveWorkspaceEnrollmentMostRecentWorkspaceVersion = async ( userId, workspaceId ) => {
    // get the most recent version of the workspace
    let text = "SELECT rid, MAX(goal_version) as version from goals where id = $1 group by rid";
    let values = [ workspaceId ];

    try {
         
        let res = await db.query( text, values );
        
        if( res.rowCount > 0 ) {
            return exports.saveWorkspaceEnrollment( userId, workspaceId, res.rows[0].version );
            
        }
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};

/**
 * Add a user enrollment to the specified version of a workspace 
 * @param {Integer} userId id of user to enroll
 * @param {Integer} workspaceId id of workspace (Workspace identifier is id + version)
 * @param {Integer} workspaceVersion version of workspace
 * @returns true for successful operation or false if enrollment fails
 */
exports.saveWorkspaceEnrollment = async ( userId, workspaceRid, workspaceVersion ) => {
    // check this userId and workspaceRid combination does not already exist
    let text = "SELECT * FROM user_goal WHERE active = $1 AND user_id = $2 AND goal_rid = $3";
    let values = [ true, userId, workspaceRid ];

    try {
         
        let response = await db.query( text, values );

        if( !response.rowCount > 0 ) {       
            text = 'INSERT INTO user_goal(goal_rid, user_id, active, is_completed)'
                + 'VALUES($1, $2, $3, $4)';
            values = [ workspaceRid, userId, true, false ];

            let response = await db.query( text, values );
    
        }
        else {
            console.log( "Duplicate user_workspace not saved!!" );
        }
        
        return true;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};

/**
 * Update the user workspace enrollment and mark completed.
 * @param {Integer} userId 
 * @param {Integer} workspaceId 
 * @param {Integer} workspaceVersion 
 * @returns true if successful
 */
exports.completeWorkspaceEnrollment = async ( userId, workspaceRid ) => {
    let text = "UPDATE user_goal SET is_completed = $1, completed_date = NOW() WHERE active = $2 AND user_id = $3 AND goal_rid = $4;";
    let values = [ true, true, userId, workspaceRid ];

    try {
        let response = await db.query( text, values );
        return true;
    }
    catch( e ) {
        console.log( "[ERR]: Error updating workspace enrollment - " + e );
        return false;
    }
};

/**
 * Gets a workspace by workspace id and version if the user id passed is currently enrolled in the workspace.
 * @param {Integer} userId 
 * @param {Integer} workspaceId 
 * @param {Integer} workspaceVersion 
 * @returns workspace if the user is actively enrolled
 */
exports.getEnrolledWorkspaceByUserAndWorkspaceRid = async ( userId, workspaceRid ) => {
    console.log( "params: userId " + userId + " workspaceRid: " + workspaceRid );
    let text = "SELECT ug.* FROM user_goal ug where ug.user_id = $1 AND ug.goal_rid = $2 and active = $3;";
    let values = [ userId, workspaceRid, true ];
    
    let workspace;
    try {
         
        let res = await db.query( text, values );
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                // get the workspace for each user_workspace
                text = "SELECT * FROM goals WHERE active = $1 AND rid = $2;";
                values = [ true, res.rows[i].goal_rid ];

                let res2 = await db.query( text, values );

                if( res2.rows.length > 0 ) {
                    workspace = Workspace.ormWorkspace( res2.rows[0] );
                }     
            }

        }
        else {
            return false;
        }
        return workspace ;
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Get all workspaces that a user has an active enrollment in either completed or incomplete
 * Returns the workspace with the highest version number
 * if the user has more then one record for the same workspace id.
 * @param {boolean} isCompleted whether or not the function should return completed enrollements
 * @param {Integer} userId id of user enrolled
 * @returns List<workspace> a list of the workspace objects the user is enrolled in
 *
 * @deprecated testing
 * This was replaced using getActiveEnrollmentsForUserId which returns the users enrollment in the workspace path with an attached workspace
 * this way the enrollment provides the completion data.
 * 
 exports.getActiveEnrolledWorkspacesForUserId = async function(userId, isCompleted) {
    let text = "SELECT ug.* FROM user_workspace ug INNER JOIN " 
        + "(SELECT user_id, workspace_id, MAX(workspace_version) AS max_version FROM user_workspace where user_id = $2 and active = $1 GROUP BY user_id, workspace_id) groupedug " 
        + " ON ug.user_id = groupedug.user_id AND ug.workspace_id = groupedug.workspace_id AND ug.workspace_version = groupedug.max_version and ug.is_completed = $3;";
    let values = [ true, userId , isCompleted ];
    
    let workspaces = [];
    try {
         
        let res = await db.query(text, values);
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                // get the workspace for each user_workspace
                text = "SELECT * FROM workspaces WHERE active = $1 AND id = $2 AND workspace_version = $3;"
                values = [true, res.rows[i].workspace_id, res.rows[i].workspace_version ];

                let res2 = await db.query(text, values);

                if(res2.rows.length > 0) {
                    workspaces.push(Workspace.ormWorkspace(res2.rows[0]));
                }     
            }

        }
        else {
            return false;
        }
        return workspaces;
    }
    catch(e) {
        console.log(e.stack)
    }
}
*/

/**
 * Get all enrollments (workspace is accessable enrollment.workspace) that a user is actively enrolled in
 * Returns the workspace with the highest version number
 * if the user has more then one record for the same workspace id.
 * @param {Integer} userId id of user enrolled
 * @returns List<workspace> a list of the workspace objects the user is enrolled in
 */
exports.getActiveEnrollmentsForUserId = async ( userId ) => {

    let text = "select * from user_goal where user_id = $1 and active = $2;";
    let values = [ userId, true ];

    // this one was the last query used when workspace_version was part of the workspaces key and part of the foriegn key of user_workspace.

    // let text = "SELECT ug.* FROM user_workspace ug INNER JOIN " 
    //     + "(SELECT user_id, workspace_id, MAX(workspace_version) AS max_version FROM user_workspace where user_id = $2 and active = $1 GROUP BY user_id, workspace_id) groupedug " 
    //     + " ON ug.user_id = groupedug.user_id AND ug.workspace_id = groupedug.workspace_id AND ug.workspace_version = groupedug.max_version;";
    // ---- end last one used

    // get active enrollments, also check the the workspace itself is active!
    // let text = "SELECT ug.*, g.active as g_active, g.id as g_id FROM user_workspace ug "
    //     + "INNER JOIN (SELECT user_id, workspace_id, MAX(workspace_version) AS max_version FROM user_workspace where user_id = $2 and active = $1 GROUP BY user_id, workspace_id) "
    //     + "groupedug ON ug.user_id = groupedug.user_id AND ug.workspace_id = groupedug.workspace_id AND ug.workspace_version = groupedug.max_version "
    //     + "INNER JOIN workspaces AS g ON ug.workspace_id = g.id AND ug.workspace_version = groupedug.max_version AND g.active = $1;"
    // note this is historical, upon testing I realized that implementing this code meant that completed workspaces were not showing up in users profiles and in feeds
    // so the approach taken was to have all active / inactive workspaces returned if the user has been enrolled and use workspace.active to filter in the views where showing
    // the workspace is not desirable 
    
    let enrollments = [];
    try {
         
        let res = await db.query( text, values );
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let enrollment = WorkspaceEnrollment.ormWorkspaceEnrollment( res.rows[i] );

                // get the workspace for each user_workspace
                text = "SELECT * FROM goals WHERE rid = $1;";
                values = [ res.rows[i].goal_rid ];

                let res2 = await db.query( text, values );

                if( res2.rows.length > 0 ) {
                    enrollment.workspace = Workspace.ormWorkspace( res2.rows[0] );
                } 
                
                enrollments.push( enrollment );
            }

        }
        else {
            return false;
        }
        return enrollments;
    }
    catch( e ) {
        console.log( e.stack );
    }
};


exports.getRecentWorkspaceEnrollmentEvents = async ( limit ) => {
    limit = ( !limit ) ? 10 : limit;
    let text = "select ud.id as user_id, ud.username as username, ud.profile_filename as user_image, mod.rid as goal_id, mod.goal_name as goal_name, mod.goal_image as goal_image, mode.create_time as create_time from users ud, goals mod, user_goal mode where mode.user_id = ud.id AND mode.goal_rid = mod.rid and mode.active = true ORDER BY mode.create_time desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let enrollmentEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].goal_rid;
                event.eventItem = "Workspace Enrollment";
                event.eventType = "Workspace Enrollment";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a> <span style='color:darkblue'>Enrolled in <img src='" + process.env.GOAL_IMAGE_WEB_PATH + res.rows[i].goal_image + "' alt='Workspace Badge' title='Workspace Badge' class='profile-top-image' /> </span><a href='/community/workspace/" + res.rows[i].goal_id + "'>" + res.rows[i].goal_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].goal_image;
                enrollmentEvents.push( event );
            }
        }
        else {
            return false;
        }
        return enrollmentEvents;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }  
};

exports.deleteWorkspaceById = async ( workspaceId, ownerId ) => {
    let text = "DELETE FROM goals WHERE id = $1 AND owned_by = $2";
    let values = [ workspaceId, ownerId ];

    try {
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            return true;
        }
        else {
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
        return false;
    }
};

exports.getRecentWorkspaceCompletionEvents = async ( limit ) => {
    limit = ( !limit ) ? 10 : limit;
    let text = "select ud.id as user_id, ud.username as username, ud.profile_filename as user_image, mod.rid as goal_rid, mod.goal_name as goal_name, mod.goal_image as goal_image, mode.completed_date as completed_date from users ud, goals mod, user_goal mode where mode.user_id = ud.id AND mode.goal_rid = mod.rid and mode.active = true AND mode.is_completed = true ORDER BY mode.completed_date desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let enrollmentEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].goal_rid;
                event.eventItem = "Workspace Completion!";
                event.eventType = "Workspace Completion!";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].completed_date;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a><span style='color:darkgreen'><strong> completed </strong></span> <img src='" + process.env.GOAL_IMAGE_WEB_PATH + res.rows[i].goal_image + "' alt='Workspace Badge' title='Workspace Badge' class='profile-top-image' /> <a href='/community/workspace/" + res.rows[i].goal_id + "'>" + res.rows[i].goal_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].goal_image;
                enrollmentEvents.push( event );
            }
        }
        else {
            return false;
        }
        return enrollmentEvents;
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }  
};
// Takes in a workspaceId and finds each topicId associated with it.
exports.getAllTopicsIdsForWorkspace = async function ( workspaceId ) {

    let text = "SELECT * from goal_path where id = $1";
    let values = [ workspaceId ];
    let topicIds = [];

    try {

        let res = await db.query( text, values );

        // console.log( " RESPONSE : " + JSON.stringify( res ) );
        if ( res.rowCount > 0 ){
            for ( let i=0; i<res.rowCount; i++ ){
                topicIds[i] = res.rows[i].topic_id;
            }
        }

    }
    catch ( e ) {
        console.log( e.stack );
        return false;
    }

    return topicIds;
       
};