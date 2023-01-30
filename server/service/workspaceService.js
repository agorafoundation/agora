/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
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

    if( ownerId ) {

        //const text = "select * from workspaces where owned_by = $1 AND active = $2 AND (visibility = $3 OR visibility = $4) ORDER BY id"; ??
        const text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where active = $2 group by workspace_id) goalmax on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version and (gl.owned_by = $1 OR gl.visibility = 'public' ) order by gl.workspace_id;";
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
            console.log( "[ERR]: Error getting visible workspaces - " + e );
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

    if( ownerId ) {

        let text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where active = $1 group by workspace_id) goalmax on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version and (gl.owned_by = $2 OR gl.visibility = 'public' ) order by gl.workspace_id;";
        let values = [ true, ownerId ];

        let workspaces = [];
        
        try {
            
            let res = await db.query( text, values );
            for( let i=0; i<res.rows.length; i++ ) {
                text = "select * from workspace_paths where active = $1 and workspace_rid = $2 order by position;";
                values = [ true, res.rows[i].workspace_rid ];
                let topics = [];
                let res2 = await db.query( text, values );

                for( let j=0; j<res2.rowCount; j++ ) {
                    text = "select * from topics where active = $1 and topic_id = $2;";
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
            console.log( "[ERR]: Error getting visible workspaces with topics - " + e );
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
        text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces group by workspace_id) goalmax "
        + "on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version and gl.owned_by = $1 order by gl.workspace_id;";
        values = [ ownerId ];
    }
    else {
        // default to only retreiving active topics
        text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where active = $1 group by workspace_id) goalmax "
        + "on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version and gl.owned_by = $2 order by gl.workspace_id;";
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
        console.log( "[ERR]: Error getting all workspaces for owner - " + e );
        return false;
    }
};


/**
 * Get an active workspace by id including associated topics
 * @param {Integer} workspaceId
 * @param {Integer} ownerId - the ID of the requester, used to validate visibility
 * @param {boolean} isActive - if true require that the topic is active to return, false returns all topics both active and in-active.
 * @returns workspace with topics
 */
exports.getActiveWorkspaceWithTopicsById = async ( workspaceId, ownerId, isActive ) => {

    let text = "";
    let values = [];
    if( !isActive ) {
        text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where workspace_id = $1 AND (owned_by = $2 OR visibility = 'public') group by workspace_id) goalmax "
        + "on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version order by gl.workspace_id;";
        values = [ workspaceId, ownerId ];
    }
    else {
        // default to only retreiving active topics
        text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where active = $1 AND workspace_id = $2 AND (owned_by = $3 OR visibility = 'public') group by workspace_id) goalmax "
        + "on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version order by gl.workspace_id;";
        values = [ true, workspaceId, ownerId ];
    }


    try {
        let workspace = null;
        //console.log( " text: " + text + " values: " + values );
        let res = await db.query( text, values );
        //console.log( " res.rowCount: " + res.rowCount + "" );
        if( res.rowCount > 0 ) {
            text = "select * from workspace_paths where active = $1 and workspace_rid = $2 order by position;";
            values = [ true, res.rows[0].workspace_rid ];
            let topics = [];
            let res2 = await db.query( text, values );

            for( let j=0; j<res2.rowCount; j++ ) {
                text = "select * from topics where active = $1 and topic_id = $2;";
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
        console.log( "[ERR]: Error getting active workspaces with topics by id - " + e );
        return false;
    }
};

/**
 * Get the most recent version of an workspace by id
 * @param {Integer} workspaceId 
 * @returns workspace
 */
exports.getMostRecentWorkspaceById = async ( workspaceId ) => {
    let text = "select * from workspaces gl INNER JOIN (SELECT workspace_id, MAX(workspace_version) AS max_version FROM workspaces where workspace_id = $1 group by workspace_id) goalmax "
        + "on gl.workspace_id = goalmax.workspace_id AND gl.workspace_version = goalmax.max_version order by gl.workspace_id;";
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
        console.log( "[ERR]: getting most recent workspace by Id - " + e );
        return false;
    }
};

/**
 * Get the most recent version of an workspace by id
 * @param {Integer} workspaceId 
 * @returns workspace
 */
