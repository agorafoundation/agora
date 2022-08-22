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
const topicService = require( '../../service/topicService' );
const resourceService = require( '../../service/resourceService' );

// import models
const CompletedResource = require( '../../model/completedResource' );
const Resource = require( '../../model/resource' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let RESOURCE_PATH = process.env.RESOURCE_IMAGE_PATH;


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllVisibleResources = async ( req, res ) => {
    // get all the active resources by user
    console.log("limit check:" + req.query.limit);

    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }
    
    if(authUserId > 0) {
        let resources = await resourceService.getAllVisibleResources( authUserId, req.query.limit, req.query.offset );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all resources" );
        res.status( 200 ).json( resources );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Resource not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Resource not found" );
        res.status( 404 ).json( message );
    }
}


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllSharedResourcesForUser = async ( req, res ) => {
    // get all the shared resources for this user
    let sharedResources = await resourceService.getAllSharedResourcesForUser( req.session.authUser.id );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all shared resources for user" );
    res.status( 200 ).json( sharedResources );
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllActiveResourcesForUser = async ( req, res ) => {
    // get all the active resources
    let resources = await resourceService.getAllActiveResourcesForOwner();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all resources" );
    res.status( 200 ).json( resources );
}

exports.getResourceById = async ( req, res ) => {
    // get all the active resources by user 
    let resource = await resourceService.getAllActiveResourcesForOwnerById( req.session.authUser.id, req.params.id );
    if(resource) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned resource by id" );
        res.status( 200 ).json( resource );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Resource not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Resource not found" );
        res.status( 404 ).json( message );
    }
    
    
}

exports.getAllResourcesForAuthUser = async ( req, res ) => {
    // get all the resources for this owner
    let ownerResources = await resourceService.getAllResourcesForOwner( req.session.authUser.id, false );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all resources for user" );
    res.status( 200 ).json( ownerResources );
}

/**
 * Update or create a completed resource for the resource Id passed.
 * Checks to see if there is an existing completedResource with the passed resourceId and
 * updates if so, otherwise creates a new completedResource and saves
 * @param {HTTP Request} req // body contains resourceId, status, submittedText
 * @param {HTTP Response} res 
 */
exports.saveCompletedResource = async function( req, res ) {
    let resourceId = req.body.resourceId;
    let status = req.body.status;
    let submittedText = req.body.submittedText;

    if( req.session.currentTopic && req.session.authUser ) {
        // call service?
        let completedResource = await topicService.getCompletedResourceByResourceAndUserId( resourceId, req.session.authUser.id );
        if( !completedResource ) {
            completedResource = CompletedResource.emptyCompletedResource( );
            completedResource.userId = req.session.authUser.id;
            completedResource.resourceId = resourceId;
        }
        completedResource.active = status;
        completedResource.submissionText = submittedText;

        // save the completedResource
        let completeResource = await topicService.saveCompletedResourceStatus( completedResource );

        // update the session
        let replaced = false;
        if( req.session.currentTopic.completedResources.length > 0 && completeResource.id > 0 ) {
            for( let i=0; i < req.session.currentTopic.completedResources.length; i++ ) {
                if( req.session.currentTopic.completedResources[ i ].id == completeResource.id ) {
                    req.session.currentTopic.completedResources[ i ] = completeResource;
                    replaced = true;
                    break;
                }
            }
        }
        if ( !replaced ) {
            req.session.currentTopic.completedResources.push( completeResource );
        }
    }

    res.send();
}



exports.saveResourceImage = async( req, res, resourceId, filename ) => {

    // save image in db and delete old file  
    if( resourceId > 0 ) {
        resourceService.updateResourceImage( resourceId, filename ).then( ( rValue ) => {

            if( rValue && rValue.length > 0 && (rValue != 'resource-default.png' 
                || rValue != 'notebook-pen.svg' 
                || rValue != 'cell-molecule.svg' 
                || rValue != 'code.svg' )) {
                console.log("removing: " + UPLOAD_PATH_BASE + "/" + FRONT_END + RESOURCE_PATH + rValue)
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + RESOURCE_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[resourceController] file delete error status: " + err );
                        return false;
                    }
                    
                });
            } 
        });
    }
    
    return true;
}


exports.saveResource = async ( req, res, redirect ) => {

    let resource = Resource.emptyResource();
    resource.id = req.body.resourceId;

    // see if this is a modification of an existing resource
    let existingResource = await resourceService.getResourceById( resource.id );

    // if this is an update replace the resource with teh existing one as the starting point
    if(existingResource) {
        resource = existingResource;
    }

    // add changes from the body if they are passed
    resource.resourceType = req.body.resourceType;
    resource.visibility = req.body.resourceVisibility;
    resource.resourceName = req.body.resourceName;
    resource.resourceDescription = req.body.resourceDescription;
    if(resource.resourceType == 3) {
        resource.resourceContentHtml = req.body.embedded_submission_text_resource;
    }
    else {
        resource.resourceContentHtml = req.body.resourceEditor;
    }
    resource.resourceLink = req.body.resourceLink;
    resource.active = ( req.body.resourceActive == "on" ) ? true : false;
    resource.isRequired = ( req.body.isRequired == "on") ? true : false;

    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    console.log("authorized user: " + authUserId);
    
    if(authUserId > 0) {
        resource.ownerId = authUserId;

        resource = await resourceService.saveResource( resource );

        if( resource ) {
            if( redirect ) {
                console.log( "resourceController.saveResource() - END - Redirect ");
                return resource;
            }
            else {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned all resources" );
                res.status( 200 ).json( resource );
            }
        }
        else {
            if( redirect ) {
                return resource;
            }
            else {
                const message = ApiMessage.createApiMessage( 500, "Internal Server Error", "Error saving resource" );
                res.set( "x-agora-message-title", "Internal Server Error" );
                res.set( "x-agora-message-detail", "Error saving resource" );
                res.status( 500 ).json( message );
            }
        }
    }
    else {
        if( redirect ) {
            return resource;
        }
        else {
            const message = ApiMessage.createApiMessage( 401, "Not Authorized", "Not able to associate authorized user with the record" );
            res.set( "x-agora-message-title", "Not Authorized" );
            res.set( "x-agora-message-detail", "Not able to associate authorized user with the record" );
            res.status( 401 ).json( message );
        }
        
    }
    
}