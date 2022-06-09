/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
// import multer (file upload) and setup
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
let IMAGE_PATH = process.env.GOAL_IMAGE_PATH;

// set the max image size for avatars and resource, topic and goal icons
let maxSize = 1 * 1024 * 1024;

// Start multer
let multer = require( 'multer' );
const { toUnicode } = require('punycode');

const fileFilter = ( req, file, cb ) => {
    if( file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png' ) {
        cb( null, true );
    }
    else {
        cb( null, false );
    }
}

let storage = multer.diskStorage({
    destination: function ( req, file, cb ) {
      cb( null, UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH )
    },
    filename: function ( req, file, cb ) {
        let filename = Date.now( ) + file.originalname;
        
        req.session.savedGoalFileName = filename;
        console.log("the filename is ----  " + req.session.savedGoalFileName);

        cb( null, filename );
    }
})
let upload = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).single( 'goalImage' );
// end multer


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
 * @param {*} goalRid 
 */
exports.saveGoalImage = async function( req, res, goalRid ) {
    console.log( "goalController.saveGoalImage() - START goalRid:  " + goalRid);

    console.log(0);

    if(req.session.uploadMessage) {
        console.log(1);
        req.session.uploadMessage = undefined;
    }
    
    //call multer upload function defined near top
    console.log(2);
    upload( req, res, ( err ) => {
        console.log(3);
        if( err ) {
            console.log(4);
            console.log( "Error uploading profile picture : " + err );
            req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
            res.redirect( 303, '/dashboard' );
            return false;
        }
        else {
            console.log(5);
            // save image in db and delete old file  
            if( goalRid > 0 ) {
                console.log("rid: " + goalRid + " saved filename: " + req.session.savedGoalFileName);
                goalService.updateGoalImage( goalRid, req.session.savedGoalFileName ).then( ( rValue ) => {
                    console.log(7);
                    if( rValue && rValue != 'goal-default.png' ) {
                        console.log(8);
                        fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH + rValue, ( err ) => {
                            console.log(9);
                            if( err ) {
                                console.log(10);
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
    })
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 * @param {*} redirect 
 * @returns 
 */
exports.saveGoal = async function( req, res, redirect ) {
    console.log( "goalController.saveGoal() - START ");
    console.log( " body has: " + JSON.stringify( req.body ) );
    let messageTitle = null;
    let messageBody = null;
    let errorTitle = null;
    let errorBody = null;

    let goal = Goal.emptyGoal();
    goal.id = req.body.goalId;

    goal.visibility = req.body.goalVisibility;
    goal.goalName = req.body.goalName;
    goal.goalDescription = req.body.goalDescription;
    goal.active = ( req.body.goalActive == "on" ) ? true : false;
    goal.completable = ( req.body.goalCompletable == "on") ? true : false;
    goal.goalImage = req.body.goalImage;
    
    // see if this is a modification of an existing goal
    let existingGoal = await goalService.getMostRecentGoalById( goal.id );

    // get the existing data
    if(existingGoal) {
        goal.id = existingGoal.id;
        goal.goalImage = existingGoal.goalImage

        goal.ownedBy = req.session.authUser.id;
        //let goal = await goalService.saveGoal( );
        let goal = await goalService.saveGoal( goal );

        if( goal ) {
            messageTitle = "Goal Updated";
            messageBody = "Goal " + goal.goalName + " updated successfully!";
        }
        else {
            errorTitle += "Error updating Goal <br />";
            errorBody += "There was a problem updating the goal. <br />";
        }
        
        // get the pathway
        let pathway = null;
        if(req.body.pathway) {
            pathway = req.body.pathway.split(",");
            goalService.savePathwayToexistingGoalVersion(goal.id, pathway);
        }
        
    }
    else {

        goal.ownedBy = req.session.authUser.id; 
        goal = await goalService.saveGoal( goal );

        if( goal ) {
            messageTitle = "Goal Saved";
            messageBody = "Goal " + goal.goalName + " saved successfully!";
        }
        else {
            errorTitle += "Error saving Goal <br />";
            errorBody += "There was a problem saving the goal. <br />";
        }
        
    }
    
    // create the ApiMessage

    if( redirect ) {
        console.log( "goalController.saveGoal() - END - Redirect ");
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