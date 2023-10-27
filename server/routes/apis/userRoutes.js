/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );

// import controllers
const userController = require( '../../controller/apis/userController' );

// Get user data by email address
router.route( '/email/:email' )
    .get( ( req, res ) => {
        userController.getUserByEmail( req, res );
    }
    );

// Get user data by username
router.route( '/username/:username' )
    .get( ( req, res ) => {
        userController.getUserByUsername( req, res );
    }
    );

// Get user data by userId
router.route( '/userId/:userId' )
    .get( ( req, res ) => {
        userController.getActiveUserById( req, res );
    }
    );

router.route( '/getAuthUser' )
    .get( ( req, res ) => {
        userController.getAuthUser( req, res );
    })

module.exports = router;

