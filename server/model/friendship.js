const { v4: uuidv4 } = require( "uuid" );

// Constants for the friendship status
const PENDING = 'pending';
const ACCEPTED = 'accepted';
const REJECTED = 'rejected';

function friendship( initiatedby_id, recipient_id, status = PENDING ){
    this.friendship_id = uuidv4();
    this.initiatedby_id = initiatedby_id;
    this.recipient_id = recipient_id;
    this.status = status; 
    this.created_time;
}

exports.emptyFriendship = () => {
    return new friendship( null, null, PENDING ); //Makes sure that the empty friendships have a default status of pending. 
};

exports.ormFriendship = function ( row ) {
    let friendshipInstance = exports.emptyFriendship();
    friendshipInstance.friendship_id = row.friendship_id;
    friendshipInstance.initiatedby_id = row.initiatedby_id;
    friendshipInstance.recipient_id = row.recipient_id;
    friendshipInstance.status = row.status;
    friendshipInstance.created_time = row.created_time;
    friendshipInstance.friend_first_name = row.friend_first_name;
    friendshipInstance.friend_last_name = row.friend_last_name;
    friendshipInstance.friend_username = row.friend_username;
    friendshipInstance.friend_email = row.friend_email;
    friendshipInstance.friend_profile_filename = row.friend_profile_filename;

    return friendshipInstance; 
};

// Exported the status so they can be used elsewhere in the application
exports.PENDING = PENDING;
exports.ACCEPTED = ACCEPTED;
exports.REJECTED = REJECTED;