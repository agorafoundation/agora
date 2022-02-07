/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();


const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());

// import model
const User = require("../model/user");

// import service
const userService = require("../service/userService");

// import mailer
const nodemailer = require("nodemailer");

// import multer (file upload)
const fs = require('fs');
var path = require('path');
var baseProfileUrl = process.env.AVATAR_BASE_URL;
var UPLOAD_PATH = path.resolve(__dirname, '..', process.env.AVATAR_STORAGE);
var UPLOAD_PATH_BASE = path.resolve(__dirname, '..', process.env.STORAGE_BASE);
var maxSize = 1 * 1024 * 1024;

// import stripe controller
const stripeService = require("../service/stripeService");

// Start multer
var multer = require('multer');

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        let filename = Date.now() + file.originalname;
        req.session.savedProfileFileName = filename;
        cb(null, filename);
    }
})
let upload = multer({ storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } }).single('profileImage');
// end multer

router.route('/')
    .patch(async function(req, res) {
        updateUser(req, res);
    })
    .post(async function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        let user = "";
        let insertResult = false;

        if(req.body._method && req.body._method == "PATCH") {
            updateUser(req, res);
        }
        else {
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

                    user = User.createUser(email, username, '/assets/uploads/profile/profile-default.png', false, req.body.firstName, req.body.lastName, hashedPassword, 0, subscriptionActive,
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
    
                                const mailOptions = {
                                    from: process.env.EMAIL_FROM, // sender address
                                    to: req.body.userEmail,
                                    subject: "Verify your email", // Subject line
                                    html: "<p>Hello, we hope this email finds you well!</p>"
                                        + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                                        + "Complete the process by <strong><a href='http://codingcoach.net/verifyEmail/" + req.body.userEmail + "/" + insertResult + "'>clicking this link!</a></strong></p>"
                                        + "<p>Carpe Diem!</p>"
                                        + "<p>The Coding Coach Team</p>", // plain text body
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
    }
);

async function updateUser (req, res) {
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
                req.session.user = user;

                res.redirect(303, "/auth");
            })




        });
    }
    else {
        res.redirect(303, "/userError");
    }
}


// verify email existence
router.route('/revalidate/:email')
    .get(async function(req, res) {
        // check to see that user is logged in with matching email address
        if(req.session.user.email && req.params.email === req.session.user.email) {
            let newToken = await userService.reValidateEmail(req.session.user.email);

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

                const mailOptions = {
                    from: process.env.EMAIL_FROM, // sender address
                    to: req.session.user.email,
                    subject: "Verify your email", // Subject line
                    html: "<p>Hello, we hope this email finds you well!</p>"
                        + "<p>Thank you for taking a moment to verify your email. Doing so helps us ensure we maintain as spam free a community."
                        + "Complete the process by <strong><a href='http://codingcoach.net/verifyEmail/" + req.session.user.email + "/" + newToken + "'>clicking this link!</a></strong></p>"
                        + "<p>Carpe Diem!</p>"
                        + "<p>The Coding Coach Team</p>", // plain text body
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
);

// verify email existence
router.route('/verify/:email')
    .get(function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        var email = req.params.email;
        userService.verifyEmail(email).then((valid) => {

            res.setHeader('Content-Type', 'application/json');
            res.send(valid);
        });

    }
);

// verify username existence
router.route('/verifyUsername/:username')
    .get(function(req, res) {
        res.setHeader('Content-Type', 'text/html');
        var username = req.params.username;
        userService.verifyUsername(username).then((valid) => {

            res.setHeader('Content-Type', 'application/json');
            res.send(valid);
        });

    }
);


// Get user data by email address
router.route('/:email')
    .get((req, res) => {

        res.setHeader('Content-Type', 'text/html');
        var email = req.params.email;

        userService.getUserByEmail(email).then((user) => {

            res.setHeader('Content-Type', 'application/json');
            res.send(user);
        });


    }
);


router.post('/uploadProfilePicture', (req, res) => {
    if(req.session.uploadMessage) {
        req.session.uploadMessage = undefined;
    }
    //call multer upload function defined near top
    upload(req, res, (err) => {
        if(err) {
            console.log("Error uploading profile picture : " + err);
            req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
            res.redirect(303, '/auth');
        }
        else {
            // save image            
            userService.updateProfileFilename(req.session.user.email, baseProfileUrl + req.session.savedProfileFileName).then((rValue) => {
                // if we get a valid return value it is the file we should delete
                if(rValue) {
                    // don't delete the default pic!
                    //console.log("[FIX-DEBUG]: comparing default profile images as to not delete it, these should match! : " + rValue + " and /assets/uploads/profile/profile-default.png");
                    if(rValue != '/assets/uploads/profile/profile-default.png') {
                        // Delete the old file asynchronously
                        fs.unlink(UPLOAD_PATH_BASE + rValue, (err) => {
                            console.log("file delete error status: " + err);
                        });
                    }
                }
                res.redirect(303, '/auth');
            })

            
        }  
    })
});


router.route('/')
module.exports = router;