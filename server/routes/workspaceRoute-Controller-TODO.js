/**
 * This file is a massive TODO 
 * This was all the logic originally in Coding Coach's workspaceRoutes.js
 * It handled all of the routing and controller code (was not broken out)
 * for the workspace lesson process.  Now workspaces are stand alone and make just 
 * represent an organizational structure. The "enrollment" process will
 * have to be re-thoughtout as part of the merger with Agora, at which
 * time I should revisit this code.
 * 
 * One of the first questions should be to determine if this is actually an
 * API router / controller or a page router / controller or some combination
 * thereof. I think this will be more clear once the actual workspace, toic and
 * resource API routes and controllers are built out.
 */

/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require( 'express' );
var router = express.Router();


// require services
const workspaceService = require( '../../service/workspaceService' );
const userService = require( '../../service/userService' );

const bodyParser = require( 'body-parser' );
router.use( bodyParser.urlencoded( {
    extended: true
} ) );
router.use( bodyParser.json() );


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

/**
 * Route called from the mark workspace complete form
 */
router.route( '/' )
    .post( async ( req, res ) => {
        let workspaceId = req.body.workspaceId;
        let workspaceRid = await workspaceService.getMostRecentWorkspaceById( workspaceId );

        let workspaceVersion = req.body.workspaceVersion;

        if( req.session && req.session.authUser && workspaceRid && workspaceVersion ) {
            // verify that the user is enrolled in the workspace and that the workspaces topics are complete
            let userWorkspace = await workspaceService.getEnrolledWorkspaceByUserAndWorkspaceRid( req.session.authuser.userId, workspaceRid.rid );

            if( userWorkspace ) {
                await workspaceService.completeWorkspaceEnrollment( req.session.authuser.userId, workspaceRid.rid );

                // reset the session
                const rUser = await userService.setUserSession( req.session.authUser.email );

                req.session.authUser = null;
                req.session.authUser = rUser;
            }
        }
        // send them to the course
        res.redirect( '/community/workspace/' + workspaceId );
        if( req.session.messageTitle ) delete req.session.messageTitle;
        if( req.session.messageBody ) delete req.session.messageBody;
        req.session.save();
    }
    );

router.route( '/:workspaceId' )
    .get( async ( req, res ) => {
        
        // get the workspace data
        let workspaceId = req.params.workspaceId;
        let workspace = await workspaceService.getActiveWorkspaceWithTopicsById( workspaceId, true );
        //console.log("workspace: " + JSON.stringify(workspace));
        
        res.render( 'community/workspace', { user: req.session.authUser, workspace: workspace, message:req.session.messageTitle, message2:req.session.messageBody } );
        if( req.session.messageTitle ) delete req.session.messageTitle;
        if( req.session.messageBody ) delete req.session.messageBody;
        req.session.save();
    }
    );



router.route( '/enroll/:workspaceId' )
    .get( async ( req, res ) => {
        let workspaceId = req.params.workspaceId;
        if( req.session.authUser ) {

            // save the enrollment for the user in the workspace
            await workspaceService.saveWorkspaceEnrollmentMostRecentWorkspaceVersion( req.session.authuser.userId, workspaceId );

            // reset the session
            const rUser = await userService.setUserSession( req.session.authUser.email );

            req.session.authUser = null;
            req.session.authUser = rUser;

            // send them to the course
            res.redirect( '/community/workspace/' + workspaceId );
            
        }
        else {
            res.render( 'user-signup' );
        }
    }
    );



module.exports = router;
