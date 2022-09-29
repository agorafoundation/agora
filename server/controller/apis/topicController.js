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
const topicService = require( '../service/topicService' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import models
const CompletedResource = require( '../model/completedResource' );
const Topic = require('../../model/topic' );
const goalService = require("../../service/goalService");

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
const FRONT_END = process.env.FRONT_END_NAME;
let TOPIC_PATH = process.env.TOPIC_IMAGE_PATH;

// topic file path
const goalUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + TOPIC_PATH;

// set the max image size for avatars and resource, topic and goal icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

exports.getAllVisibleTopics = async ( req, res ) => {
    // get all the active topics
    let topics = await topicService.getAllVisibleTopics( req.user.id);

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all visible topics" );
    res.status( 200 ).json( topics );
}

exports.getTopicById = async ( req, res ) => {
    // should get all the active topics by user, currently bypasses owner id validation
    let topic = await topicService.getTopicById( req.params.id);
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