/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();
 
const bodyParser = require( 'body-parser' );
const session = require( 'express-session' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );
 



// Middleware to verify both that the user is logged in and that they have access to the 
// admin dashboard
router.use( function ( req, res, next ) {
    if( !req.session.authUser ) {
        // user is not signed in
        res.redirect( 303, '/signIn' );
    }
    else if( req.session.authUser.roles.filter( role => role.roleName === "Creator" ).length <= 0 
        && req.session.authUser.roles.filter( role => role.roleName === "Administrator" ).length <=0 ) {
        // user does not have an appropriate role
        // TODO: is community the best place? for now it works
        res.redirect( 303, '/community' );
    }
    else {
        next();
    }
    
} );

router.route( '/' )
    .get( async function ( req, res ) {

        
        
        
        res.render( './admin/adminDashboard' );
      
    }
    );



/**
 * Admin Workspace Routes
 */
//let adminWorkspaceRoutes = require('./adminWorkspaceRoutes')
//router.use('/workspace', adminWorkspaceRoutes);

/**
 * Admin Topic Routes
 */
let adminTopicRoutes = require( './adminTopicRoutes' );
router.use( '/topic', adminTopicRoutes );

/**
 * Admin Topic Routes
 */
let adminResourceRoutes = require( './adminResourceRoutes' );
router.use( '/resource', adminResourceRoutes );


module.exports = router;