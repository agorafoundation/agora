/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

// dependencies
//const fs = require( 'fs' );
//let path = require( 'path' );

// setup json body parser
const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );

// controllers
const dashboardController = require( '../controller/dashboardController' );

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

/**
 * Show main dashboard route
 */
router.route( '/' )
    .get( ( req, res ) => {
        //res.render( 'dashboard-shared/dashboard-shared' );
        dashboardController.getSharedDashboard( req, res );
    }
    );

module.exports = router;