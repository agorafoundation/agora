/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );
const rateLimit = require('express-rate-limit');
 
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

const resourcesLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 50, // Limit each IP to 50 upload attempts per windowMs
    message: "Too many uploads from this IP, please try again after 15 minutes"
});

// resources /api/v1/auth/resources/
router.route( '/' )
    .get( async function ( req, res ) {
        resourceController.getAllVisibleResources( req, res );
    } )    
    .post(resourcesLimiter, ( req, res ) => { 
        resourceController.saveResource( req, res );
    }
    );

/**
 * Returns all active resources owned by the user
 */
router.route( '/user/:id' )
    .get( async ( req, res ) => {
        resourceController.getAllActiveResourcesForUser( req, res );
    }
    );

router.route( '/shared' )
    .get( async ( req, res ) => {
        resourceController.getAllSharedResourcesForUser( req, res );
    } );

// resources /api/v1/auth/resources/:resourceId
router.route( '/:resourceId' )
    .get( async function ( req, res ) {
        resourceController.getResourceById( req, res );
    
    } )
    .delete( async ( req, res ) => {
        resourceController.deleteResourceById( req, res );
    }
    );



 
router.route( '/resource/completed' )
    .post( async ( req, res ) => {
        resourceController.saveCompletedResource( req, res );
    }
    );
 
 
module.exports = router;