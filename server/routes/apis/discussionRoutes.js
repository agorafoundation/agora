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
 
// discussions /api/v1/auth/discussions/{goal | topic}/:id
router.route( '/:type/:id' )
    // get a discussion based off topic or goal id
    .get( async ( req, res ) => {
        discussionController.getDiscussion( req, res );
    })
    // update a discussion based off topic or goal id
    .patch( async ( req, res ) => { 
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