/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );
 
// import controllers
const resourceController = require( '../../controller/apis/resourceController' );
 
/*
 * Resources can be requested the following ways
 * / <- all visible resources (all resources a user can see, owned, shared with user, or visible)
 * /user <- all resources for the user (does not include additional shared or visible ones)
 * /shared <- all resources that are shared with the user but not their own
 * /visible <- all resources that are visable to the user but not specifically shared with them or their own
 * /sharedAndVisible <- all resources that are shared or visible to the user but are not their own
 */ 

// resources /api/v1/auth/resources
router.route( '/' )
    .get(async function (req, res) {
        
    })    
    .post( ( req, res ) => { 
        resourceController.saveResource( req, res );
    }
)

// resources /api/v1/auth/resources/:id
router.route( '/:id' )
    .get(async function (req, res) {
        resourceController.getResourceById( req, res );
    
    }
);



 
router.route( '/resource/completed' )
    .post( async ( req, res ) => {
        resourceController.saveCompletedResource( req, res );
    }
);
 
 
module.exports = router;