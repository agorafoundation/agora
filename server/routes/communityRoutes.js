/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );
 
// controllers
const communityController = require( '../controller/communityController' );


// pre check route
// check that the user is logged in!
router.use( function ( req, res, next ) {
    if( !req.session.authUser ) {
        if( req.query.redirect ) {
            res.locals.redirect = req.query.redirect;
        }
        res.render( 'user-signup' );
    }
    else {
        next();
    }
    
} );

router.route( '/' )
    .get( async function ( req, res ) {
        communityController.getCommunityDashboard( req, res );
    }
    );

router.route( '/welcome' )
    .get( ( req, res ) => {
        res.render( 'user-welcome' );
    }
    );

router.route( '/manage' )
    .get( ( req, res ) => {
        res.render( 'user-manage' );
    }
    );

router.route( '/error' )
    .get( ( req, res ) => {
        res.render( 'user-error' );
    }
    );

router.route( '/purchase' )
    .get( async ( req, res ) => {
        communityController.joinPage( req, res );
    }
    );


module.exports = router;