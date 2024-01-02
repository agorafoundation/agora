/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

const userService = require( '../service/userService' );

/**
 * Pre Route
 * Check that the user is logged in (required!)
 */
router.use( function ( req, res, next ) {
    //console.log( "req.query.redirect: " + req.query.redirect );
    //console.log( "dashboard user: " + req.session.authUser );
    if( !req.session.authUser ) {
        
        //console.log( "auth user invalid" );
        if( req.query.redirect ) {
            //console.log( "redirecting to: " + req.query.redirect );
            res.locals.redirect = req.query.redirect;
        } 

        res.render( 'user-signup' );
    }
    else {
        next( );
    }
} );

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
        res.render( 'dashboard/partials/topic/topic-view', {firstVisit: editorFirstVisit} );
    }
    );  


module.exports = router;