/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import services
const sharedEntityService = require( '../../service/sharedEntityService' );

// import models
const SharedEntity = require( '../../model/sharedEntity' );

const ApiMessage = require( "../../model/util/ApiMessage" );
const { Console } = require( 'console' );

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
// Save or update a shared entity.
exports.saveSharedEntity = async ( req, res ) => {
    // If not existing shared entity, create shared entity.

    const owner_user_id = req.body.owner_user_id;
    const share_user_id = req.body.share_user_id;
    const entity_type = req.body.entity_type;

    let sharedEntity = await sharedEntityService.getSharedEntity( owner_user_id, share_user_id, entity_type );
    // Insert a new entry
    if ( !sharedEntity ) {
        sharedEntity = SharedEntity.ormSharedEntity();
    }

    sharedEntityService.insertOrUpdateSharedEntity( sharedEntity );



};