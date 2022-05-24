/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router( );

//dependencies 
 
// controllers
const dashboardController = require( '../controller/dashboardController' );
const goalController = require( '../controller/apis/goalController' );

// pre route
// check that the user is logged in!
router.use(function ( req, res, next ) {
    if( !req.session.authUser ) {
        if( req.query.redirect ) {
             res.locals.redirect = req.query.redirect;
        }
        res.render( 'user-signup' );
    }
    else {
        next( );
    }
     
})

/**
 * Show user profile
 */
router.route( '/' )
    .get( ( req, res ) => {
        dashboardController.getDashboard( req, res );
    }
);

router.route( '/goal' )
    .post( ( req, res ) => {
        console.log( "arrived at the /dashboard/goal post route" );
        let goal = goalController.saveGoal( req, res, true );
        console.log( "retuned goal: " + goal );

        // reload dashboard?
        dashboardController.getDashboard( req, res );
    }
);





module.exports = router;