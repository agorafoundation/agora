/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import services
const topicService = require( '../../service/topicService' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import models
const Topic = require('../../model/topic' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
const FRONT_END = process.env.FRONT_END_NAME;
let TOPIC_PATH = process.env.TOPIC_IMAGE_PATH;

// topic file path
const topicUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH;

// set the max image size for avatars and topic, topic and goal icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

exports.getAllVisibleTopics = async ( req, res ) => {

    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if(authUserId > 0) {
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
}

exports.getAllPublicTopics = async ( req, res ) => {

     // get the auth user id from either the basic auth header or the session
     let authUserId;
     if( req.user ) {
         authUserId = req.user.id;
     }
     else if( req.session.authUser ) {
         authUserId = req.session.authUser.id;
     }

    if(authUserId > 0) {
        let topics = await topicService.getAllPublicTopics( req.query.limit, req.query.offset );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all public topics" );
        res.status( 200 ).json( topics );
    } else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Topic not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Topic not found" );
        res.status( 404 ).json( message );
    }
}

exports.getTopicById = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if( authUserId > 0 ){
        let topic = await topicService.getTopicById( req.params.id, authUserId );
        if(topic) {
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

// topic file path
const topicUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH;

}












































exports.getAllActiveTopicsForUser = async ( req, res ) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    // get all the active topics
    let topics = await topicService.getAllActiveTopicsForOwner(authUserId);

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
}




exports.saveCompletedTopic = async function( req, res ) {
    let topicId = req.body.topicId;
    let status = req.body.status;
    let submittedText = req.body.submittedText;

    if( req.session.currentTopic && req.session.authUser ) {
        // call service?
        let completedTopic = await topicService.getCompletedTopicByTopicAndUserId( topicId, req.session.authUser.id );
        if( !completedTopic ) {
            completedTopic = CompletedTopic.emptyCompletedTopic( );
            completedTopic.userId = req.session.authUser.id;
            completedTopic.topicId = topicId;
        }
        completedTopic.active = status;
        completedTopic.submissionText = submittedText;

        // save the completedTopic
        let completeTopic = await topicService.saveCompletedTopicStatus( completedTopic );

        // update the session
        let replaced = false;
        if( req.session.currentTopic.completedTopics.length > 0 && completeTopic.id > 0 ) {
            for( let i=0; i < req.session.currentTopic.completedTopics.length; i++ ) {
                if( req.session.currentTopic.completedTopics[ i ].id == completeTopic.id ) {
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
}

exports.saveTopicImage = async( req, res, topicId, filename ) => {

    // save image in db and delete old file  
    if( topicId > 0 ) {
        topicService.updateTopicImage( topicId, filename ).then( ( rValue ) => {

            if( rValue && rValue.length > 0 && (rValue != 'topic-default.png' 
                || rValue != 'notebook-pen.svg' 
                || rValue != 'cell-molecule.svg' 
                || rValue != 'code.svg' )) {
                console.log("removing: " + UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH + rValue)
                fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[topicController] file delete error status: " + err );
                        return false;
                    }
                    
                });
            } 
        });
    }
    
    return true;
}

// saveTopic in progress. Still missing handling of attributes: 
//     this.topicImage = ""; // -- skip testing for now.
//     this.hasActivity = false; -- not being handled.
//     this.hasAssessment = false; -- not being handled.
//     this.active = true; -- not being handled. is also duplicate inside Activity object.
//     this.ownedBy = -1; -- how can we test this? Pretty sure not working.
exports.saveTopic = async ( req, res, redirect ) => {

    let topic = Topic.emptyTopic();

    console.log(JSON.stringify(req.body));

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if(authUserId > 0) {

        topic.id = req.body.id;

        // see if this is a modification of an existing topic
        let existingTopic = await topicService.getTopicById( topic.id, false );

        // if this is an update, replace the topic with the existing one as the starting point.
        if(existingTopic) {
            //console.log( "there was an existing topic for this id: " + JSON.stringify(existingTopic) );
            console.log("existing topic");
            topic = existingTopic;
        } else {
            topic.creationTime = Date.now(); // what type does our backend support? Is this fine?
        }

        // add changes from the body if they are passed
        topic.topicType = req.body.topicType;
        topic.visibility = req.body.visibility;
        topic.topicName = req.body.topicName;
        topic.topicDescription = req.body.topicDescription;

        if(topic.topicType == 3) {
            
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
        if( req.body.topicActive ) {
            topic.active = ( req.body.topicActive == "on" ) ? true : false;
        }
        else if ( req.body.active ) {
            topic.active = req.body.active;
        }
        
        //topic.isRequired = ( req.body.isRequired == "on" || req.body.isRequired == true ) ? true : false; // is this needed?
    
        topic.ownedBy = authUserId;

        // TODO: Add Resources to topics. topicService.saveResourcesForTopic(topicId, resourceIds, resourcesRequired);

        // TODO: Add Activity to topics. Create topicService.saveActivity? 

        // TODO: Add Assessment to topics. Create topicService.saveAssessment? 

        topic = await topicService.saveTopic( topic );

        /**
         * once the topic is saved, save the image if it is passed
         */ 

        // The UI needs to verify modifiction so that the image is not dropped if the user does not want to change it
        if ( req.body.topicModified && req.body.topicModified != "false" && !req.files ) {
            // do nothing we are going to keep the original file
            console.log("topic trigger modification clause");
        }
        else if ( !req.files || Object.keys( req.files ).length === 0 ) {   // no files were uploaded       
            // no files uploaded
            if( topic.topicType == 1 ) {
                this.saveTopicImage( req, res, topic.id, 'notebook-pen.svg' );
            }
            else if ( topic.topicType == 2 ) {
                this.saveTopicImage( req, res, topic.id, 'cell-molecule.svg' );
            }
            else if( topic.topicType == 3 ) {
                this.saveTopicImage( req, res, topic.id, 'code.svg' );
            }
            else {
                this.saveTopicImage( req, res, topic.id, 'topic-default.png' );
            }
        }
        else {
            // files included
            const file = req.files.topicImageField;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log(`File ${file.name} size limit has been exceeded for topic`);

                if(redirect) {
                    req.session.messageType = "warn";
                    req.session.messageTitle = "Image too large!";
                    req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image.";
                    res.redirect( 303, '/dashboard' );
                    return topic;
                }
                else {
                    const message = ApiMessage.createApiMessage( 422, "Image too large", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image.");
                    res.set( "x-agora-message-title", "Image too large!" );
                    res.set( "x-agora-message-detail", "Image size was larger then " + maxSizeText + ", please use a smaller file. Your topic was saved without the image.");
                    res.status( 422 ).json( message );
                }
                
            }
            else if( topic ) {
                await file.mv(topicUploadPath + timeStamp + file.name, async (err) => {
                    if (err) {
                        console.log( "Error uploading profile picture : " + err );
                        if(redirect) {
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
                        await this.saveTopicImage( req, res, topic.id, timeStamp + file.name );
                    }
                });
            }
            else {
                if(redirect) {
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
    
}

exports.deleteTopicById = async (req, res) => {
    // get the auth user id from either the basic auth header or the session
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const topicId = req.params.id;
    let success = await topicService.deleteTopicById(topicId, authUserId);

    if (success) {
        res.set("x-agora-message-title", "Success");
        res.set("x-agora-message-detail", "Deleted topic");
        res.status(200).json("Success");
    }
    else {
        res.set( "x-agora-message-title", "Not Found");
        res.set( "x-agora-message-detail", "No topics were found meeting the query criteria");
        res.status( 404).send( "No topics Found");
    }

}