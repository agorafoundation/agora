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

//SQL queries

// Get all friends of a user
exports.getAllFriends = async ( userID ) => {
    const result = await db.query(
        `SELECT CASE 
                WHEN initiatedby_id = $1 THEN recipient_id
                ELSE initiatedby_id
         END AS friend_id
         FROM friendships 
         WHERE (initiatedby_id = $1 OR recipient_id = $1) 
         AND status = 'accepted'`, 
        [ userID ]
    );
    return result.rows;
};

// Get a specific friend by ID
exports.getFriendByID = async ( userID, friendID ) => {
    const result = await db.query(
        `SELECT * 
         FROM friendships 
         WHERE (initiatedby_id = $1 AND recipient_id = $2) 
         OR (initiatedby_id = $2 AND recipient_id = $1)
         AND status = 'accepted'`, 
        [ userID, friendID ]
    );
    return result.rows[0];
};

// Send a friend request
exports.sendFriendRequest = async ( requesterID, recipientID ) => {
    const result = await db.query(
        `INSERT INTO friendship_requests (requester_id, recipient_id) 
         VALUES ($1, $2)
         RETURNING request_id`, 
        [ requesterID, recipientID ]
    );
    await notificationService.addNotification(recipientID, "You have received a friend request from " + requesterUsername);
    return result.rows[0];
    
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
    const result = await db.query(
        `DELETE FROM friendships 
         WHERE (initiatedby_id = $1 AND recipient_id = $2) 
         OR (initiatedby_id = $2 AND recipient_id = $1)`, 
        [ userID, friendID ]
    );

    return ( result.rowCount > 0 ) ? { success: true } : { error: "Friend not found." };
};

//Get the number of unread friend requests for a user 
exports.getUnreadFriendRequestCountForUser = async (userID) => {
    const result = await db.query(
        `SELECT COUNT(*) AS count 
         FROM friendship_requests 
         WHERE recipient_id = $1`, 
        [ userID ]
    );
    return parseInt(result.rows[0].count);
};

// Get details of unread friend requests for a user
exports.getUnreadFriendRequestsForUser = async (userID) => {
    const result = await db.query(
        `SELECT request_id, requester_id, request_time 
         FROM friendship_requests 
         WHERE recipient_id = $1
         ORDER BY request_time DESC`, 
        [ userID ]
    );
    return result.rows;
};