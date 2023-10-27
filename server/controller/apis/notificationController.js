/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


const friendService = require('../../service/friendService');

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// Get the count of unread friend requests for a user
exports.getUnreadFriendRequestCount = async (req, res) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ) {
        let count = await friendService.getUnreadFriendRequestCount( authUserID );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Count received" );
        res.status( 200 ).json( count );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "No count found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No count found" );
        res.status( 400 ).json( message );
    }
};

// Get the details of unread friend requests for a user
exports.getUnreadFriendRequests = async (req, res) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ) {
        let requests = await friendService.getUnreadFriendRequests( authUserID );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Requests received" );
        res.status( 200 ).json( requests );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "No requests found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "No requests found" );
        res.status( 400 ).json( message );
    }
};

