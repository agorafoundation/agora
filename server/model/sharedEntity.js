/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function SharedEntity() {
    this.sharedEntityId = -1;
    this.entityId = -1;
    this.entityType = -1;
    this.shareUserId = -1;
    this.ownerUserId = -1;
    this.permissionLevel = -1;
    this.canCopy = false;
}

exports.emptySharedEntity = () => {
    return new SharedEntity();
};

exports.ormSharedEntity = function ( row ) {
    let sharedEntity = exports.emptySharedEntity();
    sharedEntity.sharedEntityId = row.shared_entity_id;
    sharedEntity.entityId = row.entity_id;
    sharedEntity.entityType = row.entity_type;
    sharedEntity.shareUserId = row.share_user_id;
    sharedEntity.ownerUserId = row.owner_user_id;
    sharedEntity.permissionLevel = row.permission_level;
    sharedEntity.canCopy = row.can_copy;
    return sharedEntity;
};