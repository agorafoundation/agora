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
const bodyParser = require( 'body-parser' );
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const GOAL_PATH = process.env.GOAL_IMAGE_PATH;
const RESOURCE_PATH = process.env.RESOURCE_IMAGE_PATH;

// goal file path
const goalUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + GOAL_PATH;
const resourceUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + RESOURCE_PATH;

// set the max image size for avatars and resource, topic and goal icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

// setup fileupload (works with enctype="multipart/form-data" encoding in request)
const fileUpload = require( "express-fileupload" );
router.use(
    fileUpload()
);

// controllers
const dashboardController = require( '../controller/dashboardController' );
const goalController = require( '../controller/apis/goalController' );
const resourceController = require( '../controller/apis/resourceController' );


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

                req.session.messageType = "warn";
                req.session.messageTitle = "Image too large!";
                req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your goal was saved without the image.";
                
            }
            else if( rGoal ) {
                await file.mv(goalUploadPath + timeStamp + file.name, async (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        req.session.messageType = "error";
                        req.session.messageTitle = "Error uploading image!";
                        req.session.messageBody = "There was a error uploading your image for this goal. Your goal should be saved without the image.";
                        res.redirect( 303, '/dashboard' );
                        return;
                    }
                    else {
                        await goalController.saveGoalImage( req, res, rGoal.id, timeStamp + file.name );
                    }
                });
            }
            else {
                req.session.messageType = "error";
                req.session.messageTitle = "Error saving goal!";
                req.session.messageBody = "The goal did not save within the system.";
            }
        }
        
        res.redirect(303, '/dashboard');
    }
);


/** 
 * Form enctype="multipart/form-data" route using express-fileupload for file upload
 * 
 */
router.route( '/resource' )
    .post( async ( req, res ) => {

        // save the resource
        let rResource = await resourceController.saveResource( req, res, true );

        console.log("incomming value of req.body.resourceModified: " + req.body.resourceModified);

        if ( req.body.resourceModified != "false" && !req.files ) {
            // do nothing we are going to keep the original file
            console.log("trigger modification clause");
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            resourceController.saveResourceImage( req, res, rResource.id, 'resource-default.png' );
            
        }
        else {
            // files included
            const file = req.files.resourceImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log(`File ${file.name} size limit has been exceeded`);

                req.session.messageType = "warn";
                req.session.messageTitle = "Image too large!";
                req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your resource was saved without the image.";
                
            }
            else if( rResource ) {
                await file.mv(resourceUploadPath + timeStamp + file.name, async (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        req.session.messageType = "error";
                        req.session.messageTitle = "Error uploading image!";
                        req.session.messageBody = "There was a error uploading your image for this resource. Your resource should be saved without the image.";
                        res.redirect( 303, '/dashboard' );
                        return;
                    }
                    else {
                        await resourceController.saveResourceImage( req, res, rResource.id, timeStamp + file.name );
                    }
                });
            }
            else {
                req.session.messageType = "error";
                req.session.messageTitle = "Error saving resource!";
                req.session.messageBody = "The resources did not save within the system.";
            }
        }
        
        res.redirect(303, '/dashboard');
    }
);





module.exports = router;