/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
const router = express.Router();

// imports
const aiController = require( '../../controller/apis/aiController' ); 

// the suggestion route
router.route( '/suggest' )
    .get( function( req, res ) {
        // TODO: call the function from the AI controller that calls OpenAI.
    }
    );

module.exports = router;
