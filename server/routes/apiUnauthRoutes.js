/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();

// import controllers
const userController = require( '../controller/apis/userController' );
const rateLimit = require('express-rate-limit');

const vEmailLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 15 minutes"
});

// verify email existence
router.route( '/verifyEmail/:email' )
    .get(vEmailLimiter, function( req, res ) {
        userController.verifyEmail( req, res );

    }
    );

// verify username existence
router.route( '/verifyUsername/:username' )
    .get(vEmailLimiter, function( req, res ) {
        userController.verifyUsername( req, res );

    }
    );


module.exports = router;
