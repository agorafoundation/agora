/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();

const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );

// service requires
let workspaceService = require( '../../service/workspaceService' );
let topicService = require( '../../service/topicService' );

// model requires
let Workspace = require( '../../model/workspace' );
const { localsName } = require( 'ejs' );

// import multer (file upload) and setup
const fs = require( 'fs' );
let path = require( 'path' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', process.env.STORAGE_BASE_PATH );
let FRONT_END = process.env.FRONT_END_NAME;
let IMAGE_PATH = process.env.WORKSPACE_IMAGE_PATH;

// set the max image size for avatars and resource, topic and workspace icons
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
};

let storage = multer.diskStorage( {
    destination: function ( req, file, cb ) {
        cb( null, UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH );
    },
    filename: function ( req, file, cb ) {
        let filename = Date.now() + file.originalname;
        req.session.savedWorkspaceFileName = filename;
        cb( null, filename );
    }
} );
let upload = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).single( 'workspaceImage' );
// end multer



router.route( '/' )
    .get( async function ( req, res ) {
        // get all the workspaces for this owner
        let ownerWorkspaces = await workspaceService.getAllWorkspacesForOwner( req.session.authUser.userId, false );
      
        //console.log("------------- owner workspaces: " + JSON.stringify(ownerWorkspaces));
        let workspace = null;
        
        res.render( './admin/adminWorkspace', {ownerWorkspaces: ownerWorkspaces, workspace: workspace} );
      
    } )
    .post( async function( req, res ) {
        // moved to dashboard controller

        
    }
    );


router.route( '/:workspaceId' )
    .get( async function ( req, res ) {
        let message = '';
        if( req.locals && req.locals.message ) {
            message = req.locals.message;
        }
        
        let workspaceId = req.params.workspaceId;

        // get all the workspaces for this owner
        let ownerWorkspaces = await workspaceService.getAllWorkspacesForOwner( req.session.authUser.userId, false );

        // get all the topics for this owner
        let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.userId, true );
        // start the available topics out with the full owner topic set
        let availableTopics = ownerTopics;

        let workspace = Workspace.emptyWorkspace();
        if( workspaceId > 0 ) {
            workspace = await workspaceService.getActiveWorkspaceWithTopicsById( workspaceId, false );

            // iterate through the workspaces assigned topics, remove them from the available list
            for( let i=0; i < workspace.topics.length; i++ ) {
                let redundantTopic = ownerTopics.map( ot => ot.id ).indexOf( workspace.topics[i].id );
                
                ~redundantTopic && availableTopics.splice( redundantTopic, 1 );
            }

            // get the topics that are not currently assigned to this workspace

        }
        else {
            workspace.ownedBy = req.session.authUser.userId;
            workspace.workspaceVersion = 1;
        }
      
        
        // make sure the user has access to this workspace (is owner)
        if( workspace.ownedBy === req.session.authUser.userId ) {
            res.render( './admin/adminWorkspace', {ownerWorkspaces: ownerWorkspaces, workspace: workspace, availableTopics: availableTopics} );
        }
        else {
            message = 'Access Denied';
            let message2 = 'You do not have access to the requested resource';
            res.render( './admin/adminWorkspace', {ownerWorkspaces: ownerWorkspaces, workspace: null, message: message, message2: message2} );
        }
    }
    );

module.exports = router;