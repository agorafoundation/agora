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
 
 
router.route( '/resource/completed' )
    .post( async ( req, res ) => {
        resourceController.saveCompletedResource( req, res );
    }
);
 
 
module.exports = router;