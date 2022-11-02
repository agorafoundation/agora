/**
 * This file is a massive TODO 
 * This was all the logic originally in Coding Coach's topicRoutes.js
 * It handled all of the routing and controller code (was not broken out)
 * for the lesson process.  At this time this was simply called Topic
 * as the primary purpose for topic was to enroll and take as a class
 * now topics are stand alone and make just represent an organizational 
 * structure
 * 
 * This should be re-visited when I get to re-implementing the process of 
 * enrolling in a goal and taking a topic.
 * 
 * One of the first questions should be to determine if this is actually an
 * API router / controller or a page router / controller or some combination
 * thereof. I think this will be more clear once the actual goal, toic and
 * resource API routes and controllers are built out.
 */

/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();


// require services
const topicService = require( '../../service/topicService' );
const productService = require( '../../service/productService' );
const userService = require( '../../service/userService' );
const assessmentService = require( '../../service/assessmentService' );
const resourceService = require( '../../service/resourceService' );

// models
const TopicEnrollment = require( '../../model/topicEnrollment' );
const CompletedAssessment = require( '../../model/completedAssessment' );
const CompletedAssessmentQuestion = require( '../../model/completedAssessmentQuestion' );
const CompletedActivity = require( '../../model/completedActivity' );


const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );





/**
 * Called by topic-navigation when the user manually navigates 
 * to a specific place within the topic components.
 * 
 * This is not used to save data, just override current screen and change to another.
 * 
 */
router.route( '/override/:goalId/:topicId/:step' )
    .get( async ( req, res ) => {
        let goalId = req.params.goalId;
        let topicId = req.params.topicId;
        let stepOverride = req.params.step;

        let access = false;
        if( req.session.authUser ) {
            // check that the user is enrolled!
            access = await topicService.verifyTopicAccess( req.session.authUser.id, topicId );

            if( access ) {
                
                let currentTopic = null;
                let currentEnrollment = null;
                
                if( req.session.currentTopic && req.session.currentTopic.topicId == topicId ) {
                    // we have the current topic in the session already
                    currentTopic = req.session.currentTopic.topic;
                    currentEnrollment = req.session.currentTopic;
                }
                else {
                    // there is no current topic or a new topic has been choosen
                    currentEnrollment = await topicService.getActiveTopicEnrollmentsByUserAndTopicIdWithEverything( req.session.authUser.id, topicId, true );
                    currentTopic = currentEnrollment.topic;

                    // set the session
                    req.session.currentTopic = currentTopic;
                }


                res.locals.topicEnrollment = currentEnrollment;
                res.locals.topic = currentTopic;

                // open the course
                res.render( 'community/topic', {user: req.session.authUser, goalId: req.session.goalId, hasAccess: access, currentStep: stepOverride} );

            }
            else {
                // user does not have access send to community page
                res.redirect( 303, '/community' );
            }
        }

    }
    );

/**
 * Called by 
 * topic-introuction
 * topic-assessment
 * topic-resource
 * topic-activity
 * passing the finished step so data can be saved and the user sent to the next step using
 * /community/topic/goalId/topicId
 * 
 */
