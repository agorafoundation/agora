const db = require('../db/connection');
const { createNotification, ormNotification } = require('../model/notification');
const userService = require( '../service/userService' ); 


// Add a new notification
exports.addNotification = async ( userId, message ) => {
    let notification = createNotification( userId, message );
    let text = `INSERT INTO notifications (notification_id, user_id, message) 
                VALUES ($1, $2, $3) RETURNING notification_id`;
    let values = [ notification.notificationId, userId, message ];
    try {
        let res = await db.query( text, values );
        if ( res.rows.length > 0){
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

exports.deleteNotification = async ( notificationId ) => {
    let text = "DELETE FROM notifications WHERE notification_id = $1";
    let values = [ notificationId ];
    try{
        let res = await db.query( text, values );
        if( res.rows.length > 0){
            return "Notification deleted";
        }
        else{
            return "Notification not found";
        }
    }
    catch ( e ){
        console.log( e.stack );
    }
}

exports.getNotifications = async ( userId ) => {
    let text = "SELECT * FROM notifications WHERE user_id = $1";
    let values = [ userId ];
    let notifications = [ ];
    try{
        let res = await db.query( text, values );
        if( res.rows.length > 0 ){
            for( i = 0; i < res.rows.length; i++){
                notifications.push( res.rows[i] );
            }
            return notifications;
        }
        else{
            return false;
        }
    }
    catch ( e ){
        console.log( e.stack );
    }
}