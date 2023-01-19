/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


var express = require( 'express' );
var router = express.Router( );

const searchController = require( '../../controller/apis/searchController' ); 
const { validate } = require( '../middleware/inputValidation' );
const { z } = require( 'zod' );

// api/v1/auth/search
router.route( "/" )
    .get( async ( req, res ) => {
        searchController.getSearchResult( req, res );
    } );

module.exports = router;
