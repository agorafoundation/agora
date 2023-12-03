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

router.route( '/allFriends' )
    //get all friends
    .get( async ( req, res ) => {
        friendController.getAllFriends( req, res );
    } );

// Route to handle sending friend requests
router.route( '/request' )
    // Get all pending friend requests for the user
    .get( async ( req, res ) => {
        friendController.getUnreadFriendRequests( req, res );
    } );

router.route( '/unreadRequests' )
    .get( async ( req, res ) => {
        friendController.getUnacceptedFriendRequests( req, res );
    } );

router.route( '/sendFriendRequest' )
    .post( async ( req, res ) => {
        friendController.sendFriendRequest( req, res );
    } );

router.route( '/getResources' )
    .get( async ( req, res ) => {
        friendController.getResources( req, res );
    } );

router.route( '/requestResponse' )
    .post( async ( req, res ) => { 
        friendController.acceptFriendRequest( req, res );
    } )
    .delete( async ( req, res ) => {
        friendController.denyFriendRequest( req, res );
    } );
   
router.route( '/deleteFriend' )
    .delete( async ( req, res ) => {
        friendController.deleteFriendByID( req, res );
    } );

module.exports = router;