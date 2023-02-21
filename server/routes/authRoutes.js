/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

// controllers
const authController = require( '../controller/authController' );



router.route( '/google-auth' )
    .post( async ( req, res ) => {

        await authController.googleSignIn( req, res );
        // Use the googleUser information to authenticate the user

    } );


router.route( '/signIn' )
    .get( ( req, res ) => {
        // see if a redirect parameter was passed and pass it through to the view to include in the sign in post.
        if( req.query.redirect ) {
            res.locals.redirect = req.query.redirect;
        }
        res.render( 'sign-in', {redirect: req.query.redirect} );
    } )
    .post( ( req, res ) => {
        authController.passwordSignIn( req, res );
    }
    );

router.route( '/signOut' )
    .get( ( req, res ) => {
        req.session.destroy( ( error ) => {
            if ( error ) throw error;
        } );
        req.session = null;
        req.user = null;
        res.render( 'sign-in', { message: "You have been signed out!", message2: "Thank you for being a part of our community! Hope to see you again soon." } );
    }
    );

router.route( '/forgotPass' )
    .get( ( req, res ) => {
        res.render( 'user-forgot-password' );
    }
    );

router.route( '/userError' )
    .get( ( req, res ) => {
        res.render( 'user-error' );
    }
    );

router.route( '/resetPass' )
    .post( ( req, res ) => {
        authController.generateResetPasswordEmail( req, res );
    }
    );

router.route( '/resetPass/:email/:token' )
    .get( ( req, res ) => {
        authController.verifyResetPasswordToken( req, res );
    }
    );

router.route( '/newPass' )
    .post( ( req, res ) => {
        authController.resetPassword( req, res );
    }
    );

router.route( '/verifyEmail/:email/:token' )
    .get( ( req, res ) => {
        authController.verifyEmailWithToken( req, res );
    }
    );


module.exports = router;