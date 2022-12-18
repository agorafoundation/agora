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
let topicService = require( '../../service/topicService' );
let resourceService = require( '../../service/resourceService' );
let activityService = require( '../../service/activityService' );
let assessmentService = require( '../../service/assessmentService' );

// model requires
const Topic = require( '../../model/topic' );
const Activity = require( '../../model/activity' );
const Assessment = require( '../../model/assessment' );
const AssessmentQuestion = require( '../../model/assessmentQuestion' );
const AssessmentQuestionOption = require( '../../model/assessmentQuestionOption' ); 

// import multer (file upload) and setup
const fs = require( 'fs' );
let path = require( 'path' );

// set up file paths for user profile images
let UPLOAD_PATH_BASE = path.resolve( __dirname, '..', process.env.STORAGE_BASE_PATH );
let FRONT_END = process.env.FRONT_END_NAME;
let IMAGE_PATH = process.env.TOPIC_IMAGE_PATH;

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
        req.session.savedTopicFileName = filename;
        cb( null, filename );
    }
} );
let upload = multer( { storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } } ).single( 'topicImage' );
// end multer



router.route( '/' )
    .get( async function ( req, res ) {
        // get all the topics for this owner
        let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.userId );
        //console.log("------------- owner topics: " + JSON.stringify(ownerTopics));
        let topic = null;
        
        res.render( './admin/adminTopic', {ownerTopics: ownerTopics, topic: topic} );
      
    } )
    .post( async function( req, res ) {
        upload( req, res, ( err ) => {

            if( err ) {
                console.log( "Error uploading picture : " + err );
                req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file.";
                res.redirect( 303, '/a/topic' );
            }
            else {
                // create topic        
                let topic = Topic.emptyTopic();
                topic.topicId = req.body.topicId;

                topic.topicName = req.body.topicName;
                topic.topicDescription = req.body.topicDescription;
                topic.topicHtml = req.body.submission_text;
                topic.active = ( req.body.topicActive == "on" ) ? true : false;

                if( req.body.topicAssessmentId ) {
                    topic.assessmentId = req.body.topicAssessmentId;
                }

                // if there an existing image for this topic populate it incase the user did not change it, also set the owned by to the orginal
                //console.log("cheking the id: " + topic.topicId);
                if( topic.topicId > 0 ) {
                    topicService.getTopicById( topic.topicId ).then( ( dbTopic ) => {
                        topic.topicId = dbtopic.topicId;
                        topic.topicImage = dbTopic.topicImage;

                        // save the image if one is provided
                        if( req.session.savedTopicFileName ) {
                            topic.topicImage = req.session.savedTopicFileName;
                        } 

                        topic.ownedBy = req.session.authUser.userId;
                        
                    } );
                }
                else {
                    topic.ownedBy = req.session.authUser.userId; 
                    
                    if( req.session.savedTopicFileName ) {
                        topic.topicImage = req.session.savedTopicFileName;
                    }
                    

                }

                // topic activity
                // check to see if there is already an activity to update
                if( !topic.activityId > 0 ) {
                    if( !topic.activity ) {
                        topic.activity = Activity.emptyActivity();
                    }   
                }

                // check to see if the activty should be included in the topic
                topic.hasActivity = true;
                ( req.body.topicHasActivity == 'checked' ) ? topic.hasActivity = true : topic.hasActivity = false;

                if( req.body.activityName ) {
                    topic.activity.activityName = req.body.activityName;
                }
                if( req.body.activityDescription ) {
                    topic.activity.activityDescription = req.body.activityDescription;
                }
                if( req.body.activity_html ) {
                    topic.activity.activityHtml = req.body.activity_html;
                }

                // assessment
                if( !topic.assessmentId > 0 ) {
                    if( !topic.assessment ) {
                        topic.assessment = Assessment.emptyAssessment();
                    }
                }
                else {
                    topic.assessment.assessmentId = topic.assessmentId;
                }

                // TODO: is there anything to do with assessment type?? currently hard coding 1, isRequired is currently deemed to be true for all assessments.
                topic.assessment.assessmentType = 1;
                topic.assessment.isRequired = true;

                if( req.body.topicAssessmentName ) {
                    topic.assessment.assessmentName = req.body.topicAssessmentName;
                }

                if( req.body.topicAssessmentDescription ) {
                    topic.assessment.assessmentDescription = req.body.topicAssessmentDescription;
                }

                if( req.body.topicAssessmentPreThreshold ) {
                    topic.assessment.preThreshold = req.body.topicAssessmentPreThreshold;
                }

                if( req.body.topicAssessmentPostThreshold ) {
                    topic.assessment.postThreshold = req.body.topicAssessmentPostThreshold;
                }

                topic.assessment.active = false;
                ( req.body.topicAssessmentActive == 'checked' ) ? topic.assessment.active = true : topic.assessment.active = false;
                
                // assessment questions
                let numQuestions = 0;
                if( req.body.topicAssessmentQuestionId ) {
                    numQuestions = req.body.topicAssessmentQuestionId.length;
                }
                
                for( let i = 1; i <= numQuestions; i++ ) {
                    // create each question
                    let question = AssessmentQuestion.emptyAssessmentQuestion();
                    question.id = i;
                    question.assessmentId = -1;
                    question.question = req.body["topicAssessmentQuestionName-" + i ];
                    question.isRequired = true;

                    // go through each option
                    if( req.body["topicAssessmentQuestionOptionId-" + i] ) {
                        let optionLength = req.body["topicAssessmentQuestionOptionId-" + i].length;
                        for( let j = 0; j < optionLength; j++ ) {
                            // create the option
                            let questionOption = AssessmentQuestionOption.emptyAssessmentQuestionOption();
                            questionOption.active = true;

                            // trying a fix for the issue where options have each letter saved as individual option
                            if( optionLength > 1 ) {
                                questionOption.optionAnswer = req.body["topicAssessmentQuestionOptions-" + i][j];
                            }
                            else {
                                questionOption.optionAnswer = req.body["topicAssessmentQuestionOptions-" + i];
                            }
                            
                            questionOption.optionNumber = ( j + 1 );
                            // check to see if this is the checked option to set correct
                            if( req.body["topicAssessmentQuestionOptionsCorrect-" + i ] == req.body["topicAssessmentQuestionOptionId-" + i ][j] ) {
                                question.correctOptionId = req.body["topicAssessmentQuestionOptionsCorrect-" + i ];
                            }
                            
                            questionOption.assessmentQuestionId = i;

                            question.options.push( questionOption );
                        }
                        
                    }
                    topic.assessment.questions.push( question );
                    
                }

                // save the activity
                activityService.saveActivity( topic.activity ).then( ( returnedActivity ) => {
                    topic.activity = returnedActivity;
                    topic.activityId = returnedactivity.activityId;
                    
                    // save the assessment
                    assessmentService.saveAssessment( topic.assessment ).then( ( returnedAssessment ) => {
                        topic.assessmentId = returnedassessment.assessmentId;

                        // save the topic
                        topicService.saveTopic( topic ).then( ( savedTopic ) => {

                            // get the pathway
                            let selectedTopicResources = null;
                            let selectedTopicResourcesRequired = null;
                            
                            if( req.body.selectedTopicResources ) {
                                if( req.body.selectedTopicResourcesRequired ) {
                                    selectedTopicResourcesRequired = req.body.selectedTopicResourcesRequired.split( "," );
                                }
                                selectedTopicResources = req.body.selectedTopicResources.split( "," );
                                topicService.saveResourcesForTopic( savedtopic.topicId, selectedTopicResources, selectedTopicResourcesRequired );
                            }

                            // save the assessment

                            res.locals.message = "Topic Saved Successfully";
                            res.redirect( 303, '/a/topic/' + savedtopic.topicId );
                        } );
                    } );

                    
                } );

                
                
                //res.redirect(303, '/a/topic');

            }  
        } );


        
    }
    );


