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
const topicService = require( '../../service/topicService' );
const resourceService = require( '../../service/resourceService' );

// import models
const CompletedResource = require( '../../model/completedResource' );
const Resource = require( '../../model/resource' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const RESOURCE_PATH = process.env.RESOURCE_IMAGE_PATH;

// resource file path
const resourceUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + RESOURCE_PATH;

// set the max image size for avatars and resource, topic and workspace icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

const ApiMessage = require( "../../model/util/ApiMessage" );
const { Console } = require( 'console' );


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllVisibleResources = async ( req, res ) => {
    // get all the active resources by user
    console.log( "limit check:" + req.query.limit );

    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    //console.log("auth user id; " + authUserId);
    
    if( authUserId ) {
        
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
};


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllSharedResourcesForUser = async ( req, res ) => {
    // get all the shared resources for this user
    let sharedResources = await resourceService.getAllSharedResourcesForUser( req.session.authUser.userId );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all shared resources for user" );
    res.status( 200 ).json( sharedResources );
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
exports.getAllActiveResourcesForUser = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    // get all the active resources
    let resources = await resourceService.getAllActiveResourcesForOwner( authUserId );

    if( resources ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all active resources" );
        res.status( 200 ).json( resources );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Resources not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Resources not found" );
        res.status( 404 ).json( message );
    }
};

exports.getResourceById = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    // get all the active resources by Id
    let resource = await resourceService.getAllActiveResourcesForOwnerById( authUserId, req.params.resourceId );

    if( resource ) {
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
};

exports.getAllResourcesForauthUser = async ( req, res ) => {
    // get all the resources for this owner
    let ownerResources = await resourceService.getAllResourcesForOwner( req.session.authUser.userId, false );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all resources for user" );
    res.status( 200 ).json( ownerResources );
};

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
        let completedResource = await topicService.getCompletedResourceByResourceAndUserId( resourceId, req.session.authUser.userId );
        if( !completedResource ) {
            completedResource = CompletedResource.emptyCompletedResource( );
            completedResource.userId = req.session.authUser.userId;
            completedResource.resourceId = resourceId;
        }
        completedResource.active = status;
        completedResource.submissionText = submittedText;

        // save the completedResource
        let completeResource = await topicService.saveCompletedResourceStatus( completedResource );

        // update the session
        let replaced = false;
        if( req.session.currentTopic.completedResources.length > 0 && completeResource.resourceId > 0 ) {
            for( let i=0; i < req.session.currentTopic.completedResources.length; i++ ) {
                if( req.session.currentTopic.completedResources[ i ].id == completeResource.resourceId ) {
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
};

exports.saveResourceImage = async( req, res, resourceId, filename ) => {

    // save image in db and delete old file  
    if( resourceId > 0 ) {
        resourceService.updateResourceImage( resourceId, filename ).then( ( rValue ) => {
            if ( rValue === filename ) {
                console.log( 'No image update occurred - exiting image update function.' );
                return false;
            }

            if( rValue && rValue.length > 0 && ( rValue != "resource-default.png"
                || rValue != "notebook-pen.svg" 
                || rValue != "cell-molecule.svg" 
                || rValue != "code.svg" ) ) {
                console.log( "removing: " + resourceUploadPath + rValue );
                fs.unlink( ( resourceUploadPath ) + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[resourceController] file delete error status: " + err );
                        return false;
                    }
                    
                } );
            } 
        } );
    }
    
    return true;
};

exports.saveResource = async ( req, res, redirect ) => {
    let resource = Resource.emptyResource();

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ) {

        if( req.body.resourceId != null && req.body.resourceId != -1 ) {
            resource.resourceId = req.body.resourceId;
        }

        // see if this is a modification of an existing resource
        let existingResource = await resourceService.getResourceById( resource.resourceId.toString(), false );

        // if this is an update, replace the resource with the existing one as the starting point.
        if( existingResource ) {
            //console.log( "there was an existing resource for this id: " + JSON.stringify(existingResource) );
            resource = existingResource;
        }

        // add changes from the body if they are passed
        if ( req.body.visibility == "public" || req.body.visibility == "private" ) { // TODO: this checking needs to be done via frontend form validation
            resource.visibility = req.body.visibility;
        }
        else {
            console.error( "[goalController.saveGoal]: NON-VALID 'visibility' VALUE REQUESTED - 'public', 'private'" );
        }

        resource.resourceType = req.body.resourceType;
        resource.resourceName = req.body.resourceName;
        resource.resourceDescription = req.body.resourceDescription;

        if( resource.resourceType == 3 ) {
            
            resource.resourceContentHtml = req.body.embedded_submission_text_resource;
        }
        else {
            // check to see if the incomping message format is from the UI or the API
            if( req.body.resourceContentHtml ) {
                resource.resourceContentHtml = req.body.resourceContentHtml;
            }
            else {
                resource.resourceContentHtml = req.body.resourceEditor;
            }
        }
        resource.resourceLink = req.body.resourceLink;
        
        // check to see if the incoming message format is from the UI form or the API
        if( req.body.resourceActive ) {
            resource.active = ( req.body.resourceActive == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            resource.active = req.body.active;
        }
        
        resource.isRequired = ( req.body.isRequired == "on" || req.body.isRequired == true ) ? true : false;
    
        resource.ownedBy = authUserId;

        resource = await resourceService.saveResource( resource );

        /**
         * once the resource is saved, save the image if it is passed
         */ 
        //console.log( "req.files is " + req.files );
        //console.log( "req.body.resourceImage is " + req.body.resourceImage );
        // The UI needs to verify modifiction so that the image is not dropped if the user does not want to change it
        if ( req.body.resourceModified && !req.files ) {
            // do nothing we are going to keep the original file
            console.log( "resource trigger modification clause" );
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {   // no files were uploaded       
            // no files uploaded
            if ( req.body.resourceImage ) {
                this.saveResourceImage( req, res, resource.resourceId, req.body.resourceImage );
            }
            else if( resource.resourceType == 1 ) {
                this.saveResourceImage( req, res, resource.resourceId, 'notebook-pen.svg' );
            }
            else if ( resource.resourceType == 2 ) {
                this.saveResourceImage( req, res, resource.resourceId, 'cell-molecule.svg' );
            }
            else if( resource.resourceType == 3 ) {
                this.saveResourceImage( req, res, resource.resourceId, 'code.svg' );
            }
            else {
                this.saveResourceImage( req, res, resource.resourceId, 'resource-default.png' );
            }
        }
        else {
            // files included
            const file = req.files.resourceImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log( `File ${file.name} size limit has been exceeded for resource` );

                if( redirect ) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your resource was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return resource;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your resource was saved without the image." );
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your resource was saved without the image." );
                    res.status( 422 ).json( message );
                }
                
            }
            else if( resource ) {
                await file.mv( resourceUploadPath + timeStamp + file.name, async ( err ) => {
                    if ( err ) {
                        console.log( "Error uploading profile picture : " + err );
                        if( redirect ) {
                            req.session.messageType = "error";
                            req.session.messageTitle = "Error saving image!";
                            req.session.messageBody = "There was a error uploading your image for this resource. Your resource should be saved without the image.";
                            res.redirect( 303, '/dashboard' );
                            return resource;
                        }
                        else {
                            const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this resource. Your resource should be saved without the image." );
                            res.set( "x-agora-message-title", "Error saving image!" );
                            res.set( "x-agora-message-detail", "There was a error uploading your image for this resource. Your resource should be saved without the image." );
                            res.status( 422 ).json( message );
                        }
                    }
                    else {
                        await this.saveResourceImage( req, res, resource.resourceId, timeStamp + file.name );
                    }
                } );
            }
            else {
                if( redirect ) {
                    req.session.messageType = "error";
                    req.session.messageTitle = "Error saving image!";
                    req.session.messageBody = "There was a error uploading your image for this resource. Your resource should be saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return resource;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this resource. Your resource should be saved without the image." );
                    res.set( "x-agora-message-title", "Error saving image!" );
                    res.set( "x-agora-message-detail", "There was a error uploading your image for this resource. Your resource should be saved without the image." );
                    res.status( 422 ).json( message );
                }
            }
        }

        // redirect to the call the calling controller or return the resource if origin was an API call
        if( resource ) {
            if( redirect ) {
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
    
};

exports.deleteResourceById = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    const resourceId = req.params.resourceId;
    let success = await resourceService.deleteResourceById( resourceId, authUserId );

    if ( success ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Deleted resource" );
        res.status( 200 ).json( "Success" );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "No resources were found meeting the query criteria" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No resources were found meeting the query criteria" );
        res.status( 404 ).json( message );
    }

};