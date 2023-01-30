/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import models
const Workspace = require( '../../model/workspace' );
// import controllers
const {errorController} = require( "./apiErrorController" );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import services
const workspaceService = require( '../../service/workspaceService' );
const userService = require( '../../service/userService' );
const topicService = require( '../../service/topicService' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let WORKSPACE_PATH = process.env.WORKSPACE_IMAGE_PATH;

// set the max image size for avatars and icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

// workspace file path
const workspaceUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + WORKSPACE_PATH;


exports.getAllVisibleWorkspaces = async ( req, res ) => {
    // get all the active workspaces
    console.log( '1' );
    let workspaces = await workspaceService.getAllVisibleWorkspaces( req.user.userId );
    console.log( '2' );
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces" );
    res.status( 200 ).json( workspaces );
};

exports.getWorkspaceById = async ( req, res ) => {

    // Get the auth user id from either the basic auth header or the session.
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }
    if( authUserId ) {
        // get all the active workspaces by user
        let workspace = await workspaceService.getActiveWorkspaceWithTopicsById( req.params.workspaceId, authUserId, true );
        if ( workspace ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned workspace by id" );
            res.status( 200 ).json( workspace );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "Workspace not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Workspace not found" );
            res.status( 404 ).json( message );
        }
    }
};

exports.getAllTopicsForWorkspaceId = async ( req, res ) => {
    
    // Get the auth user id from either the basic auth header or the session.
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ){
        // Check if valid workspaceId given.
        let workspace = await workspaceService.getWorkspaceById( req.params.workspaceId, authUserId );
        if( workspace ) {

            let topicsList = [];
            // Get all topics Ids associated with our workspaceId.
            let topicsIds = await workspaceService.getAllTopicsIdsForWorkspace( workspace.workspaceRid );
            
            // Grab each topic by id and append it to our list of topics
            for ( let index in topicsIds ) {
                let topics = await topicService.getTopicById( topicsIds[index], authUserId );

                if ( topics ){ // Ensure retrieval of topics
                    topicsList.push( topics );
                }
                else {
                    console.log( "Error retrieving resource " + topicsIds[index] + "\n" );
                }
            }

            // Return our resourcesList.
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned resources list" );
            res.status( 200 ).json( topicsList );
        }

        else {
            return errorController( ApiMessage.createNotFoundError ( "Topic", res ) );
        }
    }

};


exports.deleteWorkspaceById = async ( req, res ) => {

    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if ( authUserId ) {
        const workspaceId = req.params.workspaceId;
        let success = await workspaceService.deleteWorkspaceById( workspaceId, authUserId );

        if ( success ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Deleted workspace" );
            res.status( 200 ).json( "Success" );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "No workspaces were found meeting the query criteria" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "No workspaces were found meeting the query criteria" );
            res.status( 404 ).json( message );
        }
    }
};

exports.getAllVisibleWorkspacesWithTopics = async ( req, res ) => {
    // get all the active workspaces
    let workspaces = await workspaceService.getAllVisibleWorkspacesWithTopics();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces" );
    res.status( 200 ).json( workspaces );
};



exports.getAllWorkspacesForauthUser = async ( req, res ) => {
    
    console.log( "The rquest: " + JSON.stringify( req.user ) );

    // get all the workspaces for this owner
    let ownerWorkspaces = await workspaceService.getAllWorkspacesForOwner( req.user.userId, false );
    
        
      
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces for user" );
    res.status( 200 ).json( ownerWorkspaces );
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} workspaceId 
 */
exports.saveWorkspaceImage = async ( req, res, workspaceId, filename ) => {

    // save image in db and delete old file  
    if( workspaceId > 0 ) {
        workspaceService.updateWorkspaceImage( workspaceId, filename ).then( ( rValue ) => {
            if ( rValue === filename ) {
                console.log( 'No image update occurred - exiting image update function.' );
                return false;
            }

            if( rValue && rValue.length > 0 && ( rValue != 'workspace-default.png' || rValue != 'peak.svg' ) ) {
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + WORKSPACE_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[workspaceController.saveWorkspaceImage] file delete error status: " + err );
                        return false;
                    }
                    
                } );
            } 
        } );
    }
    
    return true;
};

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} redirect 
 * @returns 
 */
