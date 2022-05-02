/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const nodemailer = require("nodemailer");

// services
const userService = require( '../service/userService' );


exports.signIn = function( req, res ) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    
    if(req && req.body) {
        if(req.body.signInEmail || req.body.siPassword) {
            
            let user = await userService.getUserByEmail(req.body.signInEmail);
            
            // decision on email
            if(user) {
                // perform password check
                //let passCheck = await userService.checkPassword(user.email, req.body.siPassword);

                req.session.isAuth = await userService.checkPassword(user.email, req.body.siPassword);

                // decision on password
                if(req.session.isAuth) {
                    // now that we know they have valid password, get the whole user with role and topic data
                    user = await userService.setUserSession(req.body.signInEmail);
                    //console.log("full user output: " + JSON.stringify(user));

                    const uRole = await userService.getActiveRoleByName("User");
                    //console.log("uRole: " + JSON.stringify(uRole));

                    // decision on wether user has an authorized role
                    if(user.roles && user.roles.filter(role => role.id === uRole.id).length > 0) {
                        // assign the user to the session
                        req.session.authUser = user;
                        
                        // parse the UA data
                        const device = deviceDetector.parse(req.headers['user-agent']);
                        //console.log("device check: " + JSON.stringify(device));

                        var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress 
                        //console.log("ip check: " + ip);

                        // log the data
                        if(user && device) {
                            await userService.logUserSession(user.id, ip, device);

                        }

                        if(req.query.redirect) {
                            res.redirect(303, req.query.redirect);
                        }
                        else if(req.session.authUser.emailValidated) {
                            res.redirect(303, '/community');
                        }
                        else {
                            res.redirect(303, '/auth');
                        }
                    }
                    else {
                        res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "You are not authorized!"});
                    }

                }
                else {
                    if(req.query.redirect) {
                        res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "Incorrect Username / Password!"});
                    }
                    else {
                        res.render('sign-in', {passwordMessage: "Incorrect Username / Password!"});
                    }
                }
            }
            else {
                if(req.query.redirect) {
                    res.render('sign-in', {
                            redirect: req.query.redirect,
                            passwordMessage: "Incorrect Username / Password!"});
                }
                else {
                    res.render('sign-in', {passwordMessage: "Incorrect Username / Password!"});
                }
            }
        }
    }
}


exports.generateResetPasswordEmail = function( req, res ) {
    if(req.body.forgotPasswordEmail) {
        // generate and save the token
        let exeration = process.env.PW_TOKEN_EXPIRATION;
        let token = await userService.createPasswordToken(req.body.forgotPasswordEmail);
        if(token) {
            const nodeMailer = require('nodemailer');
            if(process.env.EMAIL_TOGGLE == "true") {
                let secure = (process.env.EMAIL_SECURE === 'true');
                let transporter = nodemailer.createTransport({
                    host: process.env.EMAIL_HOST,
                    secure: secure,
                    port: process.env.EMAIL_PORT,
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });
    
                const mailOptions = {
                    from: process.env.EMAIL_FROM, // sender address
                    to: req.body.forgotPasswordEmail,
                    subject: "Reset your password", // Subject line
                    html: "<p>Hello, we hope this email finds you well!</p>"
                        + "<p>You can reset your password by clicking on "
                        + "<strong><a href='http://codingcoach.net/resetPass/" + req.body.forgotPasswordEmail + "/" + token + "'>this link!</a></strong></p>"
                        + "<p>This link will expire in 24 hours!</p>"
                        + "<p>Carpe Diem!</p>"
                        + "<p>The Coding Coach Team</p>", // plain text body
                };
    
                await transporter.sendMail(mailOptions, function(err, info) {
                    if (err) {
                        // handle error
                        console.log(err);
                    }
                    //console.log(info);
                });
            }
            else {
                console.log("[WARN] Forgot password email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)");
            }
            

            res.render('user-reset-password-sent');
        }
        else {
            res.redirect(303, '/userError');
        }
    }
    else {
        res.redirect(303, '/userError');
    }
}


exports.verifyResetPasswordToken = function ( req, res ) {
    let userEmail = req.params.email;
    let userToken = req.params.token;
    //console.log("user email: " + userEmail + " user Token: " + userToken);
    if(userEmail && userToken) {
        // verify email and token match
        let ready = await userService.verifyEmailTokenResetCombo(userEmail, userToken);
        if(ready) {
            // show reset page
            res.render('user-reset-password', {email: userEmail, token: userToken});
        }
    }
}