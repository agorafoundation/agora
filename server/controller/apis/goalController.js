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
const Goal = require( '../../model/goal' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import services
const goalService = require( '../../service/goalService' );
const userService = require( '../../service/userService' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let GOAL_PATH = process.env.GOAL_IMAGE_PATH;

// set the max image size for avatars and icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

// goal file path
const goalUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH;


exports.getAllVisibleGoals = async ( req, res ) => {
    // get all the active goals
    let goals = await goalService.getAllVisibleGoals( req.user.id );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}

exports.updateGoalFromId = async (req, res) => {
    let success = await goalService.updateGoalFromId(req.params.id);
    
    if (success) {
        res.set("x-agora-message-title", "Success");
        res.set("x-agora-message-detail", "Updated goal");
        res.status(200).json("Success");
    }
    else {
        res.set("x-agora-message-title", "Not Found");
        res.set("x-agora-message-detail", "No goals were found meeting the query criteria");
        res.status(404).send("No Goals Found");
    }
}

exports.getGoalById = async ( req, res ) => {
    // get all the active goals by user 
    let goal = await goalService.getActiveGoalWithTopicsById( req.params.id, true );
    if(goal) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned goal by id" );
        res.status( 200 ).json( goal );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Goal not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Goal not found" );
        res.status( 404 ).json( message );
    }
    
    
}

exports.deleteGoalById = async (req, res) => {
    let success = await goalService.deleteGoalById(req.params.id);

    if (success) {
        res.set("x-agora-message-title", "Success");
        res.set("x-agora-message-detail", "Deleted goal");
        res.status(200).json("Success");
    }
    else {
        res.set("x-agora-message-title", "Not Found");
        res.set("x-agora-message-detail", "No goals were found meeting the query criteria");
        res.status(404).send("No Goals Found");
    }
}

exports.getAllVisibleGoalsWithTopics = async ( req, res ) => {
    // get all the active goals
    let goals = await goalService.getAllVisibleGoalsWithTopics();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}



exports.getAllGoalsForAuthUser = async ( req, res ) => {
    
    console.log("The rquest: " + JSON.stringify(req.user));

    // get all the goals for this owner
    let ownerGoals = await goalService.getAllGoalsForOwner( req.user.id, false );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals for user" );
    res.status( 200 ).json( ownerGoals );
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} goalId 
 */
exports.saveGoalImage = async ( req, res, goalId, filename ) => {

    // save image in db and delete old file  
    if( goalId > 0 ) {
        goalService.updateGoalImage( goalId, filename ).then( ( rValue ) => {
            if( rValue && ( rValue != 'goal-default.png' || rValue != 'peak.svg' ) ) {
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[goalController] file delete error status: " + err );
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
exports.saveGoal = async ( req, res, redirect ) =>{

    let goal = Goal.emptyGoal();
    

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }
    
    goal.ownedBy = authUserId; 

    if(authUserId > 0) {

        goal.id = req.body.goalId;

        // see if this is a modification of an existing goal
        let existingGoal = await goalService.getMostRecentGoalById( goal.id );

        // if this is an update replace the goal with teh existing one as the starting point
        if(existingGoal) {
            console.log("there was an existing goal for this id: " + JSON.stringify(existingGoal));
            goal = existingGoal;
        }

        // add changes from the body if they are passed
        goal.visibility = req.body.goalVisibility;
        goal.goalName = req.body.goalName;
        goal.goalDescription = req.body.goalDescription;
        
        // check to see if the incoming message format is from the UI form or the API for active
        if( req.body.goalActive ) {
            goal.active = ( req.body.goalActive == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            goal.active = req.body.active;
        }

        // check to see if the incoming message format is from the UI form or the API for completable
        if( req.body.goalCompletable ) {
            goal.completable = ( req.body.goalCompletable == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            goal.completable = req.body.active;
        }

        goal = await goalService.saveGoal( goal );

        /**
         * Once the goal is saved, save the image if it is passed in the multipart form data
         */
        if ( req.body.goalModified && req.body.goalModified != "false" && !req.files ) {
            // do nothing we are going to keep the original file
            console.log("goal trigger modification clause");
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            this.saveGoalImage( req, res, goal.id, 'peak.svg' );
            
        }
        else {
            // files included
            const file = req.files.goalImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log(`File ${file.name} size limit has been exceeded for goal`);

                if(redirect) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your goal was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return goal;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your goal was saved without the image.");
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your goal was saved without the image.");
                    res.status( 422 ).json( message );
                }             
            }
            else if( goal ) {
                await file.mv(goalUploadPath + timeStamp + file.name, async (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        if(redirect) {
                            req.session.messageType = "error";
                            req.session.messageTitle = "Error saving image!";
                            req.session.messageBody = "There was a error uploading your image for this goal. Your goal should be saved without the image.";
                            res.redirect( 303, '/dashboard' );
                            return goal;
                        }
                        else {
                            const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this goal. Your goal should be saved without the image." );
                            res.set( "x-agora-message-title", "Error saving image!" );
                            res.set( "x-agora-message-detail", "There was a error uploading your image for this goal. Your goal should be saved without the image." );
                            res.status( 422 ).json( message );
                        }
                    }
                    else {
                        await this.saveGoalImage( req, res, goal.id, timeStamp + file.name );
                    }
                });
            }
            else {
                if(redirect) {
                    req.session.messageType = "error";
                    req.session.messageTitle = "Error saving image!";
                    req.session.messageBody = "There was a error uploading your image for this goal. Your goal should be saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return goal;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this goal. Your goal should be saved without the image." );
                    res.set( "x-agora-message-title", "Error saving image!" );
                    res.set( "x-agora-message-detail", "There was a error uploading your image for this goal. Your goal should be saved without the image." );
                    res.status( 422 ).json( message );
                }
            }
        }



        if( goal ) {
            req.session.messageType = "success";
            req.session.messageTitle = "Goal Saved";
            req.session.messageBody = "Goal " + goal.goalName + " saved successfully!";
        }
        else {
            req.session.messageType = "error";
            req.session.messageTitle = "Error saving Goal <br />";
            req.session.messageBody = "There was a problem saving the goal. <br />";
        }

        // get the pathway
        let pathway = null;
        if(req.body.pathway) {
            pathway = req.body.pathway.split(",");
            goalService.savePathwayToexistingGoalVersion(goal.id, pathway);
        }


    }
    else {
        // there was no authenicated user
        if( redirect ) {
            return goal;
        }
        else {
            const message = ApiMessage.createApiMessage( 401, "Not Authorized", "Not able to associate authorized user with the record" );
            res.set( "x-agora-message-title", "Not Authorized" );
            res.set( "x-agora-message-detail", "Not able to associate authorized user with the record" );
            res.status( 401 ).json( message );
        }
    }
    
    if( redirect ) {
        console.log( "goalController.saveGoal() - END - Redirect ");
        return goal;
    }
    else {
        console.log( "goalController.saveGoal() - END - Non-Redirect ");
        res.setHeader( 'Content-Type', 'application/json' );
        res.send(JSON.stringify(goal));
    }
}