router.route( '/update/:finishedStep' )
    .get( async ( req, res ) => {
        if( req.session.currentTopic ) {
            let goalId = req.session.goalId;
            let topicId = req.session.currentTopic.topicId;
            let finishedStep = req.params.finishedStep;

            if( finishedStep == 1 ) {
                req.session.currentTopic.isIntroComplete = true;
                
                // save the data
                topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );

                // reroute
                res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );
            }

            if( finishedStep == 2 ) {
                // create the completed assessment 
                let ca = CompletedAssessment.emptyCompletedAssessment();
                ca.userId = req.session.authUser.id;
                ca.assessmentId = req.session.currentTopic.topic.assessmentId;

                // populate the assessment for this completedAssessment
                ca.assessment = await assessmentService.getAssessmentById( ca.assessmentId, false );

                ca.topicAssessmentNumber = 1; // pre is always #1 (there is only one and it is always first)

                // go through all the questions and look for the anwser
                for( let i=0; i < req.session.currentTopic.topic.assessment.questions.length; i++ ) {
                    // create a completedQuestion to hold the answer
                    let cq = CompletedAssessmentQuestion.emptyCompletedAssessmentQuestion();
                    cq.assessmentQuestionId = req.session.currentTopic.topic.assessment.questions[i].id;

                    for ( var propName in req.query ) {
                        // eslint-disable-next-line no-prototype-builtins
                        if ( req.query.hasOwnProperty( propName ) ) {
                            if( propName == 'question-id-' + req.session.currentTopic.topic.assessment.questions[i].id ) {
                                cq.assessmentQuestionOptionId = req.query[propName];
                            }
                        }
                    }

                    ca.completedQuestions.push( cq );
                }

                req.session.currentTopic.preAssessment = ca;
                
                // save the data
                req.session.currentTopic = await topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );

                // check to see if the user "tested out" by exceeding the pre-topic threshold
                if( req.session.currentTopic.preAssessment && req.session.currentTopic.preAssessment.percentageCorrect >= parseFloat( req.session.currentTopic.topic.assessment.preThreshold / 100 ) ) {
                    
                    // the user has "tested out" offer option to move on
                    req.session.currentTopic.isCompleted = true;
                    req.session.currentTopic.completedDate = "SET";

                    await userService.addAccessTokensToUserById( req.session.authUser.id, 1 );

                    // add a message
                    req.session.messageTitle = 'You are ready to move on!';
                    req.session.messageBody = 'Congratulations! Your pre assessment shows that you are already comforable with this topics material. This topic has been marked completed and you may move ahead. You can still always review any material in this topic.';

                    // about to re-save
                    // console.log("------------ about to resave --------------");
                    // console.log(req.session.currentTopic);
                    // console.log("-------------------------------------------");
                    // save the data
                    req.session.currentTopic = await topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );

                    // console.log("------------ ////// resaved /////// --------------");
                    // console.log(req.session.currentTopic);
                    // console.log("-------------------------------------------");

                    // reload the user session
                    req.session.authUser = await userService.setUserSession( req.session.authUser.email );

                    res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );
                    req.session.error = 'Incorrect username or password';
                    
                }
                else {
                    // reroute
                    res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );
                }

                
            }

            if( finishedStep == 3 ) {

                // reroute
                res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );

            }

            if( finishedStep == 4 ) {
                let completedActivity = CompletedActivity.emptyCompletedActivity();
                completedActivity.submissionText = req.query.submission_text;
                completedActivity.userId = req.session.authUser.id;
                completedActivity.activityId = req.session.currentTopic.topic.activityId;
                req.session.currentTopic.completedActivity = completedActivity;

                // save the data
                req.session.currentTopic = await topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );
                // reroute
                res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );

            }

            if( finishedStep == 5 ) {
                // create the completed assessment 
                let ca = CompletedAssessment.emptyCompletedAssessment();
                ca.userId = req.session.authUser.id;
                ca.assessmentId = req.session.currentTopic.topic.assessmentId;

                // populate the assessment for this completedAssessment
                ca.assessment = await assessmentService.getAssessmentById( ca.assessmentId, false );

                // get the next topicAssessmentNumber
                ca.topicAssessmentNumber = await assessmentService.getNextTopicAssessmentNumber( req.session.currentTopic.topic.assessmentId, req.session.authUser.id );
                ca.topicAssessmentNumber++;     // increment to next unused number

                // go through all the questions and look for the anwser
                for( let i=0; i < req.session.currentTopic.topic.assessment.questions.length; i++ ) {
                    // create a completedQuestion to hold the answer
                    let cq = CompletedAssessmentQuestion.emptyCompletedAssessmentQuestion();
                    cq.assessmentQuestionId = req.session.currentTopic.topic.assessment.questions[i].id;
                    for ( propName in req.query ) {
                        // eslint-disable-next-line no-prototype-builtins
                        if ( req.query.hasOwnProperty( propName ) ) {
                            if( propName == 'question-id-' + req.session.currentTopic.topic.assessment.questions[i].id ) {
                                cq.assessmentQuestionOptionId = req.query[ propName ];
                            }
                            
                        }
                    }
                    
                    ca.completedQuestions.push( cq );
                }

                req.session.currentTopic.postAssessment = ca;

                // save the data
                req.session.currentTopic = await topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );

                // reroute
                res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );
            }
            if( finishedStep == 6 ) {

                // check that everything has been completed
                let ct = req.session.currentTopic;

                //keep track of number of completed resources that are required
                let requiredCompletedResources = ct.topic.resources.filter( ( resource ) => resource.isRequired == true );

                if( ct.isCompleted ) {
                    // user already completed (most likely by testing out)
                    // reload the user session
                    req.session.authUser = await userService.setUserSession( req.session.authUser.email );

                    // set the message
                    req.session.messageTitle = 'Nice Work!';
                    req.session.messageBody = 'You completed ' + ct.topic.topicName + '!';


                    res.redirect( 303, '/community/goal/' + goalId );
                }
                else if ( ct.isIntroComplete === true && ct.preAssessment && ct.completedResources.length == requiredCompletedResources.length && ct.postAssessment ) {
                    // mark the topic complete and return the users token
                    if( !req.session.currentTopic.isCompleted ) {
                        req.session.currentTopic.isCompleted = true;
                        req.session.currentTopic.completedDate = "SET";

                        await userService.addAccessTokensToUserById( req.session.authUser.id, 1 );
                    }

                    // save the data
                    req.session.currentTopic = await topicService.saveTopicEnrollmentWithEverything( req.session.currentTopic );

                    // reload the user session
                    req.session.authUser = await userService.setUserSession( req.session.authUser.email );

                    // set the message
                    req.session.messageTitle = 'Nice Work!';
                    req.session.messageBody = 'You completed ' + ct.topic.topicName + '!';


                    res.redirect( 303, '/community/goal/' + goalId );
                    
                }
                else {
                    // not all requirements met

                    req.session.messageTitle = 'All requirements were not completed!';
                    req.session.messageBody = 'You are not able to finish a topic until all required parts are completed';

                    console.log( 'incomplete topic submitted' );

                    res.redirect( 303, '/community/topic/' + goalId + '/' + topicId );
                }
                
            }
        }
        else {
            console.log( "checking here" );
            // update not able to take place
            res.redirect( 303, '/community' );
        }
        

        
    }
    );