exports.getWorkspaceById = async ( workspaceId ) => {
   
    let text = "select * from workspaces WHERE workspace_id = $1;";
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
        console.log( "[ERR]: Error getting workspace by Id - " + e );
        return false;
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
            let text = "SELECT workspace_image FROM workspaces WHERE workspace_rid = $1";
            let values = [ workspace.workspaceRid ];

            // perform the query
            let res = await db.query( text, values );
            
            // set the prevFileName with the prev name
            if( res.rows.length > 0 ) {
                prevFileName = res.rows[0].workspace_image;
            }

            // create the update query to set the new name
            text = "UPDATE workspaces SET workspace_image = $2 WHERE workspace_rid = $1";
            values = [ workspace.workspaceRid, filename ];

            // perform query
            await db.query( text, values );
            
        }
        catch( e ) {
            console.log( "[ERR]: Error updating workspace image - " + e );
            return false;
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
        // query to see if the workspace exists
        let text = "SELECT * FROM workspaces WHERE workspace_id = $1";
        let values = [ workspace.workspaceId ];
        try {
            let res = await db.query( text, values );
            if( res.rowCount > 0 ) {
                // row exists, update
                //console.log( "[workspaceController.saveWorkspace]: Updating Workspace in DB - " + JSON.stringify( workspace ) + " id : " + workspace.workspaceId );
                text = "UPDATE workspaces SET workspace_version = $1, workspace_name = $2, workspace_description = $3, active = $4, completable = $5, owned_by = $6, visibility = $7 WHERE workspace_id = $8 RETURNING workspace_rid;";
                values = [ workspace.workspaceVersion, workspace.workspaceName, workspace.workspaceDescription, workspace.active, workspace.completable, workspace.ownedBy, workspace.visibility, workspace.workspaceId ];
    
                try {
                    res = await db.query( text, values );
                    workspace.workspaceRid = res.rows[0].workspace_rid;
                }
                catch( e ) {
                    console.log( "[ERR]: Error updating workspace - " + e );
                    return false;
                }
            }
            else {
                // row does not exist, insert
                text = "INSERT INTO workspaces (workspace_id, workspace_version, workspace_name, workspace_description, active, completable, owned_by, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING workspace_id, workspace_rid;";
                values = [ workspace.workspaceId, workspace.workspaceVersion, workspace.workspaceName, workspace.workspaceDescription, workspace.active, workspace.completable, workspace.ownedBy, workspace.visibility ];
            
                try {
                    res = await db.query( text, values );
                }
                catch( e ) {
                    console.log( "[ERR]: Error inserting workspace - " + e );
                    return false;
                }

                if( res.rowCount > 0 ) {
                    workspace.workspaceId = res.rows[0].workspace_id;
                    workspace.workspaceRid = res.rows[0].workspace_rid;
                }
            }

        }
        catch( e ) {
            console.log( "[ERR]: Error querying to determine if workspace exists - " + e );
            return false;
        }

        
        return workspace;
    }
    else {
        return false;
    }
};


/**
 * Will save or update topics associated with a workspace.  
 * Topics are passed as an Array of integers.  This function will replace any existing topics for
 * the workspace with the topics represented by the topic id's passed.
 * @param {Integer} workspaceRid id of the topic 
 * @param {*} topicIds Array of topic id's to be associated with the woorkspace
 * @returns true for success / false for failure
 */                                               
