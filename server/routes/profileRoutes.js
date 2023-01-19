/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
// controllers
const profileController = require( '../controller/profileController' );

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