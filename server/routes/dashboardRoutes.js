/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
const rateLimit = require('express-rate-limit');

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// setup json body parser
const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const WORKSPACE_PATH = process.env.WORKSPACE_IMAGE_PATH;
const RESOURCE_PATH = process.env.RESOURCE_IMAGE_PATH;

// setup fileupload (works with enctype="multipart/form-data" encoding in request)
const fileUpload = require( "express-fileupload" );
router.use(
    fileUpload()
);

// controllers
const dashboardController = require( '../controller/dashboardController' );
const workspaceController = require( '../controller/apis/workspaceController' );
const resourceController = require( '../controller/apis/resourceController' );


/**
 * Pre Route
 * Check that the user is logged in (required!)
 */
router.use( function ( req, res, next ) {
    //console.log( "req.query.redirect: " + req.query.redirect );
    //console.log( "dashboard user: " + req.session.authUser );
    if( !req.session.authUser ) {
        
        //console.log( "auth user invalid" );
        if( req.query.redirect ) {
            //console.log( "redirecting to: " + req.query.redirect );
            res.locals.redirect = req.query.redirect;
        } 

        res.render( 'user-signup' );
    }
    else {
        next( );
    }
} );

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

const workspaceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 2, // Limit each IP to 50 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 1 minutes"
});

router.route( '/workspace' )
    .post( workspaceLimiter, async ( req, res ) => {

        // save the workspace
        await workspaceController.saveWorkspace( req, res, true );
        
        res.redirect( 303, '/dashboard' );
    }
    );


/** 
 * Form enctype="multipart/form-data" route using express-fileupload for file upload
 * 
 */

const resourceLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 60, // Limit each IP to 60 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 1 minutes"
});

router.route( '/resource' )
    .post( resourceLimiter, async ( req, res ) => {
        
        // save the resource
        await resourceController.saveResource( req, res, true );

        res.redirect( 303, '/dashboard' );
    }
    );





module.exports = router;