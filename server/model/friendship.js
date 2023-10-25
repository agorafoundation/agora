const { v4: uuidv4 } = require( "uuid" );

function friendship( initiatedby_id, recipient_id ){
    this.friendship_id = uuidv4();
    this.initiatedby_id = initiatedby_id;
    this.recipient_id = recipient_id;
    this.status;
    this.created_time;
}

exports.emptyFriendship = () => {
    return new friendship();
};

exports.ormFriendship = function (row) {
    let friendship = exports.emptyFriendship();
    friendship.friendship_id = row.friendship_id;
    friendship.initiatedby_id = row.initiatedby_id;
    friendship.recipient_id = row.recipient_id;
    friendship.status = row.status;
    friendship.created_time = row.created_time;
}