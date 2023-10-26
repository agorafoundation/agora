/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


const friendService = require('../../service/friendService');

// Get the count of unread friend requests for a user
exports.getUnreadFriendRequestCount = async (req, res) => {
    try {
        const userID = req.user.id; 
        const count = await friendService.getUnreadFriendRequestCount(userID);
        
        return res.json({ unreadCount: count });
    } catch (error) {
        console.error("Error fetching unread friend request count:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};

// Get the details of unread friend requests for a user
exports.getUnreadFriendRequests = async (req, res) => {
    try {
        const userID = req.user.id; 
        const requests = await friendService.getUnreadFriendRequests(userID);
        
        return res.json(requests);
    } catch (error) {
        console.error("Error fetching unread friend requests:", error);
        return res.status(500).json({ error: "Server Error" });
    }
};

