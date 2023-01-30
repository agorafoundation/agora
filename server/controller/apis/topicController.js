/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import controllers
const {errorController} = require( "./apiErrorController" );

// import services
const topicService = require( '../../service/topicService' );
const resourceService = require ( '../../service/resourceService' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import models
const Topic = require( '../../model/topic' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
const FRONT_END = process.env.FRONT_END_NAME;
let TOPIC_PATH = process.env.TOPIC_IMAGE_PATH;

// topic file path
const topicUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH;

// set the max image size for avatars and topic, topic and workspace icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

exports.getAllVisibleTopics = async ( req, res ) => {

    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ) {
        let topics = await topicService.getAllVisibleTopics( authUserId, req.query.limit, req.query.offset );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all visible topics" );
        res.status( 200 ).json( topics );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Topic not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Topic not found" );
        res.status( 404 ).json( message );
    }
};

exports.getAllPublicTopics = async ( req, res ) => {

    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ) {
        let topics = await topicService.getAllPublicTopics( req.query.limit, req.query.offset );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all public topics" );
        res.status( 200 ).json( topics );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Topic not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Topic not found" );
        res.status( 404 ).json( message );
    }
};

exports.getAllResourcesForTopicId = async ( req, res ) => {

    // Get the auth user id from either the basic auth header or the session.
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ){

        // Check if valid topicId given.
        let topic = await topicService.getTopicById( req.params.topicId, authUserId );
        if( topic ) {

            let resourcesList = [];

            // Get all resource Ids associated with our topicId.
            let resourceIds = await topicService.getAllResourceIdsFromTopic( topic.topicId );

            // Grab each resource by id and append it to our list of resources.
            for ( let index in resourceIds ) {
                let resource = await resourceService.getResourceById( resourceIds[index], authUserId );

                if ( resource ){ // Ensure retrieval of resource.
                    resourcesList.push( resource );
                }
                else {
                    console.log( "Error retrieving resource " + resourceIds[index] + "\n" );
                }
            }

            // Return our resourcesList.
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned resources list" );
            res.status( 200 ).json( resourcesList );
        }

        else {
            return errorController( ApiMessage.createNotFoundError ( "Topic", res ) );
        }
    }
    
};

exports.getTopicById = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    console.log( "t-2" );
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }
    console.log( "auth user id: " + authUserId );

    if( authUserId ){
        let topic = await topicService.getTopicById( req.params.topicId, authUserId );
        if( topic ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned topic by id" );
            res.status( 200 ).json( topic );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "Topic not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Topic not found" );
            res.status( 404 ).json( message );
        }
    }
    else {
        const message = ApiMessage.createApiMessage( 401, "Unauthorized", "Unauthorized user" );
        res.set( "x-agora-message-title", "Unauthorized" );
        res.set( "x-agora-message-detail", "Unauthorized user" );
        res.status( 401 ).json( message );
    }

    // topic file path
    // const topicUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH;

};





exports.getAllActiveTopicsForUser = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    // get all the active topics
    let topics = await topicService.getAllActiveTopicsForOwner( authUserId );

    if( topics ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all active topics" );
        res.status( 200 ).json( topics );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Topics not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Topics not found" );
        res.status( 404 ).json( message );
    }
};




exports.saveCompletedTopic = async function( req, res ) {
    let topicId = req.body.topicId;
    let status = req.body.status;
    let submittedText = req.body.submittedText;

    if( req.session.currentTopic && req.session.authUser ) {

        let completedTopic = await topicService.getCompletedTopicByTopicAndUserId( topicId, req.session.authUser.userId );
        if( !completedTopic ) {
            completedTopic = Topic.emptyTopic( );
            completedTopic.userId = req.session.authUser.userId;
            completedTopic.topicId = topicId;
        }
        completedTopic.active = status;
        completedTopic.submissionText = submittedText;

        // save the completedTopic
        let completeTopic = await topicService.saveCompletedTopicStatus( completedTopic );

        // update the session
        let replaced = false;
        if( req.session.currentTopic.completedTopics.length > 0 && completeTopic.topicId > 0 ) {
            for( let i=0; i < req.session.currentTopic.completedTopics.length; i++ ) {
                if( req.session.currentTopic.completedTopics[ i ].topicId == completeTopic.topicId ) {
                    req.session.currentTopic.completedTopics[ i ] = completeTopic;
                    replaced = true;
                    break;
                }
            }
        }
        if ( !replaced ) {
            req.session.currentTopic.completedTopics.push( completeTopic );
        }
    }

    res.send();
};