router.route( '/:topicId' )
    .get( async function ( req, res ) {
        let message = '';
        if( req.locals && req.locals.message ) {
            message = req.locals.message;
        }
        
        let topicId = req.params.topicId;

        // get all the topics for this owner
        let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.userId, false );

        // get the topic by id
        let topic = Topic.emptyTopic();
        if( topicId > 0 ) {
            topic = await topicService.getTopicWithEverythingById( topicId, false );
        }
        else {
            topic.ownedBy = req.session.authUser.userId;
        }

        // get all the resources for this owner
        let ownerResources = await resourceService.getAllActiveResourcesForOwner( req.session.authUser.userId );

        // start the available topics out with the full owner resource set
        let availableResources = ownerResources;
        //console.log("Topic resources: " + JSON.stringify(topic));
        //console.log("Available resources: " + JSON.stringify(availableResources));

        // iterate through the resources already associated with the topic, remove them from the available list
        if( topic.resources ) {
            for( let i=0; i < topic.resources.length; i++ ) {
                let redundantResource = ownerResources.map( ot => ot.id ).indexOf( topic.resources[i].id );

                ~redundantResource && availableResources.splice( redundantResource, 1 );
            }
        }
      
        //console.log("Resources after removal: " + JSON.stringify(availableResources));
        
        // make sure the user has access to this topic (is owner)
        if( topic.ownedBy === req.session.authUser.userId ) {
            res.render( './admin/adminTopic', {ownerTopics: ownerTopics, topic: topic, availableResources: availableResources} );
        }
        else {
            message = 'Access Denied';
            let message2 = 'You do not have access to the requested resource';
            res.render( './admin/adminTopic', {ownerTopics: ownerTopics, topic: null, message: message, message2: message2} );
        }
    }
    );

module.exports = router;