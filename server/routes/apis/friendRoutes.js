/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();

// controllers
const friendController = require( '../../controller/apis/friendController' );
const notificationController = require ( '../../controller/apis/notificationController');

router.route( '/allFriends' )
    //get all friends
    .get( async ( req, res ) => {
        friendController.getAllFriends( req, res );
    } );


router.route( '/requestCount' )
    .get( async ( req, res ) => {
        notificationController.getUnreadFriendRequestCount( req, res );
    });


// Route to handle sending friend requests
router.route( '/request' )
    // Get all pending friend requests for the user
    .get( async ( req, res ) => {
        notificationController.getUnreadFriendRequests( req, res );
    } );

router.route( '/unreadRequests' )
    .get( async ( req, res ) => {
        friendController.getUnacceptedFriendRequests( req, res );
    });


router.route( '/sendFriendRequest' )
    .post( async ( req, res ) => {
        friendController.sendFriendRequest( req, res );
    } );

//Router to handle friend request response.
router.route( '/responseToRequest' )
    //Accepted
    .post( async ( req, res ) => {
        friendController.acceptFriendRequest( req, res );
    } )
    //Rejected
    .delete( async ( req, res ) => {
        friendController.rejectFriendRequest( req, res );
    } );

router.route( '/:userID' )
    /*
    //get a friend by their user ID.
    .get( async ( req, res ) => {
        friendController.getFriendByID( req, res );
    } )
    */
    .delete( async ( req, res ) => {
        friendController.deleteFriendByID( req, res );
    } );

module.exports = router;