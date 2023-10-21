/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies
const fs = require( 'fs' );
let path = require( 'path' );

// import models
const User = require( '../../model/user' );

// import controllers
const { errorController } = require( "./apiErrorController" );

// import util Models
const ApiMessage = require( '../../model/util/ApiMessage' );

// import services
const friendService = require( '../../service/friendService' );
const userService = require( '../../service/userService' );

//Returns all friends of a user.
exports.getAllFriends = async ( req, res ) => {
    let friends = await friendService.getAllFriends( req.user.userID );
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all Friends" );
    res.status( 200 ).json( friends );
};

//Get a specific friend, by their ID.
exports.getFriendByID = async ( req, res ) => {


    let authUserID;
    if( req.user ) {
        authUserID = req.user.userId;
    }
    else if( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if( authUserID ) {
        let friend = await friendService.getFriendByID( req.params.userID, authUserID );
        if ( friend ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Returned friend by id" );
            res.status( 200 ).json( friend );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "Friend not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Friend not found" );
            res.status( 400 ).json( message );
        }
    }
};

//Sends a friend request.
exports.sendFriendRequest = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
        //Checks if user exists.
        let friendUsername = userService.verifyUsername( req.params.username );
        if ( friendUsername ) {
            let request = friendService.sendFriendRequest( authUserID, friendUsername );
            if ( request ) {
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Friend Request Sent" );
                res.status( 201 ).json( "Success" );
            }
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "User not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "User not found" );
            res.status( 400 ).json( message );
        }
    }
};

//Accepts the a friend request.
exports.acceptFriendRequest = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ) {
        let success = friendService.acceptFriendRequest( authUserID );
        if ( success ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Friend Request Accepted" );
            res.status( 201 ).json( "Success" );
        }
    }
};

//Rejects a friend request.
exports.rejectFriendRequest = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ) {
        let success = friendService.denyFriendRequest( authUserID );
        if ( success ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Friend Request Rejected" );
            res.status( 201 ).json( "Success" );
        }
    }
};

//Deletes a friend.
exports.deleteFriendByID = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ) {
        let success = await friendService.deleteFriendByID( req.params.userID, authUserID );
        if ( success ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Removed friend" );
            res.status( 200 ).json( "Success" );
        }
        else {
            const message = ApiMessage.createApiMessage( 404, "Not Found", "Friend not found" );
            res.set( "x-agora-message-title", "Not Found" );
            res.set( "x-agora-message-detail", "Friend not found" );
            res.status( 400 ).json( message );
        }
    }
};

// Get all friend requests sent to a user
exports.getAllFriendRequests = async ( req, res ) => {
    const userID = req.user.userID; // Assuming you have the user's ID
    const requests = await friendService.getAllFriendRequests( userID );
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all Friend Requests" );
    res.status( 200 ).json( requests );
};