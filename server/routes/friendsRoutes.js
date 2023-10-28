/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
// controllers
const friendsController = require( '../controller/apis/friendController' );

/**
 * Show friends page
 */
router.route( '/' )
    .get( ( req, res ) => {
        friendsController.getFriends( req, res );
    }
    );

/**
 * Show add-friends page
 */
router.route( '/add-friends' )
    .get( ( req, res ) => {
        friendsController.getAddFriends( req, res );
    } 
    );

router.route( '/add-friends/:userId' )
    .post( async ( req, res ) => { 
        friendsController.sendFriendRequest( req, res );
    }
    ); 
    
module.exports = router;