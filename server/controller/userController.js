// import model
const User = require("../model/user");

// import services
const userService = require("../service/userService");
const stripeService = require("../service/stripeService");

// dependencies
const nodemailer = require("nodemailer");
const fs = require( 'fs' );
let path = require( 'path' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const IMAGE_PATH = process.env.AVATAR_IMAGE_PATH;

/**
 * Creates a user
 * @param {} req 
 * @param {*} res 
 */
exports.createUser = async function( req, res ) {
    res.setHeader( 'Content-Type', 'text/html' );
    let user = "";

    
    if(req && req.body) {
        if(req.body.userEmail) {

            // create model
            let email = req.body.userEmail;
            let username = req.body.userUsername;
            //console.log(email);

            subscriptionActive = true;

            let beginningProgramming = (req.body.beginningProgramming == "on") ? true : false;
            let intermediateProgramming = (req.body.intermediateProgramming == "on") ? true : false;
            let advancedProgramming = (req.body.advancedProgramming == "on") ? true : false;
            let mobileDevelopment = (req.body.mobileDevelopment == "on") ? true : false;
            let roboticsProgramming = (req.body.roboticsProgramming == "on") ? true : false;
            let webApplications = (req.body.webApplications == "on") ? true : false;
            let web3 = (req.body.web3 == "on") ? true : false;
            let iotProgramming = (req.body.iotProgramming == "on") ? true : false;
            let databaseDesign = (req.body.databaseDesign == "on") ? true : false;
            let relationalDatabase = (req.body.relationalDatabase == "on") ? true : false;
            let noSqlDatabase = (req.body.noSqlDatabase == "on") ? true : false;
            let objectRelationalMapping = (req.body.objectRelationalMapping == "on") ? true : false;

            // create a stripe account and retrieve the generated id
            let fullname = req.body.firstName + " " + req.body.lastName;
            let stripeId = await stripeService.createStripeCustomer(email, fullname);

            let hashedPassword = await userService.passwordHasher(req.body.psw);

            user = User.createUser(email, username, 'profile-default.png', false, req.body.firstName, req.body.lastName, hashedPassword, 0, subscriptionActive,
                beginningProgramming, intermediateProgramming, advancedProgramming, mobileDevelopment, roboticsProgramming,
                webApplications, web3, iotProgramming, databaseDesign, relationalDatabase, noSqlDatabase, objectRelationalMapping, stripeId, 0);

            // save the user to the database!
            userService.saveUser(user).then((insertResult) => {
                if(req.body.userEmail && insertResult) {
                    // send verification email
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

                        let siteUrl = "";
                        if(process.env.SITE_PORT && process.env.SITE_PORT > 0) {
                            siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' +process.env.SITE_PORT;
                        }
                        else {
                            siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST
                        }

                        const mailOptions = {
                            from: process.env.EMAIL_FROM, // sender address
                            to: req.body.userEmail,
                            subject: "Verify your email", // Subject line
                            html: "<p>Hello, we hope this email finds you well!</p>"
                                + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                                + "Complete the process by <strong><a href='" + siteUrl + "/verifyEmail/" + req.body.userEmail + "/" + insertResult + "'>clicking this link!</a></strong></p>"
                                + "<p>Carpe Diem!</p>"
                                + "<p>The Agora Team</p>", // plain text body
                        };

                        transporter.sendMail(mailOptions, function(err, info) {

                            if (err) {
                                // handle error
                                console.log(err);
                            }
                        });

                        if(req.query.redirect) {
                            res.render('user-welcome', { redirect: req.query.redirect, message: "Please check your email for our verification to complete the process!" });
                        }
                        else {
                            res.render('user-welcome', { message: "Please check your email for our verification to complete the process!" });
                        }
                    }
                    else {
                        console.log("[WARN] Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)");
                        if(req.query.redirect) {
                            res.render('user-welcome', { redirect: req.query.redirect, message: "Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" });
                        }
                        else {
                            res.render('user-welcome', { message: "Save user verification email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" });
                        }
                    }
                    
                    
                }
                else if(!insertResult) {
                    if(req.query.redirect) {
                        //
                        res.render('user-signup', { redirect: req.query.redirect, error_message: "Error creating your account the email or username you choose may already be in use." });
                    }
                    else {
                        res.render('user-signup', {error_message: "Error creating your account the email or username you choose may already be in use."});
                    }

                }
                else {
                    if(req.query.redirect) {
                        res.redirect(303, "/community/error", { redirect: req.query.redirect });
                    }
                    else {
                        res.redirect(303, "/community/error");
                    }
                }
            });
        }
        else {
            if(req.query.redirect) {
                res.redirect(303, "/community/error", { redirect: req.query.redirect });
            }
            else {
                res.redirect(303, "/community/error");
            }
        }
    }
    else {
        if(req.query.redirect) {
            res.redirect(303, "/community/error", { redirect: req.query.redirect });
        }
        else {
            res.redirect(303, "/community/error");
        }
    }
    
}

