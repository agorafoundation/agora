/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// setup json body parser
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
let FRONT_END = process.env.FRONT_END_NAME;
let GOAL_PATH = process.env.GOAL_IMAGE_PATH;

// goal file path
const goalUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH;
//

// set the max image size for avatars and resource, topic and goal icons
let maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
console.log("IMAGE_UPLOAD_MAX_SIZE: " + maxSize);

// setup fileupload (works with enctype="multipart/form-data" encoding in request)
const fileUpload = require("express-fileupload");
router.use(
    fileUpload()
);


// controllers
const dashboardController = require( '../controller/dashboardController' );
const goalController = require( '../controller/apis/goalController' );
//const { redirect } = require('express/lib/response');

/**
 * Pre Route
 * Check that the user is logged in (required!)
 */
router.use(function ( req, res, next ) {
    if( !req.session.authUser ) {
        if( req.query.redirect ) {
             res.locals.redirect = req.query.redirect;
        }
        res.render( 'user-signup' );
    }
    else {
        next( );
    }
     
})

/**
 * Show main dashboard route
 */
router.route( '/' )
    .get( ( req, res ) => {
        console.log("showing dashboard");
        console.log(JSON.stringify(req.session));

        dashboardController.getDashboard( req, res );
    }
);

/** 
 * Form enctype="multipart/form-data" route using express-fileupload for file upload
 * 
 */
router.route( '/goal' )
    .post( async ( req, res ) => {

        let messageTitle = "";
        let messageBody = "";
        let messageType = "";

        if( req.session.messageType ) {
            messageType = req.session.messageType;
            delete req.session.messageType;
        }
        if( req.session.messageTitle ) {
            messageTitle = req.session.messageTitle;
            delete req.session.messageTitle;
        }
        if( req.session.messageBody ) {
            messageBody = req.session.messageBody;
            delete req.session.messageBody;
        }

        // save the goal
        let rGoal = await goalController.saveGoal( req, res, true );

        if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            goalController.saveGoalImage( req, res, rGoal.id, 'goal-default.png' );
            
        }
        else {
            // files included
            const file = req.files.goalImage;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log(`File ${file.name} size limit has been exceeded`);

                messageType = "warn";
                messageTitle = "Image too large!";
                messageBody = "Image size was larger then " + maxSize + " KB, please use a smaller file. Your goal was saved without the image.";
                
            }
            else if( rGoal ) {
                file.mv(goalUploadPath + timeStamp + file.name, (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        messageType = "error";
                        messageTitle = "Error uploading image!";
                        messageBody = "There was a error uploading your image for this goal. Your goal should be saved without the image.";
                        res.redirect( 303, '/dashboard' );
                        return;
                    }
                    else {
                        goalController.saveGoalImage( req, res, rGoal.id, timeStamp + file.name );
                    }
                });
            }
            else {
                messageType = "error";
                messageTitle = "Error saving goal!";
                messageBody = "The goal did not save within the system.";
            }
        }

        req.session.messageType = messageType;
        req.session.messageTitle = messageTitle;
        req.session.messageBody = messageBody;
        
        res.redirect(303, '/dashboard');
    }
);





module.exports = router;