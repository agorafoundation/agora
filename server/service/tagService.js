/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require('../db/connection');

// import models
const Tag = require('../model/tag');

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
        text += " ORDER BY id LIMIT $1 OFFSET $2";

        values.push( limit );
        values.push( offset );
    }
    else {
        text += " ORDER BY id LIMIT 100 OFFSET $1";
        values.push( offset );
    }

    text += ";";
    
    // run the query
    try {
        let tags = [];
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            tags.push( Tag.ormTag(res.rows[i] ) );
        }
        
        return tags;
        
    }
    catch(e) {
        console.log( e.stack );
        return false;
    }
}

/**
 * Any active user can query for any tag by the tags Id
 * @param {int} tagId 
 * @returns Tag or false if not found
 */
exports.getTagById = async function( tagId ) {
    let text = "SELECT * FROM tags WHERE id = $1";
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
    catch(e) {
        console.log( e.stack );
        return false;
    }
}

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
    catch(e) {
        console.log( e.stack );
        return false;
    }
}

/**
 * 
 * @param {*} ownerId 
 * @param {*} tagId 
 * @returns 
 */
exports.getAllActiveTagsForOwnerById = async function(ownerId, tagId) {
    const text = "SELECT * FROM tags WHERE active = $1 and owned_by = $2 and id = $3 order by id;";
    const values = [ true, ownerId, tagId ];

    let tags = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }
        
        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}

/**
 * Retrieves all tags created by a particular owner regardless of active status
 * @returns All tags as a list
 */
 exports.getAllTagsForOwner = async function(ownerId) {
    const text = "SELECT * FROM tags WHERE owned_by = $1 order by id;";
    const values = [ ownerId ];

    let tags = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            tags.push(Tag.ormTag(res.rows[i]));
        }

        return tags;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}



/**
 * Saves a tag to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Tag} tag 
 * @param {boolean} Update flag: true - force update (usually done when tag name has been verified as dup)
 * @returns Tag object with id 
 */
exports.saveTag = async function( tag, updateFlag ) {
    // check to see if an id exists - insert / update check
    if(tag) {
        if(tag.id > 0 || updateFlag) {
            
            // update
            let text = "UPDATE tags SET tag = $1, last_used = NOW(), owned_by = $2 WHERE id = $3;";
            let values = [ tag.tag.toLowerCase(), tag.ownedBy, tag.id ];
    
            try {
                let res = await db.query(text, values);
            }
            catch(e) {
                console.log("[ERR]: Error updating tag - " + e);
                return false;
            }
            
        }
        else {
            // insert
            let text = "INSERT INTO tags ( tag, last_used, owned_by) VALUES ($1, NOW(), $2) RETURNING id;";
            values = [ tag.tag.toLowerCase(), tag.ownedBy ];

            try {
                let res2 = await db.query(text, values);
    
                if(res2.rowCount > 0) {
                    tag.id = res2.rows[0].id;
                }
                
            }
            catch(e) {
                console.log("[ERR]: Error inserting tag - " + e);
                return false;
            }
        }
        return tag;
    }
    else {
        return false;
    }
}


/**
 * Delete a tag by the passed id
 * @param {int} tagId 
 * @returns {boolean} success
 */
 exports.deleteTagById = async ( tagId ) => {
    let text = "DELETE FROM tags WHERE id = $1";
    let values = [ tagId ];

    try {
        let res = await db.query( text, values );
        return true;
        
    }
    catch(e) {
        console.log( e.stack );
        return false;
    }
}

