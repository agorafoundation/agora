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

    let sharedEntity = SharedEntity.emptySharedEntity();

    let existingSharedEntity = await sharedEntityService.getSharedEntity( req.body.sharedEntityId );

    // Insert a new entry
    if ( existingSharedEntity ) {
        console.log( 'Existing shared entity.' );
        sharedEntity = existingSharedEntity;
    }

    // These should be validated for correct inputs in the future
    sharedEntity.entityId = req.body.entityId ?? sharedEntity.entityId;
    sharedEntity.entityType = req.body.entityType ?? sharedEntity.entityType;
    sharedEntity.shareUserId = req.body.shareUserId ?? sharedEntity.shareUserId;
    sharedEntity.ownerUserId = req.body.ownerUserId ?? sharedEntity.ownerUserId;
    sharedEntity.permissionLevel = req.body.permissionLevel ?? sharedEntity.permissionLevel;
    sharedEntity.canCopy = req.body.canCopy ?? sharedEntity.canCopy;


    const sharedEntityId = await sharedEntityService.insertOrUpdateSharedEntity( sharedEntity );

    if ( sharedEntity ){
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Successfully Stored Shared Entity" );
        res.status( 200 ).json( sharedEntityId );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Something went wrong", "Error" );
        res.set( "x-agora-message-title", "Err" );
        res.set( "x-agora-message-detail", "Err" );
        res.status( 404 ).json( message );
    }

};