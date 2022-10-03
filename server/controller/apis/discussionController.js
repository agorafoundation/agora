/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const discussionService = require("../../service/discussionService")

exports.getDiscussion = async ( req, res ) => {

    const type = req.params.type
    const id = req.params.id

    // get all the active goals
    let goals = await discussionService.getDiscussion( type, id );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}

exports.updateDiscussion = async ( req, res ) => {

    const type = req.params.type
    const id = req.params.id

    // get all the active goals
    let goals = await discussionService.updateDiscussion( type, id, req.body );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}

exports.editComment = async ( req, res ) => {

    const id = req.params.commentId

    // get all the active goals
    let goals = await discussionService.editComment( id , req.user.id , req.body );
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}

exports.deleteComment = async ( req, res ) => {

    const id = req.params.commentId

    // get all the active goals
    let goals = await discussionService.deleteComment( id , req.user.id);
    
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all goals" );
    res.status( 200 ).json( goals );
}