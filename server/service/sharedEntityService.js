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

// any cross services required



/**
 * Get a single shared entity by Id
 * @param {int} resourceId - Id of resource to retrieve
 * @param {boolean} active - If true resource must have an active status
 * @returns {Resource}
 */
exports.getSharedEntity = async ( entity_id, entity_type, share_user_id ) => {
    let text = "SELECT * from shared_entities WHERE owner_user_id = $1 AND share_user_id = $2";
    const values = [ entity_id, entity_type, share_user_id ];

    try {
        let resource = "";

        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            resource = SharedEntity.ormResource( res.rows[0] );
        }
        return resource;
    
    }
    catch( e ) {
        console.log( e.stack );
    }

};