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
const { ormFriendship } = require('../model/friendship');
const { ormFriendshipRequest } = require('../model/friendshipRequest');

//SQL queries

// Get all friends of a user
exports.getAllFriends = async ( userID ) => {

    let text = `SELECT CASE 
                        WHEN initiatedby_id = $1 THEN recipient_id
                        ELSE initiatedby_id
                END AS friend_id
                FROM friendships 
                WHERE (initiatedby_id = $1 OR recipient_id = $1) 
                AND status = 'accepted'`;
    let values = [ userID ];
    let friends = [];

    try {

        let res = await db.query( text, values );
        if ( res.rows.length > 0 ){
            for (i = 0; i < res.rows.length; i++){
                friends.push(ormFriendship(res.rows[i]));
            }
            return friends;
        }
        else{
            return false;
        }
    }
    catch ( e ){
        console.log( e.stack );
    }

};

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
        if ( res.rows.length > 0){
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

// Send a friend request
exports.sendFriendRequest = async ( requesterID, recipientID ) => {

    let text = `INSERT INTO friendship_requests (requester_id, recipient_id) 
    VALUES ($1, $2)
    RETURNING request_id`;
    let values = [ requesterID, recipientID ];

    try {
        let res = await db.query( text, values );

        if ( res.rows.length > 0){
            await notificationService.addNotification(recipientID, "You have received a friend request from " + requesterUsername);
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
         const recipient = await db.query(`SELECT username FROM users WHERE user_id = $1`, [recipientID]);
         const recipientUsername = recipient.rows[0].username;
        
        // Insert into friendships table
        await db.query(
            `INSERT INTO friendships (initiatedby_id, recipient_id, status) 
             VALUES ($1, $2, 'accepted')`, 
            [ requesterID, recipientID ]
        );
        
        // Delete the request from friendship_requests table
        await db.query(
            `DELETE FROM friendship_requests WHERE request_id = $1`, 
            [ requestID ]
        );

         // Send a notification to the requester about the accepted friend request
         await notificationService.addNotification(requesterID, "Your friend request has been accepted by " + recipientUsername);
        return { success: true };
    }
    else {
        return { error: "Friend request not found." };
    }
};

// Deny a friend request
exports.denyFriendRequest = async ( requestID ) => {
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
    OR (initiatedby_id = $2 AND recipient_id = $1)`
    let values = [ userID, friendID ]

    try{
        let res = await db.query( text, values );
        if (res.rows.length > 0)
        {
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

//Get the number of unread friend requests for a user 
exports.getUnreadFriendRequestCount = async ( userID ) => {
    let text = 'SELECT COUNT(*) FROM friendship_requests WHERE recipient_id = $1';
    let values = [ userID ];
    try{
        let res = await db.query( text, values );
        if (res.rows.length > 0){
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

// Get details of unread friend requests for a user
exports.getUnreadFriendRequests = async (userID) => {
    let text = 'SELECT request_id, requester_id, request_time FROM friendship_requests WHERE recipient_id = $1 ORDER BY request_time DESC';
    let values = [ userID ];
    let requests = [];
    try{
        let res = await db.query( text, values );
        if (res.rows.length > 0)
        {
            for (i = 0; i < res.rows.length; i++)
            {
                requests.push(ormFriendshipRequest(res.rows[i]));
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