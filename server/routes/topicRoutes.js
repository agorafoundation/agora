/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );


router.route( '/' )
    .get( ( req, res ) => {
        res.render( 'dashboard/partials/topic/topic-view' );
    }
    );  


module.exports = router;