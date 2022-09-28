/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
     extended: true
}));
router.use(bodyParser.json());
 
//dependencies 

// controllers
const discussionController = require( '../../controller/apis/discussionController' ); 
 // /api/v1/auth/discussions/goal/4 req.params.type === "goal" req.params.id === 4
// discussions /api/v1/auth/discussions/{goal | topic}/:id
router.route( '/goal/:id' )
    // get a discussion based off topic or goal id
    .get( async ( req, res ) => {
        req.params.type = "goal"
        discussionController.getDiscussion( req, res );
    })
    // update a discussion based off topic or goal id
    .patch( async ( req, res ) => { 
        req.params.type = "goal"
        discussionController.updateDiscussion( req, res );
    })

router.route( '/topic/:id' )
    // get a discussion based off topic or goal id
    .get( async ( req, res ) => {
        req.params.type = "topic"
        discussionController.getDiscussion( req, res );
    })
    // update a discussion based off topic or goal id
    .patch( async ( req, res ) => { 
        req.params.type = "topic"
        discussionController.updateDiscussion( req, res );
    })
 
// discussions /api/v1/auth/discussion
router.route( '/rating/:commentId' )
    // update a visible goal by id
    .post( async ( req, res ) => {
        discussionController.setRating( req, res )
    })
    // delete a visible goal by id
    .delete( async (req, res ) => {
        discussionController.removeRating( req, res )
    });
 
// leave a comment
router.route( '/comment' )
     // enroll an eligible user in a visibile goal
     .post( async ( req, res ) => {
        discussionController.createComment( req, res )
     })

// modify an exsting comment
router.route( '/comment/:commentId' )
     .patch(async ( req, res ) => {
        discussionController.editComment( req, res )
     })
     .delete( async ( req, res ) => {
        discussionController.deleteComment( req, res )
     })
 
 
 module.exports = router;