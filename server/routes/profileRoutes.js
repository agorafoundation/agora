/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
// controllers
const profileController = require( '../controller/profileController' );
const friendsController = require( '../controller/apis/friendController' );

/**
 * Show user profile
 */
router.route( '/user/:userId' )
    .get( async ( req, res ) => {
        profileController.getProfile( req, res );
    }
    );

/**
 * User profile management page
 */
router.route( '/manageProfile' )
    .get( ( req, res ) => {
        profileController.manageProfile( req, res );
    }
    );

module.exports = router;