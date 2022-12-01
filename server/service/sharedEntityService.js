/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const SharedEntity = require( '../model/sharedEntity' );


/**
 * Get a single shared entity by Id
 * @param {int} entity_id - Id of entity
 * @param {int} entity_type - Type of entity (1, 2, 3, 4) -> 
 * @param {int} share_user_id - Id of user to share with.
 * @returns {SharedEntity}
 */
exports.getSharedEntity = async ( entity_id, entity_type, share_user_id ) => {
    let text = "SELECT * FROM shared_entities WHERE owner_user_id = $1 AND share_user_id = $2";
    const values = [ entity_id, entity_type, share_user_id ];

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

    const s = sharedEntity;

    let text = "";

    // New entry to be added to our table. Retrieve our shared_entity_id after to inform our user.
    if ( sharedEntity.entity_id == -1 ) {
        text = "INSERT INTO shared_entities (shared_entity_id, entity_id, entity_type, share_user_id, owner_user_id, share_type, permission_level, can_copy) VALUES ($2, $3, $4, $5, $6, $7, $8, $9) returning shared_entity_id";
    }
    // Update our table with new values specified in sharedEntity.
    else {
        text = "UPDATE shared_entities SET shared_entity_id = $2, entity_id = $3, entity_type = $4, share_user_id = $5, owner_user_id = $6, share_type = $7, permission_level = $8, can_copy = $9 WHERE shared_entity_id = $1;";
    }

    let values = [ s.id, s.shared_entity_id, s.entity_id, s.entity_type, s.share_user_id, s.owner_user_id, s.share_type, s.permission_level, s.can_copy ];

    try {
        let res = await db.query( text, values );

        if( res.rowCount > 0 ) {
            sharedEntity.shared_entity_id = res.rows[0].shared_entity_id;
        }

        return sharedEntity;

    }
    catch ( e ) {
        console.log( "There was an error with query" + text );
        return;
    }
};