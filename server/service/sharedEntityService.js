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
        }
        return sharedEntity;
    
    }
    catch( e ) {
        console.log( e.stack );
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