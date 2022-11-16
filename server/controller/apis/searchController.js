/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


const searchService = require( "../../service/searchService" );
const ApiMessage = require( "../../model/util/ApiMessage" );
const {errorController} = require( "./apiErrorController" );
 
exports.getSearchResult = async ( req, res ) => {

    const results = await searchService.getSearchResults( req.query.q, req.user.id );

    if( !results ) {
        return errorController( ApiMessage.createNotFoundError( "Search Results" ), res );
    }

    return res.status( 200 ).json( results );
};