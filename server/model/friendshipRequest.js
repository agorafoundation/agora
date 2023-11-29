const { v4: uuidv4 } = require( "uuid" );

function friendshipRequest ( requester_id, recipient_id ){
    this.request_id = uuidv4();
    this.requester_id = requester_id;
    this.recipient_id = recipient_id;
    this.request_time;
}

exports.emptyFriendshipRequest = () => {
    return new friendshipRequest();
};

exports.ormFriendshipRequest = function ( row ) {
    let friendshipRequest = exports.emptyFriendshipRequest();
    friendshipRequest.request_id = row.request_id;
    friendshipRequest.requester_id = row.requester_id;
    friendshipRequest.recipient_id = row.recipient_id;
    friendshipRequest.request_time = row.request_time;
};