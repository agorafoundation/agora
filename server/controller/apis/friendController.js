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
const productService = require ( '../../service/productService' );
const notificationService = require( '../../service/notificationService' );

//Returns all friends of a user.
exports.getAllFriends = async ( req, res ) => {
    let authUserID;
    if ( req.user ){
        authUserID = req.user.userId;
    }
    else if( req.session.authUser ){
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ){
        let friends = await friendService.getAllFriends( req.user.userId );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all Friends" );
        res.status( 200 ).json( friends );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "Friends not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Friends not found" );
        res.status( 400 ).json( message );
    }
};

exports.getResources = async ( req, res ) => {
    let authUserID;
    if ( req.user ){
        authUserID = req.user.userId;
    }
    else if( req.session.authUser ){
        authUserID = req.session.authUser.userId;
    }
    if( authUserID ){
        let resources = [ ];
        let friends = await friendService.getAllFriends( req.user.userID );
        let requests = await friendService.getUnreadFriendRequests( req.user.userId );
        resources.push(req.user, friends, requests);
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all user details" );
        res.status( 200 ).json( resources );
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "User details not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "User details not found" );
        res.status( 400 ).json( message );
    }
}

/*
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
*/

//Sends a friend request.
exports.sendFriendRequest = async ( req, res ) => {
    let authUserID;
    if ( req.user ) {
        authUserID = req.user.userId;
    }
    else if ( req.session.authUser ) {
        authUserID = req.session.authUser.userId;
    }
    //Checks if user exists.
    let friendUsername = userService.verifyUsername( req.body.username );
    if ( friendUsername ) {
        let friend = await userService.getUserByUsername( req.body.username );
        let request = friendService.sendFriendRequest( authUserID, friend[0].userId );
        if ( request ) {
            res.set( "x-agora-message-title", "Success" );
            res.set( "x-agora-message-detail", "Friend Request Sent" );
            res.status( 201 ).json( "Success" );

            // Add a Notification after a user 
            const message = "You have received a new friend request from " + req.user.username;  
            await notificationService.addNotification( friendUsername, message );
        }
    }
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "User not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "User not found" );
        res.status( 400 ).json( message );
    }
};

//Sends a friend request.
exports.acceptFriendRequest = async ( req, res ) => {
    let request = friendService.acceptFriendRequest( req.body.friendship_id );
    if ( request ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Friend Request Accepted" );
        res.status( 201 ).json( "Success" );
    }
    
    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "User not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "User not found" );
        res.status( 400 ).json( message );
    }
};

//Sends a friend request.
exports.denyFriendRequest = async ( req, res ) => {

    let request = friendService.denyFriendRequest( req.body.friendship_id );
    if ( request ) {
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Friend Request Denied" );
        res.status( 201 ).json( "Success" );
    }

    else {
        const message = ApiMessage.createApiMessage( 404, "Not Found", "User not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "User not found" );
        res.status( 400 ).json( message );
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
        let success = friendService.rejectFriendRequest( authUserID );
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

exports.getUnacceptedFriendRequests = async ( req, res ) => {
    let authUserID;
    if ( req.user ){
        authUserID = req.user.userId;
    }
    else if( req.session.authUser ){
        authUserID = req.session.authUser.userId;
    }
    if ( authUserID ){
        let friends = await friendService.getUnacceptedFriendRequests( req.user.userId );
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned all non friends" );
        res.status( 200 ).json( friends );
    }
    else {
        const message = ApiMessage.getUnacceptedFriendRequests( 404, "Not Found", "Non friends not found" );
        res.set( "x-agora-message-title", "Not Found" );
        res.set( "x-agora-message-detail", "Non friends not found" );
        res.status( 400 ).json( message );
    }
};

exports.getAddFriends = async function ( req, res ) {

    if( req.session.authUser ) {

        const authUser = await userService.setUserSession( req.session.authUser.email );
        req.session.authUser = null;
        req.session.authUser = authUser;
        res.locals.authUser = req.session.authUser;

        const userFriends = await friendService.getAllFriends( req.session.authUser.userId );
        
        res.render( './add-friends/add-friends', { user: authUser, friends: userFriends} );
        
    }
    else {
        res.redirect( 303, '/signIn' );
    }
};

exports.getFriends = async function ( req, res ) {

    if( req.session.authUser ) {

        const authUser = await userService.setUserSession( req.session.authUser.email );
        req.session.authUser = null;
        req.session.authUser = authUser;
        res.locals.authUser = req.session.authUser;

        const userFriends = await friendService.getAllFriends( req.session.authUser.userId );

        res.render( './friends/friends', { user: authUser, friends: userFriends} );
        
    }
    else {
        res.redirect( 303, '/signIn' );
    }
};


// Get the count of unread friend requests for a user
exports.getUnreadFriendRequestCount = async ( req, res ) => {
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
exports.getUnreadFriendRequests = async ( req, res ) => {
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

/*
// Get all friend requests sent to a user
exports.getAllFriendRequests = async ( req, res ) => {
    const userID = req.user.userID; // Assuming you have the user's ID
    const requests = await friendService.getAllFriendRequests( userID );
    res.set( "x-agora-message-title", "Success" );
    res.set( "x-agora-message-detail", "Returned all Friend Requests" );
    res.status( 200 ).json( requests );
};
*/