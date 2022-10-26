/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const discussionService = require("../../service/discussionService")
const ApiMessage = require("../../model/util/ApiMessage");

// Get

exports.getDiscussionByGoalId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const id = req.params.id

    // get the discussion by goal id
    let discussion = await discussionService.getDiscussion( "goal", id, authUserId );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Discussion not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Discussion not found" );
        return res.status( 404 ).json( message );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned discussion with comments" );
    res.status( 200 ).json( discussion );
}

exports.getDiscussionByTopicId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }
    
    const id = req.params.id

    // get the discussion by topic id
    let discussion = await discussionService.getDiscussion( "topic", id, authUserId );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Discussion not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Discussion not found" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned discussion with comments" );
    res.status( 200 ).json( discussion );
}

// Update

exports.updateDiscussionByGoalId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    // if( req.body.discussion_text === undefined || req.body.discussion_text === null || req.body.discussion_text === "" ) {
    //     const message = ApiMessage.createApiMessage( 400, "Bad Request", "discussion_text not provided" );
    //     res.set( "x-agora-message-title", "Bad Request" );
    //     res.set( "x-agora-message-detail", "discussion_text not provided" );
    //     return res.status( 400 ).json( message );
    // }

    const id = req.params.id

    let discussion = await discussionService.updateDiscussion( "goal", id, authUserId, req.body );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Discussion not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Discussion not found" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( discussion );
}

exports.updateDiscussionByTopicId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if( req.body.discussion_text === undefined || req.body.discussion_text === null || req.body.discussion_text === "" ) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "discussion_text not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "discussion_text not provided" );
        return res.status( 400 ).json( message );
    }

    const id = req.params.id

    let discussion = await discussionService.updateDiscussion( "topic", id, authUserId, req.body );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Discussion not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Discussion not found" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( discussion );
}

// Create

exports.createDiscussionByGoalId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if( req.body.text === undefined || req.body.text === null || req.body.text === "" ) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "text not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "text not provided" );
        return res.status( 400 ).json( message );
    }

    const id = req.params.id

    let discussion = await discussionService.createDiscussion( "goal", id, authUserId, req.body.text );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Could not create discussion" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Could not create discussion" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created discussion" );
    res.status( 201 ).json( discussion );
}

exports.createDiscussionByTopicId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if( req.body.text === undefined || req.body.text === null || req.body.text === "" ) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "text not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "text not provided" );
        return res.status( 400 ).json( message );
    }

    const id = req.params.id

    let discussion = await discussionService.createDiscussion( "topic", id, authUserId, req.body.text );

    if(!discussion) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Could not create discussion" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Could not create discussion" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created discussion" );
    res.status( 201 ).json( discussion );
}

// Comments

exports.createComment = async (req, res) => {
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if(req.body.parent_id < 0) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "parent_id not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "parent_id not provided" );
        return res.status( 400 ).json( message );
    }

    if(req.body.parent_type !== "goal" && req.body.parent_type !== "topic" /*&& req.body.parent_type !== "comment"*/) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "parent_type not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "parent_type not provided" );
        return res.status( 400 ).json( message );
    }

    if(req.body.comment_text === undefined || req.body.comment_text === null || req.body.comment_text === "") {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "comment_text not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "comment_text not provided" );
        return res.status( 400 ).json( message );
    }

    let comment = await discussionService.createComment(authUserId, req.body );

    // not sure if this is possible, so I don't really know what the message should be
    if(!comment) {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "Comment could not be created" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "Comment could not be created" );
        return res.status( 400 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Created comment" );
    res.status( 200 ).json( comment );
}

exports.editComment = async ( req, res ) => {

    const commentId = req.params.commentId
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    if(req.body.comment_text === undefined || req.body.comment_text === null || req.body.comment_text === "") {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "comment_text not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "comment_text not provided" );
        return res.status( 400 ).json( message );
    }

    let comment = await discussionService.editComment( commentId , authUserId , req.body );

    if(!comment) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Comment not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Comment not found" );
        return res.status( 404 ).json( message );
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( comment );
}

exports.deleteComment = async ( req, res ) => {

    const commentId = req.params.commentId
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    let comment = await discussionService.deleteComment( commentId , authUserId);

    if(!comment) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Comment not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Comment not found" );
        return res.status( 404 ).json( message );
    }

    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Deleted Comment" );
    res.status( 200 ).json( comment );
}

// Ratings

exports.setRating = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const commentId = req.params.commentId
    const userRating = req.body.rating

    if(typeof userRating !== "boolean") {
        const message = ApiMessage.createApiMessage( 400, "Bad Request", "rating not provided" );
        res.set( "x-agora-message-title", "Bad Request" );
        res.set( "x-agora-message-detail", "rating not provided" );
        return res.status( 400 ).json( message );
    }

    let rating = await discussionService.setCommentRating( commentId, userRating, authUserId );

    if(!rating) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Comment not found, rating not created" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Comment not found, rating not created" );
        return res.status( 404 ).json( message );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Set Rating" );
    res.status( 200 ).json( rating );
}

exports.removeRating = async ( req, res ) => {
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const commentId = req.params.commentId

    let rating = await discussionService.removeCommentRating( commentId, authUserId );

    if(!rating) {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Comment not found, rating not removed" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Comment not found, rating not removed" );
        return res.status( 404 ).json( message );
    }

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Removed Rating" );
    res.status( 200 ).json( rating );
}