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
 * Get an resource by id regardless of active status
 * @param {Integer} resourceId 
 * @returns resource
 */
 exports.getResourceById = async function(resourceId) {
    let text = "SELECT * FROM resources WHERE id = $1";
    let values = [ resourceId ];
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
 * Retrieves all resources created by a particular owner regardless of active status
 * @returns All resources as a list
 */
 exports.getAllResourcesForOwner = async function(ownerId) {
    const text = "SELECT * FROM resources WHERE owned_by = $1 order by id;";
    const values = [ ownerId ];

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
 * Marks the users completed resource inactive which affectively marks it in-complete, but retains the history that they 
 * marked it complete at some point.
 * This is designed to be used when the user does not meet the post-assessment threshold and needs to re-review topic
 * @param {Integer} completedResourceId 
 * @returns true for success / false on failure
 */
exports.markUserTopicCompletedResourcesInactive = async function( completedResourceId ) {
    if( completedResourceId > 0 ) {
        // update
        let text = "UPDATE completed_resource SET active = $1, update_time = NOW() WHERE id = $2;";
        let values = [ false, completedResourceId ];

        try {
            let res = await db.query(text, values);
            return true;
        }
        catch(e) {
            console.log("[ERR]: Error updating completedResource - " + e);
            return false;
        }
        
    }
    else {
        return false;
    }
}

/*
 * Update / set the user resource image
 * The previous filename that was overwritten (if any) is returned
 */
exports.updateResourceImage = async (resourceId, filename) => {
    // get the resource (required to exist)
    let resource = await exports.getResourceById(resourceId);

    // save the current filename so that we can delete it after.
    let prevFileName = "";

    if(resource) {
        try {
            // retrieve the current filename so that we can delete it after.
            let text = "SELECT resource_image FROM resources WHERE id = $1";
            let values = [resource.id];

            // perform the query
            let res = await db.query(text, values);
            
            // set the prevFileName with the prev name
            if(res.rows.length > 0) {
                prevFileName = res.rows[0].resource_image;
            }

            // cerate the update query to set the new name
            text = "UPDATE resources SET resource_image = $2 WHERE id = $1";
            values = [resource.id, filename];

            // perform query
            await db.query(text, values);
            
        }
        catch(e) {
            console.log(e.stack);
        }

        return prevFileName;
    }
    else {
        // invalid db response!
        return false;
    }
};


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
            let text = "UPDATE resources SET resource_type = $1, resource_name = $2, resource_description = $3, resource_image = $4, resource_content_html=$5, resource_link=$6, is_required=$7, active = $8, owned_by = $9, visibility = $11 WHERE id = $10;";
            let values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy, resource.id, resource.visibility ];
    
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
            let text = "INSERT INTO resources (resource_type, resource_name, resource_description, resource_image, resource_content_html, resource_link, is_required, active, owned_by, visibility) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id;";
            values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy, resource.visibility ];

            try {
                let res2 = await db.query(text, values);
    
                if(res2.rowCount > 0) {
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