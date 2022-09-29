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
    let topics = await topicService.getAllTopicsForOwner( req.user.id, true );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all topics for user" );
    res.status( 200 ).json( topics );
}