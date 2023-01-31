/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const Tag = require( '../model/tag' );

// any cross services required

/**
 * Any active user can query for all tags created in the system.
 * The owned by member signifies the very first user to use the tag.
 * @param {boolean} activeOnly 
 * @param {int} limit Optional - If provided, will return up to the limit number of tags if not provided will return up to 100 tags
 * @param {int} offset Optional - If provided, will return tags starting at the offset otherwise will start at the beginning
 * @returns the requested set of Tags or false if not found
 */
exports.getAllTags = async ( limit, offset ) => {
    
    let text = "SELECT * FROM tags";
    let values = [ ];

    // apply a default offset if none is provided
    if ( !offset ) offset = 0;

    if( limit ) {
        text += " ORDER BY tag_id LIMIT $1 OFFSET $2";

        values.push( limit );
        values.push( offset );
    }
    else {
        text += " ORDER BY tag_id LIMIT 100 OFFSET $1";
        values.push( offset );
    }

    text += ";";
    
    // run the query
    try {
        let tags = [];
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            tags.push( Tag.ormTag( res.rows[i] ) );
        }
        
        return tags;
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - get all tags - " + e );
        return false;
    }
};

/**
 * Any active user can query for any tag by the tags Id
 * @param {int} tagId 
 * @returns Tag or false if not found
 */
exports.getTagById = async function( tagId ) {
    let text = "SELECT * FROM tags WHERE tag_id = $1";
    let values = [ tagId ];

    try {
        let tag = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            tag = Tag.ormTag( res.rows[0] );
            return tag;
        }
        else {
            return false;
        }
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - get tag by id - " + e );
        return false;
    }
};

exports.getTagByTagName = async ( tagName ) => {
    let text = "SELECT * FROM tags WHERE tag ILIKE $1;";
    let values = [ tagName ];

    try {
        let tag = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            tag = Tag.ormTag( res.rows[0] );
            return tag;
        }
        else {
            return false;
        }
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - get tag by name - " + e );
        return false;
    }
};

/**
 * 
 * @param {*} ownerId 
 * @param {*} tagId 
 * @returns 
 */
exports.getAllActiveTagsForOwnerById = async function( ownerId, tagId ) {
    const text = "SELECT * FROM tags WHERE active = $1 and owned_by = $2 and tag_id = $3 order by tag_id;";
    const values = [ true, ownerId, tagId ];

    let tags = [];
    
    try {
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            tags.push( Tag.ormTag( res.rows[i] ) );
        }
        
        return tags;
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - get active tags for owner by id - " + e );
        return false;
    }

};

/**
 * Retrieves all tags created by a particular owner regardless of active status
 * @returns All tags as a list
 */
exports.getAllTagsForOwner = async function( ownerId ) {
    const text = "SELECT * FROM tags WHERE owned_by = $1 order by tag_id;";
    const values = [ ownerId ];

    let tags = [];
    
    try {
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            tags.push( Tag.ormTag( res.rows[i] ) );
        }

        return tags;
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - get all tags for owner - " + e );
        return false;
    }

};



/**
 * Saves a tag to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Tag} tag 
 * @param {boolean} Update flag: true - force update (usually done when tag name has been verified as dup)
 * @returns Tag object with id 
 */
exports.saveTag = async function( tag, updateFlag ) {
    // check to see if an id exists - insert / update check
    if( tag ) {
        if( tag.tagId > 0 || updateFlag ) {
            
            // update
            let text = "UPDATE tags SET tag = $1, last_used = NOW(), owned_by = $2 WHERE tag_id = $3;";
            let values = [ tag.tag.toLowerCase(), tag.ownedBy, tag.tagId ];
    
            try {
                await db.query( text, values );
            }
            catch( e ) {
                console.log( "[ERR]: Error updating tag - " + e );
                return false;
            }
            
        }
        else {
            // insert
            let text = "INSERT INTO tags ( tag, last_used, owned_by) VALUES ($1, NOW(), $2) RETURNING tag_id;";
            let values = [ tag.tag.toString().toLowerCase(), tag.ownedBy ];

            try {
                let res = await db.query( text, values );
    
                if( res.rowCount > 0 ) {
                    tag.tagId = res.rows[0].tag_id;
                }                
            }
            catch( e ) {
                console.log( "[ERR]: Error inserting tag - " + e );
                return false;
            }
        }
        return tag;
    }
    else {
        return false;
    }
};

exports.getTaggedEntity = async ( entityType, entityId ) => {
    if( entityType && entityId ) {
        let text = "SELECT * FROM tag_associations WHERE entity_type = $1 and entity_id = $2;";
        let values = [ entityType, entityId ];

        try {
            let res = await db.query( text, values );
            let tags = [];
            if( res.rowCount > 0 ) {
                for( let i=0; i<res.rows.length; i++ ) {
                    tags.push( await this.getTagById( res.rows[i].tag_id ) );
                }
            }
            return tags;
        }
        catch( e ) {
            console.log( "[ERR]: Error retrieving tagged entity - " + e );
            return false;
        }
    }
};

exports.saveTagged = async ( tagged ) => {
    if( tagged ) {
        if( tagged.tagAssociationId > 0 ) {          

            // update
            let text = "UPDATE tag_associations SET tag_id = $1 entity_type = $2, entity_id = $3, user_id = $4, lookup_count=$5, last_used=now(), active = $6 WHERE tag_association_id = $7;";
            let values = [ tagged.tag.tagId, tagged.entityType, tagged.entityId, tagged.userId, tagged.lookupCount, tagged.active, tagged.id ];
    
            try {
                await db.query( text, values );
            }
            catch( e ) {
                console.log( "[ERR]: Error updating tagged - " + e );
                return false;
            }
        }
        else {
            // insert
            let text = "INSERT INTO tag_associations ( tag_id, entity_type, entity_id, user_id, lookup_count, last_used, active ) VALUES ($1, $2, $3, $4, $5, now(), $6) RETURNING tag_association_id;";
            let values = [ tagged.tag.tagId, tagged.entityType, tagged.entityId, tagged.userId, tagged.lookupCount, tagged.active ];
    
            try {
                let res = await db.query( text, values );
                if( res.rowCount > 0 ) {
                    tagged.tagId = res.rows[0].tag_association_id;
                }
            }
            catch( e ) {
                console.log( "[ERR]: Error inserting tagged - " + e );
                return false;
            }
        }
    }
    else {
        console.log( "[ERR]: no tagged object passed to saveTagged" );
    }
    
};

exports.deleteTagged = async ( tagId, entityType, entityId, userId ) => {

    if( tagId >= 0 && entityType && entityId && userId ){
        let text = "DELETE FROM tag_associations WHERE tag_id = $1 AND entity_type = $2 AND entity_id = $3 AND user_id = $4;";
        let values = [ tagId, entityType, entityId, userId ];

        try {
            await db.query( text, values );
            return true;
        }
        catch( e ) {
            console.log( "[ERR]: Error deleting tagged - " + e );
            return false;
        }
    }
    
};



/**
 * Delete a tag by the passed id
 * @param {int} tagId 
 * @returns {boolean} success
 */
exports.deleteTagById = async ( tagId ) => {
    let text = "DELETE FROM tags WHERE tag_id = $1";
    let values = [ tagId ];

    try {
        await db.query( text, values );
        return true;
        
    }
    catch( e ) {
        console.log( "[ERR]: Error [Tags] - delete tag by id - " + e );
        return false;
    }
};