exports.saveTopicsForWorkspace = async function( workspaceRid, topicIds, topicsRequired ) {
    // get the most recent version of the workspace
    let text = "SELECT * from workspaces where workspace_rid = $1";
    let values = [ workspaceRid ];
    try {
         
        let res = await db.query( text, values );
        
        if( res.rowCount > 0 ) {

            // first remove current resources associated with the topic
            text = "DELETE FROM workspace_paths WHERE workspace_rid = $1";
            values = [ res.rows[0].workspace_rid ];

            try {
                let res2 = await db.query( text, values );

                // now loop through the array and add the new topics
                /**
                 * TODO: is_required needs to be passed in from the UI so we are just making everything required for now.  
                 * This probably means having the pathway be an array of objects containing id and isRequired
                 */
                if( topicIds && topicIds.length > 0 ) {
                    for( let i=0; i < topicIds.length; i++ ) {  

                        let isRequired = true;
                        // always setting to true for now
                        //if( topicsRequired.length > i ) {  
                        //    isRequired = topicsRequired[i];
                        //}

                        text = "INSERT INTO workspace_paths (workspace_rid, topic_id, position, is_required, active) VALUES ($1, $2, $3, $4, $5);";
                        values = [ workspaceRid, topicIds[i], ( i + 1 ), true, true ];

                        try{
                            let res3 = await db.query( text, values );

                        }
                        catch( e ) {
                            console.log( "[ERR]: Error inserting workspace_path - " + e );
                            return false;
                        }
                    }
                }
            }
            catch( e ) {
                console.log( "[ERR]: Error deleting workspace paths - " + e );
                return false;
            }
            
        }
    }
    catch( e ) {
        console.log( "[ERR]: Error looking up workspace by id - " + e );
        return false;
    }

    return true;
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
    let text = "SELECT workspace_rid, MAX(workspace_version) as version from workspaces where workspace_id = $1 group by workspace_rid";
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
            text = "DELETE FROM workspace_paths WHERE workspace_rid=$1";
            let values = [ res.rows[0].workspace_rid ];

            let res2 = await db.query( text, values );

            // now loop through the array and add the new pathway
            /**
             * TODO: is_required needs to be passed in from the UI so we are just making everything required for now.  
             * This probably means having the pathway be an array of objects containing id and isRequired
             */
            if( pathway && pathway.length > 0 ) {
                for( let i=0; i < pathway.length; i++ ) {
                    text = "INSERT INTO workspace_paths (workspace_rid, topic_id, position, is_required, active) VALUES ($1, $2, $3, $4, $5);";
                    values = [ res.rows[0].workspace_rid, pathway[i], ( i + 1 ), true, true ];

                    let res3 = await db.query( text, values );
                }
            }
        }
    }
    catch( e ) {
        console.log( "[ERR]: [workspace] - save path to most recent version - " + e );
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
    let text = "SELECT workspace_rid, MAX(workspace_version) as version from workspaces where workspace_id = $1 group by workspace_rid";
    let values = [ workspaceId ];

    try {
         
        let res = await db.query( text, values );
        
        if( res.rowCount > 0 ) {
            return exports.saveWorkspaceEnrollment( userId, workspaceId, res.rows[0].version );
            
        }
    }
    catch( e ) {
        console.log( "[ERR]: [workspace] - save workspace enrollment most recent version - " + e );
        return false;
    }
};

/**
 * Add a user enrollment to the specified version of a workspace 
 * @param {Integer} userId id of user to enroll
 * @param {Integer} workspaceRid rid of workspace (Workspace unique identifier)
 * @returns true for successful operation or false if enrollment fails
 */
