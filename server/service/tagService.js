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
 * Get an active tag by id
 * @param {Integer} tagId 
 * @returns tag
 */
exports.getActiveTagById = async function(tagId) {
    let text = "SELECT * FROM tags WHERE active = $1 AND id = $2";
    let values = [ true, tagId ];
    try {
        let tag = "";
         
        let res = await db.query(text, values);
        if(res.rowCount > 0) {
            tag = Tag.ormTag(res.rows[0]);
                  
        }
        return tag;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}

/**
 * Get an tag by id regardless of active status
 * @param {Integer} tagId 
 * @returns tag
 */
 exports.getTagById = async function(tagId) {
    let text = "SELECT * FROM tags WHERE id = $1";
    let values = [ tagId ];
    try {
        let tag = "";
         
        let res = await db.query(text, values);
        if(res.rowCount > 0) {
            tag = Tag.ormTag(res.rows[0]);
                  
        }
        return tag;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}



/**
 * Retrieves all active tags created by a particular owner
 * @returns All active tags as a list
 */
exports.getAllActiveTagsForOwner = async function(ownerId) {
    const text = "SELECT * FROM tags WHERE active = $1 and owned_by = $2 order by id;";
    const values = [ true, ownerId ];

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
 * @returns Tag object with id 
 */
exports.saveTag = async function(tag) {
    // check to see if an id exists - insert / update check
    if(tag) {
        if(tag.id > 0) {
            
            // update
            let text = "UPDATE tags SET tag = $2, parent=$7, active = $8, owned_by = $9, visibility = $11 WHERE id = $10;";
            let values = [ tag.tagType, tag.tagName, tag.tagDescription, tag.tagImage, tag.tagContentHtml, tag.tagLink, tag.isRequired, tag.active, tag.ownedBy, tag.id, tag.visibility ];
    
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
            let text = "INSERT INTO tags (tag_type, tag_name, tag_description, tag_image, tag_content_html, tag_link, is_required, active, owned_by, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;";
            values = [ tag.tagType, tag.tagName, tag.tagDescription, tag.tagImage, tag.tagContentHtml, tag.tagLink, tag.isRequired, tag.active, tag.ownedBy, tag.visibility ];

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