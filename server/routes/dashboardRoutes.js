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
let maxSize = 1 * 1024 * 1024;


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
        console.log(req.headers("x-agora-message-title"));
        if( req.headers( "x-agora-message-title" ) ) {
            req.session.messageTitle = req.headers( "x-agora-message-title" );
        }
        if( req.header( "x-agora-message-detail" ) ) {
            req.session.messageBody = req.header( "x-agora-message-detail" );
        }
        dashboardController.getDashboard( req, res );
    }
);

/** 
 * Form enctype="multipart/form-data" route using express-fileupload for file upload
 * 
 */
router.route( '/goal' )
    .post( async ( req, res ) => {

        // save the goal
        let rGoal = await goalController.saveGoal( req, res, true );

        // reset the upload message if there is one
        if( req.session.uploadMessage ) {
            req.session.uploadMessage = undefined;
        }

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

                const messageTitle = "Image too large!";
                const messageBody = "Image size was larger the 1MB, please use a smaller file.";

                res.set( "x-agora-message-title", messageTitle );
                res.set( "x-agora-message-detail", messageBody );
            }

            else if( rGoal ) {
                file.mv(goalUploadPath + timeStamp + file.name, (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
                        res.redirect( 303, '/dashboard' );
                        return;
                    }
                    else {
                        goalController.saveGoalImage( req, res, rGoal.id, timeStamp + file.name );
                    }
                });
            }

            else {
                const messageTitle = "Error saving goal!";
                const messageBody = "The goal did not save within the system.";

                res.set( "x-agora-message-title", messageTitle );
                res.set( "x-agora-message-detail", messageBody );
            }
        }

        res.redirect(303, '/dashboard');
    }
);





module.exports = router;