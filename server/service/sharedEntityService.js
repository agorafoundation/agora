/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const SharedEntity = require( '../model/sharedEntity' );
const userService = require( '../service/userService' );


/**
 * Get a single shared entity by Id
 * @param {int} sharedEntityId - the ID of the entity to retrieve
 * @returns {SharedEntity}
 */
exports.getSharedEntity = async ( sharedEntityId ) => {
    let text = "SELECT * FROM shared_entities WHERE shared_entity_id = $1";
    const values = [ sharedEntityId ];

    try {
        let sharedEntity = "";

        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            sharedEntity = SharedEntity.ormSharedEntity( res.rows[0] );
            return sharedEntity;
        }
        else{
            return false;
        }
    
    }
    catch( e ) {
        console.log( e.stack );
    }

};

exports.getAllSharedUsersByWorkspaceId = async ( workspaceId ) => {
    let text = `
        SELECT
            se.entity_id,
            se.entity_type,
            se.shared_by_user_id,
            se.shared_with_user_id,
            se.permission_level,
            u.email,
            u.username,
            u.profile_filename,
            u.first_name,
            u.last_name
        FROM shared_entities AS se
        INNER JOIN users AS u ON se.shared_with_user_id = u.user_id
        WHERE se.entity_id = $1
          AND se.entity_type = 'workspace'
    `;
    const values = [ workspaceId ];

    try {
        let sharedUsers = [];

        let res = await db.query( text, values );
        if ( res.rowCount > 0 ) {
            // Convert the retrieved rows into SharedEntity objects and add them to the sharedEntities array
            res.rows.forEach( ( row ) => {
                sharedUsers.push( SharedEntity.ormSharedEntity( row ) );
            } );
            return sharedUsers;
        }
        else{
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
    }
};

exports.getSharedEntityByUserId = async ( entityId, sharedUserId ) => {
    let text = "SELECT * FROM shared_entities WHERE entity_id = $1 AND shared_with_user_id = $2";
    const values = [ entityId, sharedUserId ];

    try {
        let res = await db.query( text, values );
        if ( res.rowCount > 0 ) {
            return res.rows[0];
        }
        else{
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
        // Handle the error and return an empty array or null
        return null;
    }
};

exports.updatePermission = async ( sharedEntity ) => {
    if ( sharedEntity ) {
        let text = "UPDATE shared_entities SET permission_level = $1 WHERE entity_id = $2 AND shared_with_user_id = $3 RETURNING shared_entity_id";
        let values = [ sharedEntity.permission_level, sharedEntity.entity_id, sharedEntity.shared_with_user_id ];

        try{
            let res = await db.query( text, values );
            if ( res.rowCount > 0 ){
                return res.rows[0].shared_entity_id;
            }
            else{
                return false;
            }
        }
        catch ( e ){
            console.log( e.stack );
        }
    }
};

exports.insertOrUpdateSharedEntity = async ( sharedEntity ) => {

    if ( sharedEntity ) {
        // Update our table with new values specified in sharedEntity.
        if ( sharedEntity.sharedEntityId > 0 ) {
            let text = "UPDATE shared_entities SET entity_id = $1, entity_type = $2, share_user_id = $3, owner_user_id = $4, permission_level = $5, can_copy = $6 WHERE shared_entity_id = $7 RETURNING shared_entity_id;";
            let values = [ sharedEntity.entityId, sharedEntity.entityType, sharedEntity.shareUserId, sharedEntity.ownerUserId, sharedEntity.permissionLevel, sharedEntity.canCopy, sharedEntity.sharedEntityId ];

            console.log( values );
            try {
                let res = await db.query( text, values );

                if( res.rowCount > 0 ) {
                    sharedEntity.sharedEntityId = res.rows[0].shared_entity_id;
                }

            }
            catch ( e ) {
                console.log( "There was an error with query " + text + "\n\n" + e );
                return false;
            }
        }
        // New entry to be added to our table. Retrieve our shared_entity_id after to inform our user.
        else {
            let text = "INSERT INTO shared_entities (entity_id, entity_type, shared_with_user_id, shared_by_user_id, permission_level, can_copy) VALUES ($1, $2, $3, $4, $5, $6) returning shared_entity_id;";
            let values = [ sharedEntity.entityId, sharedEntity.entityType, sharedEntity.shareUserId, sharedEntity.ownerUserId, sharedEntity.permissionLevel, sharedEntity.canCopy ];


            try {
                let res = await db.query( text, values );

                if( res.rowCount > 0 ) {
                    sharedEntity.sharedEntityId = res.rows[0].shared_entity_id;
                }

            }
            catch ( e ) {
                console.log( "There was an error with query " + text + "\n\n" + e );
                return false;
            }
        }
        return sharedEntity;
    }
};

// Remove a user from a shared workspace
exports.removeUserByEmailFromWorkspace = async ( workspaceId, email ) => {
    try {
        // First, get the user ID from the email
        const user = await userService.getUserByEmail( email );
        if ( !user ) {
            return false; // User not found
        }

        const userId = user.userId;
        const text = "DELETE FROM shared_entities WHERE entity_id = $1 AND shared_with_user_id = $2 RETURNING *";
        const values = [ workspaceId, userId ];

        const res = await db.query( text, values );
        return res.rowCount > 0;
    } 
    catch ( e ) {
        console.log( e.stack );
        return false;
    }
};

exports.removeUserFromWorkspace = async ( workspaceId, userId ) => {
    const text = "DELETE FROM shared_entities WHERE entity_id = $1 AND shared_with_user_id = $2 RETURNING *";
    const values = [ workspaceId, userId ];

    try {
        const res = await db.query( text, values );
        return res.rowCount > 0;  // returns true if a row was deleted
    } 
    catch ( e ) {
        console.log( e.stack );
        return false;  // returns false in case of an error
    }
};