exports.saveWorkspaceEnrollment = async ( userId, workspaceRid ) => {
    // check this userId and workspaceRid combination does not already exist
    let text = "SELECT * FROM user_workspaces WHERE active = $1 AND user_id = $2 AND workspace_rid = $3";
    let values = [ true, userId, workspaceRid ];

    try {
         
        let response = await db.query( text, values );

        if( !response.rowCount > 0 ) {       
            text = 'INSERT INTO user_workspaces (workspace_rid, user_id, active, is_completed)'
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
        console.log( "[ERR]: [workspace] - save workspace enrollment - " + e );
        return false;
    }
};

/**
 * Update the user workspace enrollment and mark completed.
 * @param {Integer} userId 
 * @param {Integer} workspaceRid 
 * @returns true if successful
 */
exports.completeWorkspaceEnrollment = async ( userId, workspaceRid ) => {
    let text = "UPDATE user_workspaces SET is_completed = $1, completed_date = NOW() WHERE active = $2 AND user_id = $3 AND workspace_rid = $4;";
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
 * @param {Integer} workspaceRid 
 * @returns workspace if the user is actively enrolled
 */
exports.getEnrolledWorkspaceByUserAndWorkspaceRid = async ( userId, workspaceRid ) => {
    console.log( "params: userId " + userId + " workspaceRid: " + workspaceRid );
    let text = "SELECT ug.* FROM user_workspaces ug where ug.user_id = $1 AND ug.workspace_rid = $2 and active = $3;";
    let values = [ userId, workspaceRid, true ];
    
    let workspace;
    try {
         
        let res = await db.query( text, values );
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                // get the workspace for each user_workspace
                text = "SELECT * FROM workspaces WHERE active = $1 AND workspace_rid = $2;";
                values = [ true, res.rows[i].workspace_rid ];

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
        console.log( "[ERR]: [workspace] - get enrolled workspace by user and workspace rid - " + e );
        return false;
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

    let text = "select * from user_workspaces where user_id = $1 and active = $2;";
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
                text = "SELECT * FROM workspaces WHERE workspace_rid = $1;";
                values = [ res.rows[i].workspace_rid ];

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
        console.log( "[ERR]: [workspace] - get active enrollment for user Id - " + e );
        return false;
    }
};


exports.getRecentWorkspaceEnrollmentEvents = async ( limit ) => {
    limit = ( !limit ) ? 10 : limit;
    let text = "select ud.user_id as user_id, ud.username as username, ud.profile_filename as user_image, mod.workspace_rid as workspace_id, mod.workspace_name as workspace_name, mod.workspace_image as workspace_image, mode.create_time as create_time from users ud, workspaces mod, user_workspaces mode where mode.user_id = ud.user_id AND mode.workspace_rid = mod.workspace_rid and mode.active = true ORDER BY mode.create_time desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let enrollmentEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].workspace_rid;
                event.eventItem = "Workspace Enrollment";
                event.eventType = "Workspace Enrollment";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a> <span style='color:darkblue'>Enrolled in <img src='" + process.env.WORKSPACE_IMAGE_WEB_PATH + res.rows[i].workspace_image + "' alt='Workspace Badge' title='Workspace Badge' class='profile-top-image' /> </span><a href='/community/workspace/" + res.rows[i].workspace_id + "'>" + res.rows[i].workspace_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].workspace_image;
                enrollmentEvents.push( event );
            }
        }
        else {
            return false;
        }
        return enrollmentEvents;
    }
    catch( e ) {
        console.log( "[ERR]: [workspace] - get recent workspace enrollment events - " + e );
        return false;
    }  
};

exports.deleteWorkspaceById = async ( workspaceId, ownerId ) => {
    let text = "DELETE FROM workspaces WHERE workspace_id = $1 AND owned_by = $2";
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
        console.log( "[ERR]: [workspace] - delete workspace by id - " + e );
        return false;
    }
};

exports.getRecentWorkspaceCompletionEvents = async ( limit ) => {
    limit = ( !limit ) ? 10 : limit;
    let text = "select ud.user_id as user_id, ud.username as username, ud.profile_filename as user_image, mod.workspace_rid as workspace_rid, mod.workspace_name as workspace_name, mod.workspace_image as workspace_image, mode.completed_date as completed_date from users ud, workspaces mod, user_workspaces mode where mode.user_id = ud.user_id AND mode.workspace_rid = mod.workspace_rid and mode.active = true AND mode.is_completed = true ORDER BY mode.completed_date desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query( text, values );
        
        let enrollmentEvents = [];
        if( res.rows.length > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].workspace_rid;
                event.eventItem = "Workspace Completion!";
                event.eventType = "Workspace Completion!";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].completed_date;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a><span style='color:darkgreen'><strong> completed </strong></span> <img src='" + process.env.WORKSPACE_IMAGE_WEB_PATH + res.rows[i].workspace_image + "' alt='Workspace Badge' title='Workspace Badge' class='profile-top-image' /> <a href='/community/workspace/" + res.rows[i].workspace_id + "'>" + res.rows[i].workspace_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].workspace_image;
                enrollmentEvents.push( event );
            }
        }
        else {
            return false;
        }
        return enrollmentEvents;
    }
    catch( e ) {
        console.log( "[ERR]: [workspace] - get recent workspace completion events - " + e );
        return false;
    }  
};
// Takes in a workspaceId and finds each topicId associated with it.
exports.getAllTopicsIdsForWorkspace = async function ( workspaceRid ) {

    let text = "SELECT * from workspace_paths where workspace_rid = $1";
    let values = [ workspaceRid ];
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
        console.log( "[ERR]: [workspace] - get all topic ids for workspace - " + e );
        return false;
    }

    return topicIds;
       
};