router.route( '/reset' )
    .get( async ( req, res ) => {
        
        if( req.session.currentTopic ) {
            let goalId = req.session.goalId;
            let topicId = req.session.currentTopic.topicId;

            /* 
             * set the user up to review the topic and complete another post assessment
             */
            // mark the users completed resources in-active for this topic
            for( let i=0; i < req.session.currentTopic.completedResources.length; i++ ) {
                await resourceService.markUserTopicCompletedResourcesInactive( req.session.currentTopic.completedResources[i].id );
            }

            // remove the resources from the current session
            req.session.currentTopic.completedResources = [ ];

            // mark the post assessment inactive so it not considered for the topic enrollment
            await assessmentService.removeCompletedAssessmentFromEnrollment( req.session.currentTopic.postCompletedAssessmentId, req.session.currentTopic.id );

            // remove the completed assessment from the sesssion
            req.session.currentTopic.postAssessment = [ ];
            req.session.currentTopic.postCompletedAssessmentId = -1;

            // reload the user session
            req.session.authUser = await userService.setUserSession( req.session.authUser.email );

            // reroute
            res.redirect( 303, '/community/topic/' + goalId + "/" + topicId );

        }
        else {
            // reroute
            res.redirect( 303, '/community' );
        }
        
    }
    );


/**
 * Renders the community/topic ejs file.
 * Verifies that the user is logged in and has access.
 * If the user does not have access then it offers them the option to enroll
 * If the user has access it checks to see if there is an existing session containing 
 * the topic as the current topic. If so it skips the db load other wise it queries.
 */