exports.updateUser = async function( req, res ){

    res.setHeader('Content-Type', 'text/html');
    let user = "";

    if(req && req.body) {
        // create model
        let email = req.body.manageEmail;

        // get current user
        let user = await userService.getUserByEmail(email);

        let subscriptionActive = (req.body.subscriptionActive == "on") ? true : false;
        let beginningProgramming = (req.body.beginningProgramming == "on") ? true : false;
        let intermediateProgramming = (req.body.intermediateProgramming == "on") ? true : false;
        let advancedProgramming = (req.body.advancedProgramming == "on") ? true : false;
        let mobileDevelopment = (req.body.mobileDevelopment == "on") ? true : false;
        let roboticsProgramming = (req.body.roboticsProgramming == "on") ? true : false;
        let webApplications = (req.body.webApplications == "on") ? true : false;
        let web3 = (req.body.web3 == "on") ? true : false;
        let iotProgramming = (req.body.iotProgramming == "on") ? true : false;
        let databaseDesign = (req.body.databaseDesign == "on") ? true : false;
        let relationalDatabase = (req.body.relationalDatabase == "on") ? true : false;
        let noSqlDatabase = (req.body.noSqlDatabase == "on") ? true : false;
        let objectRelationalMapping = (req.body.objectRelationalMapping == "on") ? true : false;

        user.email = email;
        user.firstName = req.body.firstName;
        user.lastName = req.body.lastName;
        user.subscriptionActive =subscriptionActive;
        user.beginningProgramming = beginningProgramming;
        user.intermediateProgramming = intermediateProgramming;
        user.advancedProgramming = advancedProgramming;
        user.mobileDevelopment = mobileDevelopment;
        user.roboticsProgramming = roboticsProgramming;
        user.webApplications = webApplications;
        user.web3 = web3;
        user.iotProgramming = iotProgramming;
        user.databaseDesign = databaseDesign;
        user.relationalDatabase = relationalDatabase;
        user.noSqlDatabase = noSqlDatabase;
        user.objectRelationalMapping = objectRelationalMapping;

        // save the user to the database!
        userService.saveUser(user).then(() => {
            req.session.reload(() => {
                req.session.authUser = user;

                // TODO: can this be removed to make this a pure API, how will the profile page refresh
                res.redirect(303, "/profile/manageProfile");
            })

        });
    }
    else {
        // TODO: can this be removed to make this a pure API, how will the profile page refresh
        res.redirect(303, "/userError");
    }
    
}

exports.reValidateEmail = async function( req, res ) {
    // check to see that user is logged in with matching email address
    if(req.session.authUser.email && req.params.email === req.session.authUser.email) {
        let newToken = await userService.reValidateEmail(req.session.authUser.email);

        if(process.env.EMAIL_TOGGLE == "true") {
            // send verification email
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

            let siteUrl = "";
            if(process.env.SITE_PORT && process.env.SITE_PORT > 0) {
                siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST + ':' +process.env.SITE_PORT;
            }
            else {
                siteUrl = process.env.SITE_PROTOCOL + process.env.SITE_HOST
            }

            const mailOptions = {
                from: process.env.EMAIL_FROM, // sender address
                to: req.session.authUser.email,
                subject: "Verify your email", // Subject line
                html: "<p>Hello, we hope this email finds you well!</p>"
                    + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                    + "Complete the process by <strong><a href='" + siteUrl + "/verifyEmail/" + req.session.authUser.email + "/" + newToken + "'>clicking this link!</a></strong></p>"
                    + "<p>Carpe Diem!</p>"
                    + "<p>The Agora Team</p>", // plain text body
            };

            transporter.sendMail(mailOptions, function(err, info) {

                if (err) {
                    // handle error
                    console.log(err);
                }
            });

            res.render('user-welcome', { message: "Please check your email for our verification to complete the process!" });
        }
        else {
            res.render('user-welcome', { message: "re-validate email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)" });
            console.log("[WARN] re-validate email not sent because EMAIL_TOGGLE value set to false (sending emails is turned off!)");
        }
        
        

    }
    else {
        res.render('user-error');
    }
}





exports.saveProfileImage = async function( req, res, email, filename ) {

    // save image in db and delete old file  
    if( email ) {
        userService.updateProfileFilename( email, filename ).then( async ( rValue ) => {
            if( rValue && ( rValue != 'goal-default.png' || rValue != 'peak.svg' ) ) {
                await fs.unlink( UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH + rValue, ( err ) => {
                    if( err ) {
                        console.log( "[userController] file delete error status: " + err );
                        return false;
                    }
                    else {
                        return true;
                    }
                    
                });
            } 
            else {
                return true;
            }

        });
    }
    
    
}


