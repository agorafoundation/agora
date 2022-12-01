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
exports.getSharedEntity = async ( owner_user_id, share_user_id, entity_type ) => {
    let text = "SELECT * FROM shared_entities WHERE owner_user_id = $1 AND share_user_id = $2 AND entity_type = $3";
    const values = [ owner_user_id, share_user_id, entity_type ];

    try {
        let sharedEntity = "";

        let res = await db.query( text, values );
        JSON.stringify( res );
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

    // New entry to be added to our table. Retrieve our shared_entity_id after to inform our user.
    if ( sharedEntity.shared_entity_id == -1 ) {
        let text = "INSERT INTO shared_entities (entity_id, entity_type, share_user_id, owner_user_id, permission_level, can_copy) VALUES ($1, $2, $3, $4, $5, $6) returning shared_entity_id;";
        let values = [ s.entity_id, s.entity_type, s.share_user_id, s.owner_user_id, s.permission_level, s.can_copy ];


        try {
            let res = await db.query( text, values );

            if( res.rowCount > 0 ) {
                const sharedEntityId = res.rows[0].shared_entity_id;
                return sharedEntityId;
            }

        }
        catch ( e ) {
            console.log( "There was an error with query " + text + "\n\n" + e );
            return;
        }
    
    }
    // Update our table with new values specified in sharedEntity.
    else {
        let text = "UPDATE shared_entities SET entity_id = $1, entity_type = $2, share_user_id = $3, owner_user_id = $4, permission_level = $5, can_copy = $6 WHERE shared_entity_id = $7;";
        let values = [ s.entity_id, s.entity_type, s.share_user_id, s.owner_user_id, s.permission_level, s.can_copy, s.shared_entity_id, ];

        console.log( values );
        try {
            let res = await db.query( text, values );

            if( res.rowCount > 0 ) {
                const sharedEntityId = res.rows[0].shared_entity_id;
                return sharedEntityId;
            }
        
        }
        catch ( e ) {
            console.log( "There was an error with query " + text + "\n\n" + e );
            return;
        }
    }
};