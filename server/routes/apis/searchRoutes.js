/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


var express = require( 'express' );
var router = express.Router( );

const searchController = require( '../../controller/apis/searchController' ); 
const { validate } = require( '../middleware/inputValidation' );
const { z } = require( 'zod' );


router.route( "/search/:keyword" ).get( async ( req, res ) => {
    searchController.getSearchResult( req, res );
} );

