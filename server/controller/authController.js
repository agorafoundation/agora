/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
// nodemailer / email
const nodemailer = require( "nodemailer" );

// import UA parsing library
const DeviceDetector = require( "device-detector-js" );
const deviceDetector = new DeviceDetector();

// services
const userService = require( '../service/userService' );

/**
 * Main authenication method for all Basic Auth API requests
 * @param {User Email} email 
 * @param {User Password} password 
 * @returns 
 */
exports.basicAuth = async ( email, password, req ) => {
    if( email && password ) {
        // get user for email
        const user = await userService.getUserByEmailWithRoles( email );

        if( user ) {
            // verify password for user
            const authorized = await userService.checkPassword( user.email, password );

            if( authorized ) {
                // get the user role
                const uRole = await userService.getActiveRoleByName( "User" );

                // verify the user has the required role
                if( user.roles && user.roles.filter( role => role.roleId === uRole.roleId ).length > 0 ) {

                    // parse and log the User client data if enabled
                    if( process.env.REQUEST_DATA_LOGGING ) {
                        // parse the UA data
                        const device = deviceDetector.parse( req.headers['user-agent'] );

                        // null checks on device    
                        if( !device ) {
                            let device = { client:null, os:null, device:null, bot:null };
                        }
                        if ( !device.client ) {
                            device.client = { type: "Basic Auth / Unknown client", name: "unknown", version: "unknown", engineVersion: "unknown" };
                        }
                        if( !device.os ) {
                            device.os = { name: "unknown", version: "unknown", platform: "unknown" };
                        }
                        if( !device.device ) {
                            device.device = { type: "Basic Auth / API call", brand: "unknown", model: "unknown" };
                        }

                        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
                        
                        userService.logUserSession( user.userId, ip, device );
                    }

                    return user;
                } 
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }

    }
};

const { OAuth2Client } = require( 'google-auth-library' );

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client( '${process.env.GOOGLE_CLIENT_ID}' );


exports.googleSignIn = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html; charset=utf-8' );

    if( req.body.credential ) {
        const ticket = await client.verifyIdToken( {
            idToken: req.body.credential,
            audience: GOOGLE_CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
            // Or, if multiple clients access the backend:
            //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        } );
        const payload = ticket.getPayload();
        const userid = payload['sub'];

        let user = await userService.getUserByEmail( payload['email'] );

        // decision on email
        if( user ) {
            req.session.isAuth = true;
            req.body.signInEmail = payload['email'];
            await signIn( req, res );

            if( req.query.redirect ) {
                //console.log( "2" );
                res.redirect( 303, req.query.redirect );
            }
            else if( req.session.authUser.emailValidated ) {
                //console.log( "3" );
                res.redirect( 303, '/dashboard' );
            }
            else {
                //console.log( "4" );
                req.session.messageType = "info";
                req.session.messageTitle = "Email not verified!";
                req.session.messageBody = "Please check your email for a verifacation link and click on it to finish the verification process.  <strong>Be sure to check your spam folder</strong> if you do not see it in your inbox. If it has not arrived after a few minutes <a href='/user/revalidate/<%- user.email %>'>Re-send verification email</a>";
                res.redirect( 303, '/dashboard' );
            }
        }
        else {
            req.session.messageType = "info";
            req.session.messageTitle = "User Account Not Found";
            req.session.messageBody = "You are not currently registered with Agora. You can sign up either with your Google account by filling out the informtion in the form</a>";
            res.redirect( 303, '/dashboard' );
        }
        
    }
    else {
        res.render( 'sign-in', {passwordMessage: "Google login failure"} );
    }
    // If request specified a G Suite domain:
    // const domain = payload['hd'];
};

exports.passwordSignIn = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html; charset=utf-8' );
    
    if( req && req.body ) {
        if( req.body.signInEmail || req.body.siPassword ) {
            
            let user = await userService.getUserByEmail( req.body.signInEmail );
            
            // decision on email
            if( user ) {
                // perform password check
                //let passCheck = await userService.checkPassword(user.email, req.body.siPassword);

                req.session.isAuth = await userService.checkPassword( user.email, req.body.siPassword );

                // decision on password
                if( req.session.isAuth ) {
                    //console.log( "0" );
                    await signIn( req, res );
                    //console.log( "1" );
                    console.log( "redirect: " + req.query.redirect );
        
                    if( req.query.redirect ) {
                        //console.log( "2" );
                        res.redirect( 303, req.query.redirect );
                    }
                    else if( req.session.authUser.emailValidated ) {
                        //console.log( "3" );
                        res.redirect( 303, '/dashboard' );
                    }
                    else {
                        //console.log( "4" );
                        req.session.messageType = "info";
                        req.session.messageTitle = "Email not verified!";
                        req.session.messageBody = "Please check your email for a verifacation link and click on it to finish the verification process.  <strong>Be sure to check your spam folder</strong> if you do not see it in your inbox. If it has not arrived after a few minutes <a href='/user/revalidate/<%- user.email %>'>Re-send verification email</a>";
                        res.redirect( 303, '/dashboard' );
                    }

                }
                else {
                    if( req.query.redirect ) {
                        res.render( 'sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "Incorrect Username / Password!"} );
                    }
                    else {
                        res.render( 'sign-in', {passwordMessage: "Incorrect Username / Password!"} );
                    }
                }
            }
            else {
                if( req.query.redirect ) {
                    res.render( 'sign-in', {
                        redirect: req.query.redirect,
                        passwordMessage: "Incorrect Username / Password!"} );
                }
                else {
                    res.render( 'sign-in', {passwordMessage: "Incorrect Username / Password!"} );
                }
            }
        }
    }
};

/**
 * Main authenication method for user UI sessions
 * @param {HTTP request} req 
 * @param {HTTP response} res 
 */
const signIn = async function( req, res ) {

    // now that we know they have valid password, get the whole user with role and topic data
    let user = await userService.setUserSession( req.body.signInEmail );
    //console.log( "full user output: " + JSON.stringify( user ) );

    const uRole = await userService.getActiveRoleByName( "User" );
    //console.log("uRole: " + JSON.stringify(uRole));

    // decision on wether user has an authorized role
    if( user.roles && user.roles.filter( role => role.roleId === uRole.roleId ).length > 0 ) {
        // assign the user to the session
        req.session.authUser = user;

        // parse and log the User client data if enabled
        if( process.env.REQUEST_DATA_LOGGING ) {

            // parse the UA data
            let device = deviceDetector.parse( req.headers['user-agent'] );
            //console.log("device check: " + JSON.stringify(device));

            // null checks on device    
            if( !device ) {
                device = { client:null, os:null, device:null, bot:null };
            }
            if ( !device.client ) {
                device.client = { type: "User Session / Unknown client", name: "unknown", version: "unknown", engineVersion: "unknown" };
            }
            if( !device.os ) {
                device.os = { name: "unknown", version: "unknown", platform: "unknown" };
            }
            if( !device.device ) {
                device.device = { type: "unknown", brand: "unknown", model: "unknown" };
            }

            var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            //console.log("ip check: " + ip);

            // log the data
            if( user && device ) {
                await userService.logUserSession( user.userId, ip, device );

            }
        }

        
    }
    else {
        res.render( 'sign-in', {
            redirect: req.query.redirect,
            passwordMessage: "You are not authorized!"} );
    }

};


exports.generateResetPasswordEmail = async function( req, res ) {
    if( req.body.forgotPasswordEmail ) {
        // generate and save the token
        let exeration = process.env.PW_TOKEN_EXPIRATION;
        let token = await userService.createPasswordToken( req.body.forgotPasswordEmail );
        if( token ) {
            const nodeMailer = require( 'nodemailer' );
            if( process.env.EMAIL_TOGGLE == "true" ) {
                let secure = ( process.env.EMAIL_SECURE === 'true' );
                let transporter = nodemailer.createTransport( {
                    host: process.env.EMAIL_HOST,
                    secure: secure,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                } );

                let siteUrl = "";
                if( process.env.SITE_PORT && process.env.SITE_PORT > 0 ) {
                    siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' +process.env.SITE_PORT;
                }
                else {
                    siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST;
                }
    
                const mailOptions = {
                    from: process.env.EMAIL_FROM, // sender address
                    to: req.body.forgotPasswordEmail,
                    subject: "Reset your password", // Subject line
                    html: "<p>Hello, we hope this email finds you well!</p>"
                        + "<p>You can reset your password by clicking on "
                        + "<strong><a href='" + siteUrl + "/resetPass/" + req.body.forgotPasswordEmail + "/" + token + "'>this link!</a></strong></p>"
                        + "<p>This link will expire in 24 hours!</p>"
                        + "<p>Carpe Diem!</p>"
                        + "<p>The Agora Team</p>", // plain text body
                };
    
                await transporter.sendMail( mailOptions, function( err, info ) {
                    if ( err ) {
                        // handle error
                        console.log( err );
                    }
                    //console.log(info);
                } );
            }
            else {
                console.log( "[WARN] Forgot password email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" );
            }
            

            res.render( 'user-reset-password-sent' );
        }
        else {
            res.redirect( 303, '/userError' );
        }
    }
    else {
        res.redirect( 303, '/userError' );
    }
};


exports.verifyResetPasswordToken = async function ( req, res ) {
    let userEmail = req.params.email;
    let userToken = req.params.token;
    if( userEmail && userToken ) {
        // verify email and token match
        let ready = await userService.verifyEmailTokenResetCombo( userEmail, userToken );
        if( ready ) {
            // show reset page
            res.render( 'user-reset-password', {email: userEmail, token: userToken} );
        }
        else {
            res.render( 'user-error', {error_message: "Token was not valid."} );
        }
    }
};

exports.verifyEmailWithToken = async function( req, res ) {
    let userEmail = req.params.email;
    let emailToken = req.params.token;
    if( userEmail && emailToken ) {
        // verify email and token match
        let ready = await userService.verifyEmailTokenVerifyCombo( userEmail, emailToken );
        if( ready ) {
            req.session.destroy( ( error ) => {
                if ( error ) throw error;
                res.render( 'sign-in', { message: "Your email address has been successfully verified!", message2: "Thank you for verifying your email! Please sign in." } );
            } );
        }
        else {
            res.redirect( 303, '/userError' );
        }
    }
    else {
        res.redirect( 303, '/userError' );
    }
};

/**
 * Changes the users password based on the token sent and email address
 * @param {*} req 
 * @param {*} res 
 */
exports.resetPassword = async function ( req, res ) {
    let userEmail = req.body.pwResetEmail;
    let userToken = req.body.pwResetToken;
    let hashedPassword = await userService.passwordHasher( req.body.psw );

    if( userEmail && userToken && hashedPassword ) {
        let result = await userService.resetPassword( userEmail, userToken, hashedPassword );
        if( result ) {
            res.render( 'sign-in', { message: "Your Password has been successfully changed!", message2: "You may now sign in." } );
        }
        else {
            res.redirect( 303, '/userError' );
        }
    }
};