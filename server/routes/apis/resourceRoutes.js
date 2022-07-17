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
 

// resources /api/v1/auth/resources
router.route( '/' )
    .get(async function (req, res) {
        resourceController.getAllResourcesForAuthUser( req, res );
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