/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
//dependencies 

// controllers
const discussionController = require( '../../controller/apis/discussionController' ); 
const { validate } = require( '../middleware/inputValidation' );
const { z } = require( 'zod' );
// /api/v1/auth/discussions/goal/4 req.params.type === "goal" req.params.id === 4
// discussions /api/v1/auth/discussions/{goal | topic}/:id
router.route( '/goal/:id' )
    // get a discussion based off goal id
    .get( async ( req, res ) => {
        discussionController.getDiscussionByGoalId( req, res );
    } )
    // update a discussion based off goal id
    .patch( 
        validate( z.object( {discussion_text: z.string()} ) ), 
        async ( req, res ) => { 
            discussionController.updateDiscussionByGoalId( req, res );
        } 
    )
    .post( 
        validate( z.object( {discussion_text: z.string()} ) ), 
        async ( req, res ) => {
            discussionController.createDiscussionByGoalId( req, res );
        } 
    );

router.route( '/topic/:id' )
    // get a discussion based off topic id
    .get( async ( req, res ) => {
        discussionController.getDiscussionByTopicId( req, res );
    } )
    // update a discussion based off topic id
    .patch( 
        validate( z.object( {discussion_text: z.string()} ) ), 
        async ( req, res ) => { 
            discussionController.updateDiscussionByTopicId( req, res );
        } 
    )
    .post( 
        validate( z.object( {discussion_text: z.string()} ) ), 
        async ( req, res ) => {
            discussionController.createDiscussionByTopicId( req, res );
        } 
    );

router.route( '/rating/:commentId' )
    // update a comment rating
    .post( 
        validate( z.object( {rating: z.boolean()} ) ),
        async ( req, res ) => {
            discussionController.setRating( req, res );
        } )
    // delete a comment rating
    .delete( async ( req, res ) => {
        discussionController.removeRating( req, res );
    } );
 
// leave a comment
router.route( '/comment' )
// create a comment
    .post( 
        validate( z.object( {
            parent_id: z.number().positive(), 
            parent_type: z.enum( [ 'goal', 'topic' ] ), 
            comment_text: z.string()
        } ) ),
        async ( req, res ) => {
            discussionController.createComment( req, res );
        } 
    );

// modify an exsting comment
router.route( '/comment/:commentId' )
    .patch( 
        validate( z.object( {comment_text: z.string()} ) ), 
        async ( req, res ) => {
            discussionController.editComment( req, res );
        } )
    .delete( async ( req, res ) => {
        discussionController.deleteComment( req, res );
    } );
 
 
module.exports = router;