/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();
const rateLimit = require('express-rate-limit');

// import util Models
const ApiMessage = require( '../model/util/ApiMessage' );

// import controllers
const authController = require( '../controller/authController' );

// check that the user is logged in!
// Currently by being here all APIs should require an authenicated user to work
const authCheckLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minutes
    max: 125, // Limit each IP to 125 auth chechs per windowMs
    message: "Too many auth checks from this IP, please try again after 1 minutes"
});

router.use(authCheckLimiter, function ( req, res, next ) {
    // This is the case if using UI.
    const authTest = req.session.isAuth;
    if( authTest ){
        // TODO: phase out session authUser, instead using req.user
        // both are still defined for now
        req.user = req.session.authUser;
        next();
        return;
    }

    const authHeader = req.headers.authorization;
    if( !authHeader ){
        // authentication token missing
        console.log( 'unauth' );
        const message = ApiMessage.createApiMessage( 401, "Unauthorized", "API requires authentication" );
        res.set( "x-agora-message-title", "Unauthorized" );
        res.set( "x-agora-message-detail", "API requires authentication" );
        res.status( 401 ).json( message );
        
        
        //next( 'Authentication not provided!' );

    }
    else {
        // we have a auth token, get the username and password from it.
        const auth = new Buffer.from( req.headers.authorization.split( " " )[1], 'base64' ).toString().split( ':' );
        const userEmail = auth[0];
        const password = auth[1];

        // verify the credentials are valid
        authController.basicAuth( userEmail, password, req ).then( ( user ) => {
            if ( user ) {
                // user is authorized!
                req.user = user;

                // Hook the send function so that we can append the user to the body
                res.hooks.on( 'send', ( args ) => {
                    let responseJson = JSON.parse( args );

                    // authenticated user object - add anything you need here
                    let authUser = { 
                        userId: user['userId'], 
                        firstName: user['firstName'], 
                        lastName: user['lastName'], 
                        email: user['email'] 
                    };

                    responseJson['authUser'] = authUser;

                    args[0] = JSON.stringify( responseJson ); // need to stringify it because args wants a string. Otherwise it sends [object Object]
                } );

                // TODO future role specific verification can go here.

                // Middleware complete back to called route.
                
                next( );

            }
            else {
                res.set( "x-agora-message-title", "Unauthorized" );
                res.set( "x-agora-message-detail", "API requires authentication" );
                res.status( 401 );
                next( 'Authentication Failed!' );
            }
        } );
    }



    /**
     * Old auth mechanism that relied on server session (stateful)
     * Keeping around until Basic auth mechanism is inplace and tested
     * with browser and other clients
     
    if(!req.session.authUser) {
        // create the ApiMessage
        const apiRes = ApiMessage.createApiMessage( 401, "Unauthorized", "API requires authentication");
        
        res.set("x-agora-message-title", "Unauthorized");
        res.set("x-agora-message-detail", "API requires authentication");
        res.status(401).json(apiRes);
        //res.send();
    }
    else {
        next();
    }
    */

} );

/**
 * Tag APIs
 */
const tagRoutes = require( './apis/tagRoutes' );
router.use( '/tags', tagRoutes );

/**
 * Workspace APIs
 */
const workspaceRoutes = require( './apis/workspaceRoutes' );
router.use( '/workspaces', workspaceRoutes );

/**
 * Topic APIs
 */
const topicRoutes = require( './apis/topicRoutes' );
router.use( '/topics', topicRoutes );

/**
 * Resource APIs
 */
const resourceRoutes = require( './apis/resourceRoutes' );
router.use( '/resources', resourceRoutes );

/**
 * Shared Entity APIs
 */
const sharedEntityRoutes = require( './apis/sharedEntityRoutes' );
router.use( '/shared', sharedEntityRoutes );

/**
 * User APIs
 */
const userRoutes = require( './apis/userRoutes' );
router.use( '/user', userRoutes );

/**
 * Discussion APIs
 */
const discussionRoutes = require( './apis/discussionRoutes' );
router.use( '/discussions', discussionRoutes );

/**
 * Search APIs
 */
const searchRoutes = require( './apis/searchRoutes' );
router.use( '/search', searchRoutes );

/**
 * Stripe APIs
 */
const stripeRoutes = require( './apis/stripeRoutes' );
router.use( '/stripe', stripeRoutes );

module.exports = router;