//Notification Services: 

const db = require('../db/connection');
const userService = require('../services/userService');


class Notification {
    constructor(userId, message, status = 'unread') {
        this.notificationId = uuidv4();  // using UUID for unique notification IDs
        this.userId = userId;
        this.message = message;
        this.status = status;
        this.timestamp = new Date();
    }
}


// Add a new notification
exports.addNotification = async (userId, message) => {
    try {
        const newNotification = new Notification(userId, message);
        const result = await db.query(
            `INSERT INTO notifications (notification_id, user_id, message, status, timestamp) VALUES ($1, $2, $3, $4, $5) RETURNING notification_id`,
            [newNotification.notificationId, newNotification.userId, newNotification.message, newNotification.status, newNotification.timestamp]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error adding notification:", err);
        throw err;
    }
};

// Unread notifications



// Mark a notification as read


// notification for a user
