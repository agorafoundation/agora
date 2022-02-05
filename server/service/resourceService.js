/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require('../db/connection');

// import models
const Resource = require('../model/resource');

// any cross services required



/**
 * Get an active resource by id
 * @param {Integer} resourceId 
 * @returns resource
 */
exports.getActiveResourceById = async function(resourceId) {
    let text = "SELECT * FROM resources WHERE active = $1 AND id = $2";
    let values = [ true, resourceId ];
    try {
        let resource = "";
         
        let res = await db.query(text, values);
        if(res.rowCount > 0) {
            resource = Resource.ormResource(res.rows[0]);
                  
        }
        return resource;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}


/**
 * Retrieves all active resources created by a particular owner
 * @returns All active resources as a list
 */
exports.getAllActiveResourcesForOwner = async function(ownerId) {
    const text = "SELECT * FROM resources WHERE active = $1 and owned_by = $2 order by id;";
    const values = [ true, ownerId ];

    let resources = [];
    
    try {
         
        let res = await db.query(text, values);
        
        for(let i=0; i<res.rows.length; i++) {
            resources.push(Resource.ormResource(res.rows[i]));
        }

        return resources;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}





/**
 * Saves a resource to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Resource} resource 
 * @returns Resource object with id 
 */
exports.saveResource = async function(resource) {
    // check to see if an id exists - insert / update check
    if(resource) {
        if(resource.id > 0) {
            
            // update
            let text = "UPDATE resources SET resource_type = $1, resource_name = $2, resource_description = $3, resource_image = $4, resource_content_html=$5, resource_link=$6, is_required=$7, active = $8, owned_by = $9 WHERE id = $10;";
            let values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy, resource.id ];
    
            try {
                let res = await db.query(text, values);
            }
            catch(e) {
                console.log("[ERR]: Error updating resource - " + e);
                return false;
            }
            
        }
        else {
            
            // insert
            let text = "INSERT INTO resources (resource_type, resource_name, resource_description, resource_image, resource_content_html, resource_link, is_required, active, owned_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id;";
            values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy ];

            try {
                let res2 = await db.query(text, values);
    
                if(res2.rows.rowCount > 0) {
                    resource.id = res2.rows[0].id;
                }
                
            }
            catch(e) {
                console.log("[ERR]: Error inserting resource - " + e);
                return false;
            }
        }
        return resource;
    }
    else {
        return false;
    }
}