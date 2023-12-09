/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
const router = express.Router();

const fs = require( 'fs' );
const path = require( 'path' );
const { Readable } = require( 'stream' );
const { finished } = require( 'stream/promises' );

const fileUpload = require( "express-fileupload" );


// imports
const aiController = require( '../../controller/apis/aiController' ); 
const userController = require( '../../controller/userController' );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );


// set up file paths for user profile images
const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
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



// the suggestion route
router.route( '/suggest' )
    .post( function( req, res ) {
        aiController.callOpenAI( req, res );
    }
    );

router.route( '/generateAvatar' )
    .post( async function( req, res ) {
        console.log( 'generateAvatar route' );

        let user = null;
        if ( req.user ) {
            user = req.user;
        }
        else if ( req.session.authUser ) {
            user = req.session.authUser;
        }

        console.log( 'user: ' + JSON.stringify( user ) );
        console.log( 'req.user: ' + JSON.stringify( req.user ) );
    
        let fileUrl = await aiController.generateAvatar( req, res );
        
        if( fileUrl ){

            // files included
            const timeStamp = Date.now();
            
            const fileName = timeStamp + user.username + '.png';
            const fullFilePath = imageUploadPath + fileName;

            const stream = await fs.createWriteStream( fullFilePath );
            const { body } = await fetch( fileUrl );
            await finished( Readable.fromWeb( body ).pipe( stream ) );

            // save the file to the user profile
            await userController.saveProfileImage( req, res, user.email, fileName );

            console.log( "about to return!!!" );
    
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Image generated and saved to user profile" );
            res.status( 200 ).json( {fileUrl: fileUrl} );
            return;
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Image Generation Failed", "Image Generation Failed" );
            res.set( "x-agora-message-title", "Image not Generated" );
            res.set( "x-agora-message-detail", "The image was not generated or saved" );
            res.status( 404 ).json( message );
            return;
        }
    }
    );

module.exports = router;
