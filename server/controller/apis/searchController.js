/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


const searchService = require( "../../service/searchService" );
const ApiMessage = require( "../../model/util/ApiMessage" );
const {errorController} = require( "./apiErrorController" );
 
exports.getSearchResult = async ( req, res ) => {

    const type = req.query.type ?? "all";

    if( type !== "all" && type !== "users" && type !== "resources" && type !== "topics" && type !== "workspaces" ) {
        return errorController( ApiMessage.createBadRequestError( [ "Invalid search type" ] ), res );
    }

    const results = await searchService.getSearchResults( req.query.q, req.user.userId, type );

    if( !results ) {
        return errorController( ApiMessage.createNotFoundError( "Search Results" ), res );
    }

    return res.status( 200 ).json( results );
};