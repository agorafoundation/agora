/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies

// services
const workspaceService = require( '../service/workspaceService' );
const eventService = require( '../service/eventService' );
const productService = require ( '../service/productService' );

exports.getCommunityDashboard = async ( req, res ) => {

    res.setHeader( 'Content-Type', 'text/html; charset=utf-8' );

    // get all the current workspaces and topics to display
    const availableWorkspaces = await workspaceService.getAllVisibleWorkspacesWithTopics( req.session.authUser.userId );

    // get the events feed
    const feed = await eventService.communityEventFeed( 10 );

    res.render( 'community/community', {user: req.session.authUser, availableWorkspaces: availableWorkspaces, feed: feed} );
};

exports.joinPage = async ( req, res ) => {
    if( req.session.authUser ) {
        let user = req.session.authUser;
        
        // get products to send to page (founders membership and tokens)
        const products = await productService.getAllActviteTokenAndMembershipProductsWithImages( );

        // user does not currently have membership or tokens, redirct to join
        res.render( 'community/join', { products: products, user:user } );
    }
    else {
        // get products to send to page (founders membership and tokens)
        const products = await productService.getAllActviteTokenAndMembershipProductsWithImages( );

        // user does not currently have membership or tokens, redirct to join
        res.render( 'community/join', { products: products } );
    }
};