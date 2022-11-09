/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const discussionService = require( "../../service/discussionService" );
const ApiMessage = require( "../../model/util/ApiMessage" );
const {errorController} = require( "./apiErrorController" );

// Get

exports.getDiscussionByGoalId = async ( req, res ) => {

    const id = req.params.id;

    // get the discussion by goal id
    let discussion = await discussionService.getDiscussion( "goal", id, req.user.id );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned discussion with comments" );
    res.status( 200 ).json( discussion );
};

exports.getDiscussionByTopicId = async ( req, res ) => {
    
    const id = req.params.id;

    // get the discussion by topic id
    let discussion = await discussionService.getDiscussion( "topic", id, req.user.id );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned discussion with comments" );
    res.status( 200 ).json( discussion );
};

// Update

exports.updateDiscussionByGoalId = async ( req, res ) => {

    const id = req.params.id;

    let discussion = await discussionService.updateDiscussion( "goal", id, req.user.id, req.body );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( discussion );
};

exports.updateDiscussionByTopicId = async ( req, res ) => {

    const id = req.params.id;

    let discussion = await discussionService.updateDiscussion( "topic", id, req.user.id, req.body );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( discussion );
};

// Create

exports.createDiscussionByGoalId = async ( req, res ) => {

    const id = req.params.id;

    let discussion = await discussionService.createDiscussion( "goal", id, req.user.id, req.body.discussion_text );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created discussion" );
    res.status( 201 ).json( discussion );
};

exports.createDiscussionByTopicId = async ( req, res ) => {

    const id = req.params.id;

    let discussion = await discussionService.createDiscussion( "topic", id, req.user.id, req.body.discussion_text );

    if( !discussion ) {
        return errorController( ApiMessage.createNotFoundError( "Discussion" ), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created discussion" );
    res.status( 201 ).json( discussion );
};

// Comments

exports.createComment = async ( req, res ) => {

    let comment = await discussionService.createComment( req.user.id, req.body );

    if( !comment ) {
        return errorController( ApiMessage.createInternalServerError(), res );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created comment" );
    res.status( 200 ).json( comment );
};

exports.editComment = async ( req, res ) => {

    const commentId = req.params.commentId;

    let comment = await discussionService.editComment( commentId, req.user.id, req.body );

    if( !comment ) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Comment not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Comment not found" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Edited comment" );
    res.status( 200 ).json( comment );
};

exports.deleteComment = async ( req, res ) => {

    const commentId = req.params.commentId;

    let comment = await discussionService.deleteComment( commentId, req.user.id );

    if( !comment ) {
        return errorController( ApiMessage.createNotFoundError( "Comment" ), res );
    }

    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Deleted Comment" );
    res.status( 200 ).json( comment );
};

// Ratings

exports.setRating = async ( req, res ) => {

    const commentId = req.params.commentId;
    const userRating = req.body.rating;

    let rating = await discussionService.setCommentRating( commentId, userRating, req.user.id );

    if( !rating ) {
        return errorController( ApiMessage.createNotFoundError( "Comment" ), res );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Set Rating" );
    res.status( 200 ).json( rating );
};

exports.removeRating = async ( req, res ) => {

    const commentId = req.params.commentId;

    let rating = await discussionService.removeCommentRating( commentId, req.user.id );

    if( !rating ) {
        return errorController( ApiMessage.createNotFoundError( "Comment" ), res );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Removed Rating" );
    res.status( 200 ).json( rating );
};