exports.saveTopicImage = async( req, res, topicId, filename ) => {

    // save image in db and delete old file  
    if( topicId > 0 ) {
        topicService.updateTopicImage( topicId, filename ).then( ( rValue ) => {
            if ( rValue === filename ) {
                console.log( 'No image update occurred - exiting image update function.' );
                return false;
            }

            if( rValue && rValue.length > 0 && rValue != 'multiple-layers.svg' ) {
                console.log( "removing: " + UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH + rValue );
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[topicController] file delete error status: " + err );
                        return false;
                    }
                    
                } );
            } 
        } );
    }
    
    return true;
};

// saveTopic in progress. Still missing handling of attributes: 
//     this.topicImage = ""; // -- skip testing for now.
exports.saveTopic = async ( req, res, redirect ) => {

    let topic = Topic.emptyTopic();

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    if( authUserId ) {

        if( req.body.topicId != null && req.body.topicId != -1 ) {
            topic.topicId = req.body.topicId;
        }

        // see if this is a modification of an existing topic
        let existingTopic = await topicService.getTopicById( topic.topicId.toString(), authUserId );

        // if this is an update, replace the topic with the existing one as the starting point.
        if( existingTopic ) {
            topic = existingTopic;
        }
        else {
            topic.creationTime = Date.now();
        }


        // add changes from the body if they are passed
        if ( req.body.visibility == "public" || req.body.visibility == "private" ) { // TODO: this checking needs to be done via frontend form validation
            topic.visibility = req.body.visibility;
        }
        else {
            topic.visibility = "public";
            console.error( "[topicController.saveTopic]: NON-VALID 'visibility' VALUE REQUESTED - 'public', 'private'" );
        }
        topic.topicType = req.body.topicType;
        topic.topicName = req.body.topicName;
        topic.topicDescription = req.body.topicDescription;
        
        if( topic.topicType == 3 ) {
            
            topic.topicHtml = req.body.embedded_submission_text_topic;
        }
        else {
            // check to see if the incomping message format is from the UI or the API
            if( req.body.topicHtml ) {
                topic.topicHtml = req.body.topicHtml;
            }
            else {
                topic.topicHtml = req.body.topicEditor;
            }
        }
        
        // check to see if the incoming message format is from the UI form or the API
        // topic.active = false; // Defaulted to false if not specified.
        if( req.body.active ) {
            topic.active = req.body.active;
        }

        // assigns isRequired based on UI selection; leaving this here for later
        topic.isRequired = ( req.body.isRequired == "on" || req.body.isRequired == true ) ? true : false;
    
        // assigns the owner's Id
        topic.ownedBy = authUserId;


        // Note: If we are able to create assessments/ activities 
        // outside of topics, we will need to change implementation of handling topic.assessmentId and topic.activityId.

        /* 
         * assessmentId & activityId will be assigned -1,
         * and hasActivity & hasAssessment will be assigned false
         * until properly planned and implemented
         */

        // Activity
        /*
        topic.activityId = -1; // Initialize at -1 in case not found.
        topic.hasActivity = req.body.hasActivity;
        if (topic.hasActivity) {

            let activity = await activityService.saveActivity(req.body.activity); 

            topic.activityId = activity.activityId;
            topic.activity = activity;
            topic.activity.creationTime = Date.now();

            console.log("[topicController-saveTopic-activity]: " + JSON.stringify(topic.activity));
        }
        */

        // Assessment
        /*
        topic.assessmentId = -1; // Initialize at -1 in case not found. 
        topic.hasAssessment = req.body.hasAssessment;
        if (topic.hasAssessment) {

            let assessment = await assessmentService.saveAssessment(req.body.assessment);
            //assessmentService.getAssessmentById(ass.id);  -- test and fix getAssessmentById
            topic.assessmentId = assessment.assessmentId;
            topic.assessment = assessment;
            topic.assessment.creationTime = Date.now();

            //topic.assessment.questions = req.body.questions;
            //topic.assessment.completedAssessments = req.body.completedAssessments;

            console.log("[topicController-saveTopic-assessment]: " + JSON.stringify(topic.assessment));
        }
        */

        // Resources are held as a list of resource id's.
        topic.resources = req.body.resources;

        // Associated resource id's (by position) are required. E.g. below.
        topic.resourcesRequired = req.body.resourcesRequired;

        /*
            E.g. 
            resources = [1, 2, 3, 4]
            resourcesRequired = [false, false, true, true]
        */

        //console.log( "about to save topic: " + JSON.stringify( topic ) + "\n\n" );

        topic = await topicService.saveTopic( topic );

        // Need to do this after saveTopic to ensure a topic id > -1.
        if ( req.body.resources ){
            let resourcesSaved = await topicService.saveResourcesForTopic( topic.topicId, req.body.resources, req.body.resourcesRequired );
            //console.log( "@ -- @" +resourcesSaved );
        }

        
        /**
         * once the topic is saved, save the image if it is passed
         */ 

        // The UI needs to verify modifiction so that the image is not dropped if the user does not want to change it
        if ( req.body.topicModified && !req.files ) {
            // do nothing we are going to keep the original file
            console.log( "topic trigger modification clause" );
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {   // no files were uploaded       
            // no files uploaded
            if( topic.topicType == 1 ) {
                this.saveTopicImage( req, res, topic.topicId, 'notebook-pen.svg' );
            }
            else if ( topic.topicType == 2 ) {
                this.saveTopicImage( req, res, topic.topicId, 'cell-molecule.svg' );
            }
            else if( topic.topicType == 3 ) {
                this.saveTopicImage( req, res, topic.topicId, 'code.svg' );
            }
            else {
                this.saveTopicImage( req, res, topic.topicId, 'topic-default.png' );
            }
        }
        else {
            // files included
            const file = req.files.topicImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log( `File ${file.name} size limit has been exceeded for topic` );

                if( redirect ) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return topic;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image." );
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image." );
                    res.status( 422 ).json( message );
                }
                
            }
            else if( topic ) {
                await file.mv( topicUploadPath + timeStamp + file.name, async ( err ) => {
                    if ( err ) {
                        console.log( "Error uploading profile picture : " + err );
                        if( redirect ) {
                            req.session.messageType = "error";
                            req.session.messageTitle = "Error saving image!";
                            req.session.messageBody = "There was a error uploading your image for this topic. Your topic should be saved without the image.";
                            res.redirect( 303, '/dashboard' );
                            return topic;
                        }
                        else {
                            const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this topic. Your topic should be saved without the image." );
                            res.set( "x-agora-message-title", "Error saving image!" );
                            res.set( "x-agora-message-detail", "There was a error uploading your image for this topic. Your topic should be saved without the image." );
                            res.status( 422 ).json( message );
                        }
                    }
                    else {
                        await this.saveTopicImage( req, res, topic.topicId, timeStamp + file.name );
                    }
                } );
            }
            else {
                if( redirect ) {
                    req.session.messageType = "error";
                    req.session.messageTitle = "Error saving image!";
                    req.session.messageBody = "There was a error uploading your image for this topic. Your topic should be saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return topic;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Error uploading image!", "There was a error uploading your image for this topic. Your topic should be saved without the image." );
                    res.set( "x-agora-message-title", "Error saving image!" );
                    res.set( "x-agora-message-detail", "There was a error uploading your image for this topic. Your topic should be saved without the image." );
                    res.status( 422 ).json( message );
                }
            }
        }

        // redirect to the call the calling controller or return the topic if origin was an API call
        if( topic ) {
            if( redirect ) {
                return topic;
            }
            else {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned all topics" );
                res.status( 200 ).json( topic );
            }
        }
        else {
            if( redirect ) {
                return topic;
            }
            else {
                const message = ApiMessage.createApiMessage( 500, "Internal Server Error", "Error saving topic" );
                res.set( "x-agora-message-title", "Internal Server Error" );
                res.set( "x-agora-message-detail", "Error saving topic" );
                res.status( 500 ).json( message );
            }
        }
    }
    else {
        if( redirect ) {
            return topic;
        }
        else {
            const message = ApiMessage.createApiMessage( 401, "Not Authorized", "Not able to associate authorized user with the record" );
            res.set( "x-agora-message-title", "Not Authorized" );
            res.set( "x-agora-message-detail", "Not able to associate authorized user with the record" );
            res.status( 401 ).json( message );
        }
        
    }
    
};

exports.deleteTopicById = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.userId;
    }

    const topicId = req.params.topicId;
    let success = await topicService.deleteTopicById( topicId, authUserId );

    if ( success ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Deleted topic" );
        res.status( 200 ).json( "Success" );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "No topics were found meeting the query criteria" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No topics were found meeting the query criteria" );
        res.status( 404 ).json( message );
    }

};