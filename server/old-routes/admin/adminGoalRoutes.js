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
let goalService = require( '../../service/goalService' );
let topicService = require( '../../service/topicService' );

// model requires
let Goal = require( '../../model/goal' );
const { localsName } = require( 'ejs' );

// import multer (file upload) and setup
const fs = require( 'fs' );
let path = require( 'path' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', process.env.STORAGE_BASE_PATH );
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
};

let storage = multer.diskStorage( {
    destination: function ( req, file, cb ) {
        cb( null, UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH );
    },
    filename: function ( req, file, cb ) {
        let filename = Date.now() + file.originalname;
        req.session.savedGoalFileName = filename;
        cb( null, filename );
    }
} );
let upload = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).single( 'goalImage' );
// end multer



router.route( '/' )
    .get( async function ( req, res ) {
        // get all the goals for this owner
        let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false );
        //console.log("------------- owner goals: " + JSON.stringify(ownerGoals));
        let goal = null;
        
        res.render( './admin/adminGoal', {ownerGoals: ownerGoals, goal: goal} );
      
    } )
    .post( async function( req, res ) {
        // moved to dashboard controller

        
    }
    );


router.route( '/:goalId' )
    .get( async function ( req, res ) {
        let message = '';
        if( req.locals && req.locals.message ) {
            message = req.locals.message;
        }
        
        let goalId = req.params.goalId;

        // get all the goals for this owner
        let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false );

        // get all the topics for this owner
        let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.id, true );
        // start the available topics out with the full owner topic set
        let availableTopics = ownerTopics;

        let goal = Goal.emptyGoal();
        if( goalId > 0 ) {
            goal = await goalService.getActiveGoalWithTopicsById( goalId, false );

            // iterate through the goals assigned topics, remove them from the available list
            for( let i=0; i < goal.topics.length; i++ ) {
                let redundantTopic = ownerTopics.map( ot => ot.id ).indexOf( goal.topics[i].id );
                
                ~redundantTopic && availableTopics.splice( redundantTopic, 1 );
            }

            // get the topics that are not currently assigned to this goal

        }
        else {
            goal.ownedBy = req.session.authUser.id;
            goal.goalVersion = 1;
        }
      
        
        // make sure the user has access to this goal (is owner)
        if( goal.ownedBy === req.session.authUser.id ) {
            res.render( './admin/adminGoal', {ownerGoals: ownerGoals, goal: goal, availableTopics: availableTopics} );
        }
        else {
            message = 'Access Denied';
            let message2 = 'You do not have access to the requested resource';
            res.render( './admin/adminGoal', {ownerGoals: ownerGoals, goal: null, message: message, message2: message2} );
        }
    }
    );

module.exports = router;