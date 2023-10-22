const db = require('../db/connection');
const { createNotification, MaptoNotification } = require('../model/notification');
const userService = require('../service/userService'); 
const { v4: uuidv4 } = require('uuid'); 



// Add a new notification
exports.addNotification = async (userId, message) => {
    try {
        const newNotification = createNotification(userId, message);
        newNotification.notificationId = uuidv4(); 
        const result = await db.query(
            `INSERT INTO notifications (notification_id, user_id, message, read_status, notification_time) VALUES ($1, $2, $3, $4, $5) RETURNING notification_id`,
            [newNotification.notificationId, newNotification.userId, newNotification.message, newNotification.readStatus, newNotification.notificationTime]
        );
        return result.rows[0];
    } catch (err) {
        console.error("Error adding notification:", err);
        throw err;
    }
};