exports.saveWorkspace = async ( req, res, redirect ) => {

    let workspace = Workspace.emptyWorkspace();
    
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }
    
    workspace.ownedBy = authUserId; 
    //console.log( "workspace owned by: " + workspace.ownedBy + " from " + authUserId ); 

    if( authUserId ) {
        if( req.body.workspaceId != null && req.body.workspaceId != -1 ) {
            workspace.workspaceId = req.body.workspaceId;
        }

        // see if this is a modification of an existing workspace
        let existingWorkspace = await workspaceService.getMostRecentWorkspaceById( workspace.workspaceId.toString() );

        // if this is an update replace the workspace with teh existing one as the starting point
        if( existingWorkspace ) {
            
            workspace = existingWorkspace;
  
            if( ( existingWorkspace.visibility != req.body.visibility )
                || ( existingWorkspace.workspaceName != req.body.workspaceName )
                || ( existingWorkspace.workspaceDescription != req.body.workspaceDescription )
                || ( existingWorkspace.active != req.body.active )
                || ( existingWorkspace.completable != req.body.completable ) ) {
                workspace.workspaceVersion++;
                //console.log( "[workspaceController.saveWorkspace]: Modifications made; Workspace Version incremented - version: " + workspace.workspaceVersion );
            }
            else {
                console.log( "[workspaceController.saveWorkspace]: No modifications were made" );
            }
        }

        // Array of topics sent in request body that correspond to the workspace
        workspace.topics = req.body.topics;

        // add changes from the body if they are passed
        if ( req.body.visibility == "public" || req.body.visibility == "private" ) { // TODO: this checking needs to be done via frontend form validation
            workspace.visibility = req.body.visibility;   
        }
        else {
            console.error( "[workspaceController.saveWorkspace]: NON-VALID 'visibility' VALUE REQUESTED - 'public', 'private' " );
        }
        workspace.workspaceName = req.body.workspaceName;
        workspace.workspaceDescription = req.body.workspaceDescription;
        workspace.active = req.body.active;
        workspace.completable = req.body.completable;

        workspace = await workspaceService.saveWorkspace( workspace );

        if ( req.body.topics ){
            await workspaceService.saveTopicsForWorkspace( workspace.workspaceRid, req.body.topics, req.body.topicsRequired );
        }

        /**
         * Once the workspace is saved, save the image if it is passed in the multipart form data
         */
        if ( req.body.workspaceModified && !req.files ) {
            // do nothing we are going to keep the original file
            console.log( "workspace trigger modification clause" );
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            this.saveWorkspaceImage( req, res, workspace.workspaceId, 'peak.svg' );
            
        }
        else {
            // files included
            const file = req.files.workspaceImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log( `File ${file.name} size limit has been exceeded for workspace` );

                if( redirect ) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return workspace;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image." );
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image." );
                    res.status( 422 ).json( message );
                }             
            }
            else if( workspace ) {
                await file.mv( workspaceUploadPath + timeStamp + file.name, async ( err ) => {
                    if ( err ) {
                        console.log( "Error uploading profile picture : " + err );
                        if( redirect ) {
                            req.session.messageType = "error";
                            req.session.messageTitle = "Error saving image!";
                            req.session.messageBody = "There was a error uploading your image for this workspace. Your workspace should be saved without the image.";
                            res.redirect( 303, '/dashboard' );
                            return workspace;
                        }
                        else {
                            const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this workspace. Your workspace should be saved without the image." );
                            res.set( "x-agora-message-title", "Error saving image!" );
                            res.set( "x-agora-message-detail", "There was a error uploading your image for this workspace. Your workspace should be saved without the image." );
                            res.status( 422 ).json( message );
                        }
                    }
                    else {
                        await this.saveWorkspaceImage( req, res, workspace.workspaceId, timeStamp + file.name );
                    }
                } );
            }
            else {
                if( redirect ) {
                    req.session.messageType = "error";
                    req.session.messageTitle = "Error saving image!";
                    req.session.messageBody = "There was a error uploading your image for this workspace. Your workspace should be saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return workspace;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this workspace. Your workspace should be saved without the image." );
                    res.set( "x-agora-message-title", "Error saving image!" );
                    res.set( "x-agora-message-detail", "There was a error uploading your image for this workspace. Your workspace should be saved without the image." );
                    res.status( 422 ).json( message );
                }
            }
        }



        if( workspace ) {
            req.session.messageType = "success";
            req.session.messageTitle = "Workspace Saved";
            req.session.messageBody = "Workspace " + workspace.workspaceName + " saved successfully!";
        }
        else {
            req.session.messageType = "error";
            req.session.messageTitle = "Error saving Workspace <br />";
            req.session.messageBody = "There was a problem saving the workspace. <br />";
        }

        // get the pathway
        let pathway = null;
        if( req.body.pathway ) {
            pathway = req.body.pathway.split( "," );
            workspaceService.savePathwayToexistingWorkspaceVersion( workspace.workspaceId, pathway );
        }


    }
    else {
        // there was no authenicated user
        if( redirect ) {
            return workspace;
        }
        else {
            const message = ApiMessage.createApiMessage( 401, "Not Authorized", "Not able to associate authorized user with the record" );
            res.set( "x-agora-message-title", "Not Authorized" );
            res.set( "x-agora-message-detail", "Not able to associate authorized user with the record" );
            res.status( 401 ).json( message );
        }
    }
    
    if( redirect ) {
        //console.log( "workspaceController.saveWorkspace() - END - Redirect" );
        return workspace;
    }
    else {
        //console.log( "workspaceController.saveWorkspace() - END - Non-Redirect " );
        res.setHeader( 'Content-Type', 'application/json' );
        res.send( JSON.stringify( workspace ) );
    }
};