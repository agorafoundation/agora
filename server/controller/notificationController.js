/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const notificationService = require('../service/notificationService');


exports.addNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;  // Assuming you're sending userId and message in the request body
        const result = await notificationService.addNotification(userId, message);
        res.status(201).json({
            success: true,
            notificationId: result.notification_id
        });
    } catch (err) {
        console.error("Error in addNotification controller:", err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

