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

app.route( '/signOut' )
    .get( ( req, res ) => {
        
    }
)





















app.post('/newPass', async (req, res) => {
    let userEmail = req.body.pwResetEmail;
    let userToken = req.body.pwResetToken;
    let hashedPassword = await userService.passwordHasher(req.body.psw);

    if(userEmail && userToken && hashedPassword) {
        let result = await userService.resetPassword(userEmail, userToken, hashedPassword);
        if(result) {
            res.render('sign-in', { message: "Your Password has been successfully changed!", message2: "You may now sign in." });
        }
        else {
            res.redirect(303, '/userError');
        }
    }
})

app.get('/verifyEmail/:email/:token', async (req, res) => {
    let userEmail = req.params.email;
    let emailToken = req.params.token;
    //console.log("user email: " + userEmail + " email Token: " + emailToken);
    if(userEmail && emailToken) {
        // verify email and token match
        let ready = await userService.verifyEmailTokenVerifyCombo(userEmail, emailToken);
        if(ready) {
            req.session.destroy((error) => {
                if (error) throw error;
                res.render('sign-in', { message: "Your email address has been successfully verified!", message2: "Thank you for verifying your email! Please sign in." });
            });
        }
        else {
            res.redirect(303, '/userError');
        }
    }
    else {
        res.redirect(303, '/userError');
    }
}
);








module.exports = router;