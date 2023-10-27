/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const { v4: uuidv4 } = require( "uuid" );

class Notification {
    constructor(user_id, message) {
        this.notificationId = uuidv4(); 
        this.userId = user_id;
        this.message = message;
        this.notificationTime;
        this.readStatus = false;
    }
}

/* Notification instance 
 * 
 * @param {string} user_id - The ID of the user to associate with the notification.
 * @param {string} message - The content/message of the notification.
 * @returns {Notification} - A new Notification instance.
 */

exports.createNotification = function( user_id, message ) {
    let newNotification = new Notification( user_id, message );
    return newNotification;
};

exports.emptyNotification = () => {
    return new Notification();
};


/**
 * Maps/transforms a raw database row into a structured Notification instance.
 * 
 * @param {Object} notificationRow - The raw database row representing a notification.
 * @returns {Notification} - The structured Notification instance.
 */

exports.ormNotification = function( notificationRow ) {
    let notification = exports.emptyNotification();
    notification.notificationId = notificationRow.notification_id;
    notification.userId = notificationRow.user_id;
    notification.message = notificationRow.message;
    notification.notificationTime = notificationRow.notification_time;
    notification.readStatus = notificationRow.read_status;
    return notification;
};
