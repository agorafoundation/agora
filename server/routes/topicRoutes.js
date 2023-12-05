/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

const userService = require( '../service/userService' );


router.route( '/' )
    .get( ( req, res ) => {
        // get the status of the users first editor visit
        let editorFirstVisit = req.session.authUser.editorFirstVisit;

        if( editorFirstVisit ) {
            // set the users flag to false so they don't see this again
            let user = req.session.authUser;
            user.editorFirstVisit = false;
            userService.saveUser( user );
        }
        console.log( " this is a test of topic " );
        res.render( 'dashboard/partials/topic/topic-view', {firstVisit: editorFirstVisit} );
    }
    );  


module.exports = router;