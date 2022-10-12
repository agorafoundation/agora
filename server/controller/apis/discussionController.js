/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const discussionService = require("../../service/discussionService")

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
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( discussion );
}

exports.updateDiscussionByGoalId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const id = req.params.id

    // get all the active goals
    let discussion = await discussionService.updateDiscussion( "goal", id, authUserId, req.body );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( discussion );
}

exports.createDiscussionByGoalId = async ( req, res ) => {

    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    const id = req.params.id

    // get all the active goals
    let discussion = await discussionService.createDiscussion( "goal", id, authUserId, req.body.text );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( discussion );
}

exports.getDiscussionByTopicId = async ( req, res ) => {

    const id = req.params.id

    // get the discussion by topic id
    let discussion = await discussionService.getDiscussion( "topic", id );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned discussion" );
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
    
    const id = req.params.id

    // get all the active goals
    let discussion = await discussionService.updateDiscussion( "topic", id, req.body );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( discussion );
}

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

    let rating = await discussionService.setCommentRating( commentId, userRating, authUserId );

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
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

    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Updated discussion" );
    res.status( 200 ).json( rating );
}
    

exports.createComment = async (req, res) => {
    // get the user id either from the request user from basic auth in API call, or from the session for the UI
    let authUserId;
    if( req.user ) {
        authUserId = req.user.id;
    }
    else if( req.session.authUser ) {
        authUserId = req.session.authUser.id;
    }

    // get all the active goals
    let comment = await discussionService.createComment(authUserId, req.body );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
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

    // get all the active goals
    let goals = await discussionService.editComment( commentId , authUserId , req.body );

    if(!goals) {
        res.set( "x-agora-message-title", "Error" );
        res.set( "x-agora-message-detail", "Comment not found" );
        res.status( 404 ).json( { message: "Comment not found" } );
        return
    }
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
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

    // get all the active goals
    let goals = await discussionService.deleteComment( commentId , authUserId);
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}