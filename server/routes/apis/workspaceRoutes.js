/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );

//dependencies 

const rateLimit = require('express-rate-limit');

// controllers
const workspaceController = require( '../../controller/apis/workspaceController' );
const { get } = require( './tagRoutes' );

const workspacesLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 50, // Limit each IP to 50 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 15 minutes"
});


// workspaces /api/v1/auth/workspaces
router.route( '/' )
    // get all visible workspaces
    .get( async ( req, res ) => {
        workspaceController.getAllVisibleWorkspaces( req, res );
    } )    
    // save a new workspace
    .post(workspacesLimiter, async ( req, res ) => { 
        workspaceController.saveWorkspace( req, res );
    }
    );

// workspaces /api/v1/auth/workspaces
router.route( '/:workspaceId' )
    // get a visible workspace by id
    .get( async ( req, res ) => {
        workspaceController.getWorkspaceById( req, res );
    
    } )
    // delete a visible workspace by id
    .delete( async ( req, res ) => {
        workspaceController.deleteWorkspaceById( req, res );
    }
    );

// Topics /api/v1/auth/workspaces/topics/:workspaceId
// workspaces /api/v1/auth/workspaces/topics/:workspaceId

router.route( '/topics/:workspaceId' )
    .get( async ( req, res ) => {
        workspaceController.getAllTopicsForWorkspaceId( req, res );
    }
    );

// enrollment management
router.route( '/enroll/:userId/:workspaceId' )
    // enroll an eligible user in a visibile workspace
    .post( async ( req, res ) => {

    } )
    // remove a users en
    .delete( async ( req, res ) => {

    }
    );



module.exports = router;