router.route( '/:goalId/:topicId' )
    .get( async ( req, res ) => {
        let goalId = req.params.goalId;
        let topicId = req.params.topicId;

        // why is this here??? 
        // let nextStep = null;
        // if(req.query.nextStep) {
        //     nextStep = req.query.nextStep;
        // }
        // end why

        let access = false;
        if( req.session.authUser ) {
            // check that the user is enrolled!
            access = await topicService.verifyTopicAccess( req.session.authUser.id, topicId );
            // if the user is not, see if we can enroll them
            if( !access ) {
                // check to see if the user is a member and grant access if they are
                if( req.session.authUser.member ) {
                    // save the enrollment for the user in the goal
                    let te = TopicEnrollment.emptyTopicEnrollment();
                    te.topicId = topicId;
                    te.userId = req.session.authUser.id;
                    await topicService.saveTopicEnrollment( te );
                    // reset the session
                    const rUser = await userService.setUserSession( req.session.authUser.email );

                    req.session.authUser = null;
                    req.session.authUser = rUser;
                    access = true;

                    // user has access set the page up with enrollment data
                    // get the topic data
                    let topicEnrollment = await topicService.getActiveTopicEnrollmentsByUserAndTopicIdWithEverything( req.session.authUser.id, topicId, true );
                    //console.log("TopicEnrollment: " + JSON.stringify(topicEnrollment));

                    // get the current step
                    let currentStep = 1;

                    //keep track of number of completed resources that are required
                    let requiredCompletedResources = topicEnrollment.topic.resources.filter( ( resource ) => resource.isRequired == true );

                    // determine the current step if different from Introduction
                    // #30 added && !topicEnrollment.isCompleted to ensure that the user skips ahead if they test out. 
                    if( !topicEnrollment.isIntroComplete && !topicEnrollment.isCompleted ) {
                        currentStep = 1;
                    }
                    else if( topicEnrollment.preCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 2;
                    }
                    else if( topicEnrollment.completedResources.length < requiredCompletedResources.length && !topicEnrollment.isCompleted ) {
                        currentStep = 3;
                    }
                    else if( topicEnrollment.completedActivityId < 1 && topicEnrollment.topic.hasActivity && !topicEnrollment.isCompleted ) {
                        currentStep = 4;
                    }
                    else if( topicEnrollment.postCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 5;
                    }
                    else {
                        // topic complete?
                        currentStep = 6;
                    }


                    // add the enrollment to the session
                    req.session.currentTopic = topicEnrollment;
                    res.locals.topicEnrollment = topicEnrollment;
                    res.locals.topic = topicEnrollment.topic;
                    req.session.goalId = goalId;

                    // console.log("1----------------------------------------------------------------------");
                    // console.log(topicEnrollment.preCompletedAssessmentId);
                    // console.log(topicEnrollment.preAssessment);
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.postCompletedAssessmentId);
                    // console.log(topicEnrollment.postAssessment)
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.topic.assessmentId);
                    // console.log(topicEnrollment.topic.assessment);
                    // console.log("----------------------------------------------------------------------");

                    // open the course
                    res.render( 'community/topic', {user: req.session.authUser, goalId: goalId, hasAccess:access, currentStep: currentStep, message:req.session.messageTitle, message2:req.session.messageBody} );
                    if( req.session.messageTitle ) delete req.session.messageTitle;
                    if( req.session.messageBody ) delete req.session.messageBody;
                    req.session.save();

                }
                else {
                    // user is not a member and does not currently have access setup page to allow them to enroll
                    // get the topic data
                    
                    let topic = await topicService.getTopicWithEverythingById( topicId, true );
                    //console.log("topic: " + JSON.stringify(topic) + " has access::::: " + access); 
                    // open the course
                    // add the enrollment to the session
                    req.session.currentTopic = null;
                    res.locals.topicEnrollment = null;
                    res.locals.topic = topic;
                    req.session.goalId = goalId;

                    res.render( 'community/topic', {user: req.session.authUser, goalId: goalId, hasAccess:access, currentStep:0, message:req.session.messageTitle, message2:req.session.messageBody} );
                    if( req.session.messageTitle ) delete req.session.messageTitle;
                    if( req.session.messageBody ) delete req.session.messageBody;
                    req.session.save();
                }

                
            }
            else {
                // user has access 
                if( req.session.currentTopic && req.session.currentTopic.topicId == topicId ) {
                    // already have data in the session save some cycles and don't call it again for now reason
                    // TODO: (have to make sure it is up to date for this optimazation to work!) in others words, make
                    // sure the session is kept up to date when changes are made!
                    
                    let topicEnrollment = req.session.currentTopic;
                    // console.log("----------------------- te check ------------------------");
                    // console.log(JSON.stringify(topicEnrollment));
                    // console.log("--------------------- end te check ----------------------");
                    // get the current step
                    let currentStep = 1;

                    //keep track of number of completed resources that are required
                    let requiredCompletedResources = topicEnrollment.topic.resources.filter( ( resource ) => resource.isRequired == true );
                    
                    // determine the current step if different from Introduction
                    // #30 added && !topicEnrollment.isCompleted to ensure that the user skips ahead if they test out. 
                    if( !topicEnrollment.isIntroComplete && !topicEnrollment.isCompleted ) {
                        currentStep = 1;
                    }
                    else if( topicEnrollment.preCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 2;
                    }
                    else if( topicEnrollment.completedResources.length < requiredCompletedResources.length && !topicEnrollment.isCompleted ) {
                        currentStep = 3;
                    }
                    else if( topicEnrollment.completedActivityId < 1 && topicEnrollment.topic.hasActivity && !topicEnrollment.isCompleted ) {
                        currentStep = 4;
                    }
                    else if( topicEnrollment.postCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 5;
                    }
                    else {
                        // topic complete?
                        currentStep = 6;
                    }

                    // add the enrollment to the session
                    req.session.currentTopic = topicEnrollment;
                    res.locals.topicEnrollment = topicEnrollment;
                    res.locals.topic = topicEnrollment.topic;
                    req.session.goalId = goalId;

                    // console.log("3----------------------------------------------------------------------");
                    // console.log(topicEnrollment.preCompletedAssessmentId);
                    // console.log(topicEnrollment.preAssessment);
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.postCompletedAssessmentId);
                    // console.log(topicEnrollment.postAssessment)
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.topic.assessmentId);
                    // console.log(topicEnrollment.topic.assessment);
                    // console.log("----------------------------------------------------------------------");

                    // open the course
                    res.render( 'community/topic', {user: req.session.authUser, goalId: goalId, hasAccess:access, currentStep: currentStep, message:req.session.messageTitle, message2:req.session.messageBody} );
                    if( req.session.messageTitle ) delete req.session.messageTitle;
                    if( req.session.messageBody ) delete req.session.messageBody;
                    req.session.save();
                }
                else {

                    // the user has access but the session does not have the topic enrollment data yet
                    let topicEnrollment = await topicService.getActiveTopicEnrollmentsByUserAndTopicIdWithEverything( req.session.authUser.id, topicId, true );
                    //console.log("TopicEnrollment: " + JSON.stringify(topicEnrollment));

                    // get the current step
                    let currentStep = 1;

                    //keep track of number of completed resources that are required
                    let requiredCompletedResources = topicEnrollment.topic.resources.filter( ( resource ) => resource.isRequired == true );
                    
                    // determine the current step if different from Introduction
                    // #30 added && !topicEnrollment.isCompleted to ensure that the user skips ahead if they test out. 
                    if( !topicEnrollment.isIntroComplete && !topicEnrollment.isCompleted ) {
                        currentStep = 1;
                    }
                    else if( topicEnrollment.preCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 2;
                    }
                    else if( topicEnrollment.completedResources.length < requiredCompletedResources.length && !topicEnrollment.isCompleted ) {
                        currentStep = 3;
                    }
                    else if( topicEnrollment.completedActivityId < 1 && topicEnrollment.topic.hasActivity && !topicEnrollment.isCompleted ) {
                        currentStep = 4;
                    }
                    else if( topicEnrollment.postCompletedAssessmentId < 1 && !topicEnrollment.isCompleted ) {
                        currentStep = 5;
                    }
                    else {
                        // topic complete?
                        currentStep = 6;
                    }

                    // add the enrollment to the session
                    req.session.currentTopic = topicEnrollment;
                    res.locals.topicEnrollment = topicEnrollment;
                    res.locals.topic = topicEnrollment.topic;
                    req.session.goalId = goalId;

                    // console.log("4----------------------------------------------------------------------");
                    // console.log(topicEnrollment.preCompletedAssessmentId);
                    // console.log(topicEnrollment.preAssessment);
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.postCompletedAssessmentId);
                    // console.log(topicEnrollment.postAssessment)
                    // console.log("-----------------------");
                    // console.log(topicEnrollment.topic.assessmentId);
                    // console.log(topicEnrollment.topic.assessment);
                    // console.log("----------------------------------------------------------------------");

                    // open the course
                    res.render( 'community/topic', {user: req.session.authUser, goalId: goalId, hasAccess:access, currentStep: currentStep, message:req.session.messageTitle, message2:req.session.messageBody} );
                    if( req.session.messageTitle ) delete req.session.messageTitle;
                    if( req.session.messageBody ) delete req.session.messageBody;
                    req.session.save();
                }

            }
            
            
        }
        else {
            res.render( 'user-signup' );
        }
    }
    );


