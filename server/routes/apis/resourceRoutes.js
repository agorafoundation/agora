/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
 */

const express = require( 'express' );
const router = express.Router( );

const fs = require( 'fs' );
let path = require( 'path' );

// setup fileupload (works with enctype="multipart/form-data" encoding in request)
const fileUpload = require( "express-fileupload" );
router.use(
    fileUpload()
);

const UPLOAD_PATH_BASE = path.resolve( __dirname, '..', '../../client' );
const FRONT_END = process.env.FRONT_END_NAME;
const RESOURCE_PATH = process.env.RESOURCE_IMAGE_PATH;

// resource file path
const resourceUploadPath = UPLOAD_PATH_BASE + "/" + FRONT_END + RESOURCE_PATH;

// set the max image size for avatars and resource, topic and workspace icons
const maxSize = process.env.IMAGE_UPLOAD_MAX_SIZE;
const maxSizeText = process.env.IMAGE_UPLOAD_MAX_SIZE_FRIENDLY_TEXT;


// import controllers
const resourceController = require( '../../controller/apis/resourceController' );



/*
 * Resources can be requested the following ways
 * / <- all visible resources for the auth user (all resources a user can see, owned, shared with user, or set to public visibility)
 * /user <- all resources for the user (does not include additional shared or visible ones)
 * /shared <- all resources that are shared with the user but not their own
 * /visible <- all resources that are publicly visible
 * /sharedAndVisible <- all resources that are shared or visible to the user but are not their own
 */

// resources /api/v1/auth/resources/
router.route( '/' )
    .get( async function ( req, res ) {
        await resourceController.getAllVisibleResources( req, res );
    } )
    .post( async function ( req, res ) {

        let filename = "";

        if ( !req.files || Object.keys( req.files ).length === 0 ) {
            console.log( "no files were uploaded" );
        }
        else {
            const file = req.files.files;
            const timeStamp = Date.now();
            // check the file size
            //console.log( JSON.stringify( file.size ) );
            if( file.size > maxSize ) {
                console.log( `File ${file.name} size limit has been exceeded for resource` );



            }
            else {
                filename = timeStamp + file.name;
                await file.mv( resourceUploadPath + filename, async ( err ) => {
                    if ( err ) {
                        console.log( "Error uploading profile picture : " + err );

                    }
                    else {
                        //await resourceController.saveResourceImage( req, res, resource.resourceId, timeStamp + file.name );
                    }
                } );
            }
        }

        await resourceController.saveResource( req, res, filename );



    }
    );

/**
 * Returns all active resources owned by the user
 */
router.route( '/user/:id' )
    .get( async ( req, res ) => {
        await resourceController.getAllActiveResourcesForUser( req, res );
    }
    );

router.route( '/shared' )
    .get( async ( req, res ) => {
        await resourceController.getAllSharedResourcesForUser( req, res );
    } );

// resources /api/v1/auth/resources/:resourceId
router.route( '/:resourceId' )
    .get( async function ( req, res ) {
        await resourceController.getResourceById( req, res );

    } )
    .delete( async ( req, res ) => {
        await resourceController.deleteResourceById( req, res );
    }
    );




router.route( '/resource/completed' )
    .post( async ( req, res ) => {
        await resourceController.saveCompletedResource( req, res );
    }
    );

router.route(  '/image/:imageName' )
    .get( async ( req, res ) => {
        await resourceController.getResourceImage( req, res );
    }
    );

router.route(  '/exists/:fileName' )
    .get( async ( req, res ) => {
        await resourceController.checkResourceExists( req, res );
    }
    );


module.exports = router;
