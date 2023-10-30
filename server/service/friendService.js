/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const User = require( "../model/user" );
const Event = require( '../model/event' );
const notificationService = require( '../service/notificationService' );
const userService = require( '../../server/service/userService' );
const { ormFriendship } = require( '../model/friendship' );
const { ormFriendshipRequest } = require( '../model/friendshipRequest' );

//SQL queries

// Get all friends of a user
exports.getAllFriends = async ( userID ) => {
    let text = `
        SELECT 
            u.first_name AS friend_first_name,
            u.last_name AS friend_last_name,
            u.username AS friend_username,
            u.email AS friend_email
        FROM agora.friendships AS f
        JOIN agora.users AS u ON u.user_id = CASE
            WHEN f.initiatedby_id = $1 THEN f.recipient_id
            ELSE f.initiatedby_id
        END
        WHERE (f.initiatedby_id = $1 OR f.recipient_id = $1)
            AND f.status = 'accepted'`;
    let values = [ userID ];
    let friends = [];

    try {
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ) {
            for ( let i = 0; i < res.rows.length; i++ ) {
                friends.push( ormFriendship( res.rows[i] ) );
            }
            return friends;
        }
        else {
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
    }
};

// Send a friend request
exports.sendFriendRequest = async ( requesterID, recipientID ) => {

    let text = `INSERT INTO friendship_requests (requester_id, recipient_id) 
    VALUES ($1, $2)
    RETURNING request_id`;
    let values = [ requesterID, recipientID ];

    try {
        let res = await db.query( text, values );

        if ( res.rows.length > 0 ){
            let requesterUsername = await userService.getActiveUserById( requesterID );
            await notificationService.addNotification( recipientID, "You have received a friend request from " + requesterUsername.username );
            return res.rows[0];
        }
        else{
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
    }
};

/*
// Get a specific friend by ID
exports.getFriendByID = async ( userID, friendID ) => {
    let text = `SELECT * 
    FROM friendships 
    WHERE (initiatedby_id = $1 AND recipient_id = $2) 
    OR (initiatedby_id = $2 AND recipient_id = $1)
    AND status = 'accepted'`;
    let values = [ userID, friendID ];
    try{
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ){
            return res.rows[0];
        }
        else{
            return false;
        }
    }
    catch ( e ){
        console.log( e.stack );
    }
    
};
*/
// Accept a friend request
exports.acceptFriendRequest = async ( requestID ) => {
    const request = await db.query(
        `SELECT * FROM friendship_requests WHERE request_id = $1`, 
        [ requestID ]
    );

    if ( request.rows.length > 0 ) {
        const requesterID = request.rows[0].requester_id;
        const recipientID = request.rows[0].recipient_id;

        // This will fetch the person reciving the friendrequest for notification
        const recipient = await db.query( `SELECT username FROM users WHERE user_id = $1`, [ recipientID ] );
        const recipientUsername = recipient.rows[0].username;
        
        // Insert into friendships table
        await db.query(
            `INSERT INTO friendships (initiatedby_id, recipient_id, friendship_status) 
             VALUES ($1, $2, 'accepted')`, 
            [ requesterID, recipientID ]
        );
        
        // Delete the request from friendship_requests table
        await db.query(
            `DELETE FROM friendship_requests WHERE request_id = $1`, 
            [ requestID ]
        );

        // Send a notification to the requester about the accepted friend request
        await notificationService.addNotification( requesterID, "Your friend request has been accepted by " + recipientUsername );
        return { success: true };
    }
    else {
        return { error: "Friend request not found." };
    }
};

// Deny a friend request
exports.rejectFriendRequest = async ( requestID ) => {
    const result = await db.query(
        `DELETE FROM friendship_requests WHERE request_id = $1`, 
        [ requestID ]
    );

    return ( result.rowCount > 0 ) ? { success: true } : { error: "Friend request not found." };
};

// Delete a friend by ID
exports.deleteFriendByID = async ( userID, friendID ) => {
    let text = `DELETE FROM friendships 
    WHERE (initiatedby_id = $1 AND recipient_id = $2) 
    OR (initiatedby_id = $2 AND recipient_id = $1)`;
    let values = [ userID, friendID ];

    try{
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ) {
            return "Friend removed";
        }
        else{
            return "Error: Friend not found";
        }
    }
    catch ( e ){
        console.log( e.stack );
    }
};

// Get details of unaccepted friend requests for a user
exports.getUnacceptedFriendRequests = async ( userID ) => {
    let text = `SELECT 
            u.first_name AS friend_first_name,
            u.last_name AS friend_last_name,
            u.username AS friend_username,
            u.email AS friend_email
        FROM friendships AS f
        JOIN users AS u ON u.user_id = CASE
            WHEN f.initiatedby_id = $1 THEN f.recipient_id
            ELSE f.initiatedby_id
        END
        WHERE f.recipient_id = $1
            AND f.status = 'pending'`; // Filter by pending status and recipient ID
    let values = [ userID ];
    let requests = [];
        
    try {
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ) {
            for ( let i = 0; i < res.rows.length; i++ ) {
                requests.push( ormFriendship( res.rows[i] ) );
            }
            return requests;
        }
        else {
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
    }
};


// Get details of unread friend requests for a user
exports.getUnreadFriendRequests = async ( userID ) => {
    let text = 'SELECT request_id, requester_id, recipient_id, request_time FROM friendship_requests WHERE recipient_id = $1 OR requester_id = $1 ORDER BY request_time DESC';
    let values = [ userID ];
    let requests = [];
    try{
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ) {
            for ( let i = 0; i < res.rows.length; i++ ) {
                requests.push( res.rows[i] );
            }
            return requests;
        }
        else{
            return false;
        }
    }
    catch ( e ){
        console.log( e.stack );
    }
    
};

