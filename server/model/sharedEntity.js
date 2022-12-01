/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function sharedEntity() {
    this.shared_entity_id = -1;
    this.entity_id = -1;
    this.entity_type = -1;
    this.share_user_id = -1;
    this.owner_user_id = -1;
    this.permission_level = -1;
    this.can_copy = false;
}

exports.emptySharedEntity = () => {
    return new sharedEntity();
};

exports.ormSharedEntity = function ( row ) {
    let sharedEntity = exports.emptySharedEntity();
    sharedEntity.shared_entity_id = row.shared_entity_id;
    sharedEntity.entity_id = row.entity_id;
    sharedEntity.entity_type = row.entity_type;
    sharedEntity.share_user_id = row.share_user_id;
    sharedEntity.owner_user_id = row.owner_user_id;
    sharedEntity.permission_level = row.permission_level;
    sharedEntity.can_copy = row.can_copy;
    return sharedEntity;
};