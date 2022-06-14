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

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let GOAL_PATH = process.env.GOAL_IMAGE_PATH;


exports.getAllActiveGoals = async function ( req, res ) {
    // get all the active goals
    let goals = await goalService.getAllActiveGoalsWithTopics();
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}

exports.getGoalById = async function ( req, res ) {
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

exports.getAllGoalsForAuthUser = async function ( req, res ) {
    // get all the goals for this owner
    let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false );

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
exports.saveGoalImage = async function( req, res, goalId, filename ) {
    console.log( "goalController.saveGoalImage() - START goalId:  " + goalId);

    console.log(0);

    
    
    // save image in db and delete old file  
    if( goalId > 0 ) {
        console.log("rid: " + goalId + " saved filename: " + filename);
        goalService.updateGoalImage( goalId, filename ).then( ( rValue ) => {
            if( rValue && rValue != 'goal-default.png' ) {
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[goalController] file delete error status: " + err );
                        return false;
                    }
                    
                });
            } 
        });
    }
    
    console.log( "goalController.saveGoalImage() - END ");
    return true;

        
    
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} redirect 
 * @returns 
 */
exports.saveGoal = async function( req, res, redirect ) {

    let messageTitle = null;
    let messageBody = null;
    let errorTitle = null;
    let errorBody = null;

    let goal = Goal.emptyGoal();
    goal.id = req.body.goalId;

    console.log("the body rec. by the controller: " + JSON.stringify(req.body));

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
    goal.active = ( req.body.goalActive == "on" ) ? true : false;
    goal.completable = ( req.body.goalCompletable == "on") ? true : false;
    
    goal.ownedBy = req.session.authUser.id; 
    goal = await goalService.saveGoal( goal );

    console.log("saved goal: " + JSON.stringify(goal));

    if( goal ) {
        messageTitle = "Goal Saved";
        messageBody = "Goal " + goal.goalName + " saved successfully!";
    }
    else {
        errorTitle += "Error saving Goal <br />";
        errorBody += "There was a problem saving the goal. <br />";
    }

    // get the pathway
    let pathway = null;
    if(req.body.pathway) {
        pathway = req.body.pathway.split(",");
        goalService.savePathwayToexistingGoalVersion(goal.id, pathway);
    }
    
    // create the ApiMessage

    if( redirect ) {
        console.log( "goalController.saveGoal() - END - Redirect ");
        res.set( "x-agora-message-title", messageTitle );
        res.set( "x-agora-message-detail", messageBody );
        return goal;
    }
    else {
        console.log( "goalController.saveGoal() - END - Non-Redirect ");
        res.setHeader( 'Content-Type', 'application/json' );
        res.set( "x-agora-message-title", messageTitle );
        res.set( "x-agora-message-detail", messageBody );
        res.send(JSON.stringify(goal));
    }
}