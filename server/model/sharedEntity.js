/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */


// Enum for permission levels
const PermissionLevels = Object.freeze( {
    VIEW: 'view',
    DISCUSSION: 'discussion',
    EDIT: 'edit'
}
);


function SharedEntity() {
    this.sharedEntityId = -1;
    this.entityId = -1;
    this.entityType = -1;
    this.sharedByUserId = null;  
    this.sharedWithUserId = null; 
    this.permissionLevel = PermissionLevels.VIEW; //Added default permisson for sharing. 
    this.canCopy = false;
    
    //Added createTime and UpdateTime to show when a workspace was shared with someone. 
    //Todo Add these to the DB table
    this.createTime = null;   
    this.updateTime = null;  
}


SharedEntity.prototype.setPermissionLevel = function( level ) {
    const validLevels = new Set( Object.values( PermissionLevels ) 
    );
    if ( !validLevels.has( level ) ) { // Checks if the provided level is not in the set of valid levels.
        throw new Error( `Invalid permission level: ${level}` );
    }
    this.permissionLevel = level;

};

//Show the PermissionLevels ENUM to other parts 
exports.PermissionLevels = PermissionLevels;


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
    // Use the setPermissionLevel method to ensure that the permission level is valid
    sharedEntity.setPermissionLevel( row.permission_level );
    sharedEntity.canCopy = row.can_copy;
    sharedEntity.createTime = row.create_time;  
    sharedEntity.updateTime = row.update_time;  
    return sharedEntity;
};