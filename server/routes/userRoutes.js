/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const express = require( 'express' );
const router = express.Router( );
const fs = require( 'fs' );
const path = require( 'path' );
const fileUpload = require( "express-fileupload" );
const rateLimit = require('express-rate-limit');

// controllers
const userController = require( '../controller/userController' );

// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const IMAGE_PATH = process.env.AVATAR_IMAGE_PATH;

// image file path
const imageUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + IMAGE_PATH;

// set the max image size
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;

// setup fileupload (works with enctype="multipart/form-data" encoding in request)
router.use(
    fileUpload()
);

const googleAuthLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 logon attempts per windowMs
    message: "Too many logons from this IP, please try again after 15 minutes"
});

router.route( '/google' )
    .post(googleAuthLimiter, async function( req, res ) {
        userController.googleSignUp( req, res );
    } );

router.route( '/' )
    .patch( async function( req, res ) {
        userController.updateUser( req, res );
    } )

    .post( async function( req, res ) {

        // check to see if this is an update
        if( req.body._method && req.body._method == "PATCH" ) {
            // update the user 
            userController.updateUser( req, res );

        }
        else {
            // save the user
            userController.createUserForm( req, res );

        }
    }
    );

// verify email existence
router.route( '/revalidate/:email' )
    .get( async function( req, res ) {
        userController.reValidateEmail( req, res );
    }
    );

// Configure the rate limiter
const uploadProfilePictureLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 15 minutes"
});

// Apply the rate limiter to the upload route
router.route('/uploadProfilePicture')
    .post(uploadProfilePictureLimiter, async ( req, res ) => {


        if ( !req.files || Object.keys( req.files ).length === 0 ) {
            // no files uploaded
            await userController.saveProfileImage( req, res, req.session.authUser.email, 'profile-default.png' );

        }
        else {

            // files included
            const file = req.files.profileImage;
            const timeStamp = Date.now();

            // check the file size
            if( file.size > maxSize ) {
                console.log( `Profile File ${file.name} size limit has been exceeded` );

                req.session.messageType = "warn";
                req.session.messageTitle = "Image too large!";
                req.session.messageBody = "Image size was larger then " + maxSizeText + ", please use a smaller file.";
                res.redirect( 303, '/profile/manageProfile' );
            }
            else {
                // Function to sanitize file extension
                function getSanitizedExtension(filename) {
                    let parts = filename.split('.');
                    let extension = parts.pop(); // Get the last part after the dot
                    return extension.replace(/[^a-z0-9]/gi, ''); // Remove anything that is not alphanumeric
                }

                // When handling the file upload
                const sanitizedExtension = getSanitizedExtension(file.name);
                const safeFileName = `${timeStamp}.${sanitizedExtension}`;
                const fullPath = `${imageUploadPath}/${safeFileName}`;

                await file.mv( fullPath, async ( err ) => {
                    if ( err ) {
                        console.log( "Error uploading profile picture : " + err );
                        req.session.messageType = "error";
                        req.session.messageTitle = "Error uploading image!";
                        req.session.messageBody = "There was a error uploading your image for this profile.";
                        res.redirect( 303, '/profile/manageProfile' );
                        return;
                    }
                    else {
                        await userController.saveProfileImage( req, res, req.session.authUser.email, safeFileName );
                        req.session.messageType = "success";
                        req.session.messageTitle = "Image Saved";
                        req.session.messageBody = "Profile image saved successfully!";

                        res.redirect( 303, '/profile/manageProfile' );
                    }
                } );
            }
        }
    }
    );



module.exports = router;