/**
 * Entity that repersents a tag assoctiated with an object
 * Ties the tag_association table with the tag table
 * Associates the use of tags with users and their entities 
 * 
 * entity_type INTEGER, --  1-workspace, 2-topic, 3-resource, 
    entity_id INTEGER, -- fk to entity id for entity_type
    user_id INTEGER, -- fk of user that set tag
    lookup_count INTEGER, -- incremented when user finds entity via tag lookup, tracks popularity of this tag
    last_used TIMESTAMP,
    active BOOLEAN,
    create_time TIMESTAMP DEFAULT current_timestamp
 */

const Tag = require( './tag' );

class tagged {
    constructor( ) {
        this.tag = Tag.emptyTag();
        this.tagAssociationId = -1;
        this.entityType = EntityType.unknown;
        this.entityId = -1;
        this.userId = -1;
        this.lookupCount = 0;
        this.lastUsed;
        this.active = true;
    }
}

exports.emptyTagged = () => {
    return new tagged();
};

exports.ormTagged = ( row ) => {
    let tagged = exports.emptyTagged();   // requires a query to the tag table in the service
    tagged.tagAssociationId = row.tag_association_id;
    tagged.entityType = EntityType[row.entity_type];
    tagged.entityId = row.entity_id;
    tagged.userId = row.user_id;
    tagged.lookupCount = row.lookup_count;
    tagged.lastUsed = row.last_used;
    tagged.active = row.active;
    return tagged;
};

const EntityType = {
    unknown: 0,
    workspace: 1,
    topic: 2,
    resource: 3,
    user: 4
};