/** 
 * Enroll in a topic
 */
router.route( '/enroll/:goalId/:topicId' )
    .get( async ( req, res ) => {
        let goalId = req.params.goalId;
        let topicId = req.params.topicId;
        if( req.session.authUser ) {
        // see if the user has a token
            let user = req.session.authUser;
            // verify the user has access, first check membership:
            let access = await topicService.verifyTopicAccess( user.id, topicId );
            if( access ) {
            // send them to the course
                res.redirect( '/community/topic/' + topicId );
            }
            // User does not already have access try to enroll them if they have membership or a token
            let enrollment = await topicService.enrollUserWithMembershipOrToken( user, topicId );
            if( enrollment ) { 

                // reset the session
                const rUser = await userService.setUserSession( req.session.authUser.email );

                req.session.authUser = null;
                req.session.authUser = rUser;

                // send them to the course
                res.redirect( '/community/topic/' + goalId + "/" + topicId );
            }
            else {
            // they did not have membership or a token
            // get products to send to page (founders membership and tokens)
                const products = await productService.getAllActviteTokenAndMembershipProductsWithImages();

                // user does not currently have membership or tokens, redirct to join
                res.render( 'community/join', {products: products, user: user, message:"You did not have a membership or token to use!", message2:"Choose an option below to obtain access to additional topics"} );
            }
        }
        else {
            res.render( 'user-signup' );
        }
    }
    );



module.exports = router;
