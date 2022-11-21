/**
 * Entity that repersents a tag assoctiated with an object
 * Ties the tag_association table with the tag table
 * Associates the use of tags with users and their entities 
 * 
 * entity_type INTEGER, --  1-workspace, 2-topic, 3-resource, 
    entity_id INTEGER, -- fk to entity id for entity_type
    user_id INTEGER, -- fk of user that set tag
    use_count INTEGER, -- incremented when user finds entity via tag lookup
    last_used TIMESTAMP,
    active BOOLEAN,
    visibility INTEGER,     -- Enumeration -> 0 = Private / none, 1 = Shared with groups or individuals, 2 = Public
    create_time TIMESTAMP DEFAULT current_timestamp
 */

const tag = require( './tag' );

class tagged {
    constructor( ) {
        this.tag = new tag.emptyTag();
        this.entityType = new EntityType.UNKNOWN;
        this.entityId = -1;
        this.userId = -1;
        this.useCount = 0;
        this.lastUsed;
        this.active = true;
        this.visibility = 2;
    }
}

exports.emptyTag = () => {
    return new tagged();
};

exports.ormTagged = ( row ) => {
    let tagged = exports.emptyTag();   // requires a query to the tag table in the service
    tagged.entityType = EntityType[row.entity_type];
    tagged.entityId = row.entity_id;
    tagged.userId = row.user_id;
    tagged.useCount = row.use_count;
    tagged.lastUsed = row.last_used;
    tagged.active = row.active;
    tagged.visibility = row.visibility;
    return tagged;
};

const EntityType = {
    UNKNOWN: 0,
    WORKSPACE: 1,
    TOPIC: 2,
    RESOURCE: 3
};
