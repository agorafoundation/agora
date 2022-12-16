/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );


router.route( '/' )
    .get( ( req, res ) => {
        res.render( 'dashboard/partials/topic/topic-view.ejs' );
    }
    );  


module.exports = router;