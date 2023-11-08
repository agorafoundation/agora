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
            u.email AS friend_email,
            f.friendship_id as friendship_id
        FROM agora.friendships AS f
        JOIN agora.users AS u ON u.user_id = CASE
            WHEN f.initiatedby_id = $1 THEN f.recipient_id
            ELSE f.initiatedby_id
        END
        WHERE (f.initiatedby_id = $1 OR f.recipient_id = $1)
            AND f.friendship_status = 'accepted'`;
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

    let text = 'INSERT INTO friendships (initiatedby_id, recipient_id,friendship_status) VALUES ($1, $2, $3);';
    let values = [ requesterID, recipientID, 'pending' ];

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
exports.acceptFriendRequest = async ( friendship_id ) => {

    const request = await db.query(
        `SELECT * FROM friendships WHERE friendship_id = $1`, 
        [ friendship_id ]
    );

    if ( request.rows.length > 0 ) {
        // Insert into friendships table
        
        await db.query(
            `UPDATE friendships
            SET 
                friendship_status = 'accepted'
            WHERE friendship_id = $1`, 
            [ friendship_id ]
        );

        return { success: true };
    }
    else {
        return { error: "Friend request not found." };
    }
};

// Deny a friend request
exports.denyFriendRequest = async ( friendship_id ) => {

    const request = await db.query(
        `SELECT * FROM friendships WHERE friendship_id = $1`, 
        [ friendship_id ]
    );

    if ( request.rows.length > 0 ) {
        await db.query( `DELETE FROM friendships WHERE friendship_id = $1`, 
            [ friendship_id ]
        );
    
        return { success: true };
    }
    else {
        return { error: "Friend request not found." };
    }
};

// Delete a friend by ID
exports.deleteFriendByID = async ( friendshipId ) => {
    let text = `DELETE FROM friendships 
    WHERE friendship_id = $1`;
    let values = [ friendshipId ];

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
            f.friendship_id,
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
            AND f.friendship_status = 'pending'`; // Filter by pending status and recipient ID
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
    let text = `SELECT initiatedby_id, recipient_id FROM friendships WHERE recipient_id = $1 OR initiatedby_id = $1 AND friendship_status = 'pending'`;
    let values = [ userID ];
    let requests = [];
    try{
        let res = await db.query( text, values );
        if ( res.rows.length > 0 ) {
            for ( let i = 0; i < res.rows.length; i++ ) {
                requests.push( ormFriendship( res.rows[i] ) );
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

