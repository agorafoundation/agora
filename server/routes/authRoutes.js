/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

 var express = require( 'express' );
 var router = express.Router( );

const authController = require( '../controller/authController' );


router.route( '/signIn' )
    .get( ( req, res ) => {
        // see if a redirect parameter was passed and pass it through to the view to include in the sign in post.
        if( req.query.redirect ) {
            res.locals.redirect = req.query.redirect;
        }
        res.render( 'sign-in', {redirect: req.query.redirect} );
    } )
    .post( ( req, res ) => {
        authController.signIn( req, res );
    }
)

app.route( '/signOut' )
    .get( ( req, res ) => {
        req.session.destroy((error) => {
            if (error) throw error;
            res.render('sign-in', { message: "You have been signed out!", message2: "Thank you for being a part of our community! Hope to see you again soon." });
        });
    }
)

app.route( '/forgotPass' )
    .get( ( req, res ) => {
        res.render('user-forgot-password');
    }
)

app.route( '/userError' )
    .get( ( req, res ) => {
        res.render('user-error');
    }
)

app.route( '/resetPass' )
    .post( ( req, res ) => {
        authController.generateResetPasswordEmail( req, res );
    }
)

app.route( '/resetPass/:email/:token' )
    .get( ( req, res ) => {
        authController.verifyResetPasswordToken( req, res );
    }
)

app.route( '/newPass' )
    .get( ( req, res ) => {
        authController.resetPassword( req, res );
    }
)

app.route( '/verifyEmail/:email/:token' )
    .get( ( req, res ) => {
        authController.verifyEmailWithToken( req, res );
    }
)

app.route( '/signOut' )
    .get( ( req, res ) => {
        
    }
)




















app.get('', async (req, res) => {
    
}
);








module.exports = router;