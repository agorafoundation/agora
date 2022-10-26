/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import models
const Workspace = require( '../../model/workspace' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import services
const workspaceService = require( '../../service/workspaceService' );
const userService = require( '../../service/userService' );

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
    let workspaces = await workspaceService.getAllVisibleWorkspaces( req.user.id );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces" );
    res.status( 200 ).json( workspaces );
}

exports.getWorkspaceById = async ( req, res ) => {
    // get all the active workspaces by user 
    let workspace = await workspaceService.getActiveWorkspaceWithTopicsById( req.params.id, true );
    if(workspace) {
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

exports.deleteWorkspaceById = async (req, res) => {

    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if ( authUserId > 0 ) {
        const workspaceId = req.params.id;
        let success = await workspaceService.deleteWorkspaceById(workspaceId, authUserId);

        if (success) {
            res.set("x-agora-message-title", "Success");
            res.set("x-agora-message-detail", "Deleted workspace");
            res.status(200).json("Success");
        }
        else {
            res.set("x-agora-message-title", "Not Found");
            res.set("x-agora-message-detail", "No workspaces were found meeting the query criteria");
            res.status(404).send("No Workspaces Found");
        }
    }
}

exports.getAllVisibleWorkspacesWithTopics = async ( req, res ) => {
    // get all the active workspaces
    let workspaces = await workspaceService.getAllVisibleWorkspacesWithTopics();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces" );
    res.status( 200 ).json( workspaces );
}



exports.getAllWorkspacesForAuthUser = async ( req, res ) => {
    
    console.log("The rquest: " + JSON.stringify(req.user));

    // get all the workspaces for this owner
    let ownerWorkspaces = await workspaceService.getAllWorkspacesForOwner( req.user.id, false );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all workspaces for user" );
    res.status( 200 ).json( ownerWorkspaces );
}

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
            if( rValue && ( rValue != 'workspace-default.png' || rValue != 'peak.svg' ) ) {
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + WORKSPACE_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[workspaceController] file delete error status: " + err );
                        return false;
                    }
                    
                });
            } 
        });
    }
    
    return true;
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} redirect 
 * @returns 
 */
exports.saveWorkspace = async ( req, res, redirect ) =>{

    let workspace = Workspace.emptyWorkspace();

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }
    
    workspace.ownedBy = authUserId; 

    if(authUserId > 0) {

        workspace.id = req.body.workspaceId;

        // see if this is a modification of an existing workspace
        let existingWorkspace = await workspaceService.getMostRecentWorkspaceById( workspace.id );

        // if this is an update replace the workspace with teh existing one as the starting point
        if(existingWorkspace) {
            console.log("there was an existing workspace for this id: " + JSON.stringify(existingWorkspace));
            workspace = existingWorkspace;
        }

        // add changes from the body if they are passed
        workspace.visibility = req.body.workspaceVisibility;
        workspace.workspaceName = req.body.workspaceName;
        workspace.workspaceDescription = req.body.workspaceDescription;
        
        // check to see if the incoming message format is from the UI form or the API for active
        if( req.body.workspaceActive ) {
            workspace.active = ( req.body.workspaceActive == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            workspace.active = req.body.active;
        }

        // check to see if the incoming message format is from the UI form or the API for completable
        if( req.body.workspaceCompletable ) {
            workspace.completable = ( req.body.workspaceCompletable == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            workspace.completable = req.body.active;
        }

        workspace = await workspaceService.saveWorkspace( workspace );

        /**
         * Once the workspace is saved, save the image if it is passed in the multipart form data
         */
        if ( req.body.workspaceModified && req.body.workspaceModified != "false" && !req.files ) {
            // do nothing we are going to keep the original file
            console.log("workspace trigger modification clause");
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            if (!workspace.workspaceImage){
                this.saveWorkspaceImage( req, res, workspace.id, 'peak.svg' );
            }
        }
        else {
            // files included
            const file = req.files.workspaceImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log(`File ${file.name} size limit has been exceeded for workspace`);

                if(redirect) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return workspace;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image.");
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your workspace was saved without the image.");
                    res.status( 422 ).json( message );
                }             
            }
            else if( workspace ) {
                await file.mv(workspaceUploadPath + timeStamp + file.name, async (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        if(redirect) {
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
                        await this.saveWorkspaceImage( req, res, workspace.id, timeStamp + file.name );
                    }
                });
            }
            else {
                if(redirect) {
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
        if(req.body.pathway) {
            pathway = req.body.pathway.split(",");
            workspaceService.savePathwayToexistingWorkspaceVersion(workspace.id, pathway);
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
        console.log( "workspaceController.saveWorkspace() - END - Redirect");
        return workspace;
    }
    else {
        console.log( "workspaceController.saveWorkspace() - END - Non-Redirect ");
        res.setHeader( 'Content-Type', 'application/json' );
        res.send(JSON.stringify(workspace));
    }
}