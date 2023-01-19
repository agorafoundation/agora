/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import services
const sharedEntityService = require( '../../service/sharedEntityService' );
const workspaceService = require( '../../service/workspaceService' );
const topicService = require( '../../service/topicService' );
const resourceService = require( '../../service/resourceService' );

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

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
// Save or update a copied entity.
exports.saveCopiedEntity = async ( req, res ) => {
    if ( req.body.entityType && req.body.entityId && req.body.ownerUserId && req.body.shareUserId ) {
        let workspace = null;
        let topic = null;
        let resource = null;
        let message = null;

        switch ( req.body.entityType ) {
        case 1:
            workspace = await workspaceService.getWorkspaceById( req.body.entityId );

            if( workspace ) {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned workspace by id" );
                res.status( 200 ).json( workspace );

                workspace.workspaceId = -1;
                workspace.ownedBy = req.body.shareUserId;
                await workspaceService.saveWorkspace( workspace );
            }
            else {
                const message = ApiMessage.createApiMessage( 404, "Not Found", "Workspace not found" );
                res.set( "x-agora-message-title", "Not Found" );
                res.set( "x-agora-message-detail", "Workspace not found" );
                res.status( 404 ).json( message );
            }

            break;

        case 2: 
            topic = await topicService.getTopicById( req.body.entityId );

            if( topic ) {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned topic by id" );
                res.status( 200 ).json( topic );

                topic.topicId = -1;
                topic.ownedBy = req.body.shareUserId;
                await topicService.saveTopic( topic );
            }
            else {
                const message = ApiMessage.createApiMessage( 404, "Not Found", "Topic not found" );
                res.set( "x-agora-message-title", "Not Found" );
                res.set( "x-agora-message-detail", "Topic not found" );
                res.status( 404 ).json( message );
            }
            break;

        case 3: 
            resource = await resourceService.getResourceById( req.body.entityId );

            if( resource ) {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned resource by id" );
                res.status( 200 ).json( resource );

                resource.resourceId = -1;
                resource.ownedBy = req.body.shareUserId;
                await resourceService.saveResource( resource );
            }
            else {
                const message = ApiMessage.createApiMessage( 404, "Not Found", "Resource not found" );
                res.set( "x-agora-message-title", "Not Found" );
                res.set( "x-agora-message-detail", "Resource not found" );
                res.status( 404 ).json( message );
            }
            break;
        default:
            console.log( "Please enter a correct Entity Type (ENUM: 1-Workspace, 2-Topic, 3-Resource)" );
            message = ApiMessage.createApiMessage( 404, "Not Found", "Entity not found. Please enter a correct Entity Type (ENUM: 1-Workspace, 2-Topic, 3-Resource)" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Entity not found" );
            res.status( 404 ).json( message );
            break; 
        }
    }
    else {
        console.log( "Please provide req.body.entityType && req.body.entityId && req.body.ownerUserId && req.body.shareUserId " );
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Entity not found. Please provide req.body.entityType && req.body.entityId && req.body.ownerUserId && req.body.shareUserId" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Entity not found" );
        res.status( 404 ).json( message );
    }
};