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
    this.sharedByUserId = null;  // changed from shareUserId
    this.sharedWithUserId = null;  // changed from ownerUserId
    this.permissionLevel = -1;
    this.canCopy = false;
    
    //Todo Add these to the DB table 
    this.createTime = null;   
    this.updateTime = null;  
}

//Added createTime and UpdateTime to show when a workspace was shared with someone. 

exports.emptySharedEntity = () => {
    return new SharedEntity();
};


//Orm is middleman between the program and database. 
exports.ormSharedEntity = function ( row ) {
    let sharedEntity = exports.emptySharedEntity();
    sharedEntity.sharedEntityId = row.shared_entity_id;
    sharedEntity.entityId = row.entity_id;
    sharedEntity.entityType = row.entity_type;
    sharedEntity.sharedByUserId = row.shared_by_user_id;  
    sharedEntity.sharedWithUserId = row.shared_with_user_id;  
    sharedEntity.permissionLevel = row.permission_level;
    sharedEntity.canCopy = row.can_copy;
    sharedEntity.createTime = row.create_time;  // added
    sharedEntity.updateTime = row.update_time;  // added
    return sharedEntity;
};