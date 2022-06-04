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
        cb( null, filename );
    }
})
let upload = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).single( 'goalImage' );
// end multer


exports.getAllActiveGoals = async function ( req, res ) {
    // get all the active goals
    let goals = await goalService.getAllActiveGoalsWithTopics();
    
    const message = ApiMessage.createApiMessage( 200, "Success", "getAllGoals call" );
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

    const message = ApiMessage.createApiMessage( 200, "Success", "getAllGoalsForAuthUser call" );
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals for user" );
    res.status( 200 ).json( ownerGoals );
}

/**
 * Saves a goal
 * @param {*} req 
 * @param {*} res 
 */
exports.saveGoal = async function( req, res, redirect ) {
    console.log("saving goal");
    console.log( " body has: " + JSON.stringify(req.body) );
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
    
    let existingGoal = await goalService.getMostRecentGoalById( goal.id );
    console.log( "most recent goal:" + JSON.stringify(existingGoal) + " goal: " + JSON.stringify( goal ) );
    console.log( "image path: " + UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH );

    upload(req, res, (err) => {
        

        if(err) {
            console.log("Error uploading picture : " + err);
            errorTitle += "Error Uploading Image <br />";
            errorBody += "File size was larger the 1MB, please use a smaller file. <br />";
            //res.redirect(303, '/profile/manageProfile');
        }
        else {
            // save image          
                
            
            // get the existing data
            if(existingGoal) {
                console.log("1");
                goal.id = existingGoal.id;
                goal.goalImage = existingGoal.goalImage

                // save the image if one is provided
                if(req.session.savedGoalFileName) {
                    goal.topicImage = req.session.savedGoalFileName;
                } 


                goal.ownedBy = req.session.authUser.id;
                //let goal = await goalService.saveGoal( );
                goalService.saveGoal( goal ).then( (goal ) => {
                    console.log("1-1");
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
                })
                
            }
            else {
                console.log("2");
                goal.ownedBy = req.session.authUser.id; 

                // save the image if one is provided
                if(req.session.savedGoalFileName) {
                    goal.topicImage = req.session.savedGoalFileName;
                } 

                // let goal = await goalService.saveGoal( goal );
                goalService.saveGoal( goal ).then( ( goal ) => {
                    console.log("2-1");
                    if( goal ) {
                        messageTitle = "Goal Saved";
                        messageBody = "Goal " + goal.goalName + " saved successfully!";
                    }
                    else {
                        errorTitle += "Error saving Goal <br />";
                        errorBody += "There was a problem saving the goal. <br />";
                    }
                }) ;
            }
            
            //res.redirect(303, '/dashboard');

            // create the ApiMessage
            const apiRes = ApiMessage.createApiMessage( goal, 200, "Success", "Goal Saved");

            if( redirect ) {
                console.log("3-1");
                return apiRes;
            }
            else {
                console.log("3-2");
                res.setHeader( 'Content-Type', 'application/json' );
                res.send(JSON.stringify(apiRes));
            }
            

        }  
    });
}