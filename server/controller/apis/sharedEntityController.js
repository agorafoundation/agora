/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import services
const sharedEntityService = require( '../../service/sharedEntityService' );
const workspaceService = require( '../../service/workspaceService' );
const userService = require( '../../service/userService' );
const topicService = require( '../../service/topicService' );
const resourceService = require( '../../service/resourceService' );

// import models
const SharedEntity = require( '../../model/sharedEntity' );

const ApiMessage = require( "../../model/util/ApiMessage" );

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

exports.removeSharedUserById = async ( req, res ) => {
    try {
        // authenticate the user sharing 
        let authUserId = req.user ? req.user.userId : req.session.authUser?.userId;
        if ( !authUserId ) {
            console.log( "1" );
            return res.status( 403 ).json( { message: 'User not authenticated' } );
        }

        // Fetch user details from the User model
        console.log( "2" );
        const sharingUser = await userService.getActiveUserById( authUserId );
        if ( !sharingUser ) {
            console.log( "1" );
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        const workspaceId = req.body.entityId;
        const workspace = await workspaceService.getWorkspaceById( workspaceId );
        if ( !workspace ) {
            console.log( "1" );
            return res.status( 404 ).json( { message: 'Workspace not found' } );
        }
        if ( workspace.ownedBy !== sharingUser.userId ) {
            return res.status( 403 ).json( { message: 'Unauthorized: You do not own this workspace' } );
        }

        // Fetch shared users id
        const sharedUserId = req.body.sharedUserId;

        // Remove the shared entity (shared user)
        await sharedEntityService.removeSharedUserById( workspaceId, sharedUserId );

        // Send success response
        res.status( 200 ).json( { message: 'Shared user removed successfully' } );
    }
    catch ( error ) {
        // Handle any other errors
        res.status( 500 ).json( { message: error.message } );
    }
};

//Share workspace 
exports.sharedWorkspace = async ( req, res ) => {
    try {
        // Authenticate the user sharing 
        let authUserId = req.user ? req.user.userId : req.session.authUser?.userId;
        if ( !authUserId ) {
            return res.status( 403 ).json( { message: 'User not authenticated' } );
        }

        // Fetch user details from the User model
        const sharingUser = await userService.getActiveUserById( authUserId );
        if ( !sharingUser ) {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        const workspaceId = req.body.entityId;
        const sharedWithEmail = req.body.sharedWithEmail;  // Email is passed in the body


        // Fetch the user ID from the email
        const sharedWithUser = await userService.getUserByEmail( sharedWithEmail );
        if ( !sharedWithUser ) {
            return res.status( 404 ).json( { message: 'User to share with not found' } );
        }
        const sharedWithUserId = sharedWithUser.userId;

        const isSharedWith = await sharedEntityService.getSharedEntityByUserId( workspaceId, sharedWithUserId );

        // Checks if workspace is already shared with user
        if( isSharedWith ) {
            return res.status( 404 ).json( { message: 'Workspace already shared with user '} );
        }

        // Verify the owner of the workspace
        const workspace = await workspaceService.getWorkspaceById( workspaceId );
        if ( !workspace ) {
            return res.status( 404 ).json( { message: 'Workspace not found' } );
        }
        if ( workspace.ownedBy !== sharingUser.userId ) {
            return res.status( 403 ).json( { message: 'Unauthorized: You do not own this workspace' } );
        }

        if ( workspace.ownedBy == sharedWithUserId ){
            return res.status( 404 ).json( { message: 'Cannot share workspace with owner.' } );
        }

        const sharedEntity = {
            entityId: workspaceId,
            entityType: 'workspace',
            shareUserId: sharedWithUserId,
            ownerUserId: sharingUser.userId,
            permissionLevel: req.body.permissionLevel,  
            canCopy: false            
        };

        const sharedEntityId = await sharedEntityService.insertOrUpdateSharedEntity( sharedEntity );

        // Send success response
        res.status( 200 ).json( { message: 'Workspace shared successfully', sharedEntityId } );
    } 
    catch ( error ) {
        // Handle any other errors 
        res.status( 500 ).json( { message: error.message } );
    }
};

exports.getAllSharedUsersByWorkspaceId = async ( req, res ) => {
    const workspaceId = req.params.entityId;

    try {
        // Fetch all shared entities related to the given workspace ID
        const sharedEntities = await sharedEntityService.getAllSharedUsersByWorkspaceId( workspaceId );
        if ( sharedEntities ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned shared entities by workspace id" );
            res.status( 200 ).json( sharedEntities );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "Shared entities not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Shared entities not found" );
            res.status( 404 ).json( message );
        }
    }
    catch ( e ) {
        console.log( e.stack );
        // Handle the error and send an appropriate response
    }
};

exports.updatePermission = async ( req, res ) => {
    try{
        let authUserId = req.user ? req.user.userId : req.session.authUser?.userId;
        if ( !authUserId ) {
            return res.status( 403 ).json( { message: 'User not authenticated' } );
        }
        // Fetch user details from the User model
        const sharingUser = await userService.getActiveUserById( authUserId );
        if ( !sharingUser ) {
            return res.status( 404 ).json( { message: 'User not found' } );
        }

        const workspaceId = req.body.entityId;

        // Verify's the owner of the workspace
        const workspace = await workspaceService.getWorkspaceById( workspaceId );
        if ( !workspace ) {
            return res.status( 404 ).json( { message: 'Workspace not found' } );
        }
        if ( workspace.ownedBy !== sharingUser.userId ) {
            return res.status( 403 ).json( { message: 'Unauthorized: You do not own this workspace' } );
        }

        const sharedEntity = await sharedEntityService.getSharedEntityByUserId( workspaceId, req.body.sharedUserId );

        sharedEntity.permission_level = req.body.permissionLevel;

        const sharedEntityId = await sharedEntityService.updatePermission( sharedEntity );

        // Send success response
        res.status( 200 ).json( { message: 'Permission updated successfully for ', sharedEntityId } );

    }
    catch ( error ) {
        // Handle any other errors 
        res.status( 500 ).json( { message: error.message } );
    }
};

exports.getPermission = async ( req, res ) => {
    try{
        let workspaceId = req.params.entityId;
        const workspace = await workspaceService.getWorkspaceById( workspaceId );
        if ( req.user.userId == workspace.ownedBy ){
            return res.status( 200 ).json( { permission_level: "edit" } );
        }
        const sharedUser = await sharedEntityService.getSharedEntityByUserId( workspaceId, req.user.userId );
        return res.status( 200 ).json( sharedUser );
    }
    catch ( error ){
        // Handle any other errors 
        res.status( 500 ).json( { message: error.message } );
    }
};