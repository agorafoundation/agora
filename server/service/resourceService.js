/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const Resource = require( '../model/resource' );

// any cross services required



/**
 * Get a single resource by Id
 * @param {int} resourceId - Id of resource to retrieve
 * @param {boolean} active - If true resource must have an active status
 * @returns {Resource}
 */
exports.getResourceById = async ( resourceId, active ) => {
    let text = "SELECT * FROM resources WHERE resource_id = $1";
    if( active ) {
        text += "AND active = $2";
    }
    text += ";";

    let values = [ resourceId ];
    if( active ) {
        values.push( true );
    }

    try {
        let resource = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            resource = Resource.ormResource( res.rows[0] );
                  
        }
        return resource;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Get all resources that are visible to a user. This includes resources that are owned by the user and active,
 * resources that are and shared with the user, and resources that are publicly available.
 * TODO: Currently this method is implementing user owned active and publicly available resources. This will be updated to include shared resources
 * when the shared resource model is implemented.
 * @param {int} ownerId 
 * @param {int} limit Optional - If provided, will return up to the limit number of tags if not provided will return up to 100 tags
 * @param {int} offset Optional - If provided, will return tags starting at the offset otherwise will start at the beginning
 * @returns 
 */
exports.getAllVisibleResources = async ( ownerId, limit, offset ) => {
    let text = "SELECT * FROM resources WHERE active = $1 and (owned_by = $2 OR visibility = 'public') ORDER BY resource_id";
    let values = [ true, ownerId ];

    // apply a default offset if none is provided
    if ( !offset ) offset = 0;

    if( limit ) {
        text += " LIMIT $3 OFFSET $4";

        values.push( limit );
        values.push( offset );
    }
    else {
        text += " LIMIT 100 OFFSET $3";
        values.push( offset );
    }

    text += ";";


    let resources = [];
    
    try {
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            resources.push( Resource.ormResource( res.rows[i] ) );
        }
        
        return resources;
        
    }
    catch( e ) {
        console.log( e.stack );
    }

};


/**
 * TODO:shared This method is a stub as currently there is no way to get all shared resources for a user
 * When the shared resource model is implemented this method will be updated to return all shared resources for a user
 * @param {int} userId 
 * @param {int} resourceId
 * @returns 
 */
exports.getAllSharedResourcesForUser = async ( userId, resourceId ) => {
    // this query is wrong.. here is the schema
    // agora=> select * from shared_entities;
    // shared_entity_id | entity_id | entity_type | shared_by_user_id | shared_with_user_id | permission_level | can_copy | create_time | update_time

    let text = "SELECT * FROM shared table WHERE userId = $1 AND resourceId = $2 active = $3;";
    let values = [ userId, resourceId, true ];

    let resources = [];
    try {
        let res = await db.query( text, values );

        for( let i=0; i<res.rows.length; i++ ) {
            resources.push( Resource.ormResource( res.rows[i] ) );
        }
        return resources;

    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Retrieves all active resources created by a particular owner
 * @returns All active resources as a list
 */
exports.getAllActiveResourcesForOwner = async ( ownerId ) => {

    const text = "SELECT * FROM resources WHERE active = $1 and owned_by = $2 order by resource_id;";
    const values = [ true, ownerId ];

    let resources = [];
    
    try {
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            resources.push( Resource.ormResource( res.rows[i] ) );
        }
        
        return resources;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * 
 * @param {*} ownerId 
 * @param {*} resourceId 
 * @returns 
 */
exports.getAllActiveResourcesForOwnerById = async ( ownerId, resourceId ) => {
    const text = "SELECT * FROM resources WHERE active = $1 and (owned_by = $2 OR visibility = 'public') and resource_id = $3 order by resource_id;";
    const values = [ true, ownerId, resourceId ];

    let resources = [];
    
    try {
         
        let res = await db.query( text, values );

        if( res.rowCount > 0 ) {
            for( let i=0; i<res.rows.length; i++ ) {
                resources.push( Resource.ormResource( res.rows[i] ) );
            }
            
            return resources;
        }

        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};

/**
 * Retrieves all resources created by a particular owner regardless of active status
 * @returns All resources as a list
 */
exports.getAllResourcesForOwner = async ( ownerId ) => {
    const text = "SELECT * FROM resources WHERE owned_by = $1 order by resource_id;";
    const values = [ ownerId ];

    let resources = [];
    
    try {
         
        let res = await db.query( text, values );
        
        for( let i=0; i<res.rows.length; i++ ) {
            resources.push( Resource.ormResource( res.rows[i] ) );
        }

        return resources;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Marks the users completed resource inactive which affectively marks it in-complete, but retains the history that they 
 * marked it complete at some point.
 * This is designed to be used when the user does not meet the post-assessment threshold and needs to re-review topic
 * @param {Integer} completedResourceId 
 * @returns true for success / false on failure
 */
exports.markUserTopicCompletedResourcesInactive = async ( completedResourceId ) => {
    if( completedResourceId > 0 ) {
        // update
        let text = "UPDATE completed_resources SET active = $1, update_time = NOW() WHERE completed_resource_id = $2;";
        let values = [ false, completedResourceId ];

        try {
            let res = await db.query( text, values );
            return true;
        }
        catch( e ) {
            console.log( "[ERR]: Error updating completedResources - " + e );
            return false;
        }
        
    }
    else {
        return false;
    }
};

/*
 * Update / set the user resource image
 * The previous filename that was overwritten (if any) is returned
 */
exports.updateResourceImage = async ( resourceId, filename ) => {
    // get the resource (required to exist)
    let resource = await exports.getResourceById( resourceId );

    // save the current filename so that we can delete it after.
    let prevFileName = "";

    if( resource ) {
        try {
            // retrieve the current filename so that we can delete it after.
            let text = "SELECT resource_image FROM resources WHERE resource_id = $1";
            let values = [ resourceId ];

            // perform the query
            let res = await db.query( text, values );
            
            // set the prevFileName with the prev name
            if( res.rows.length > 0 ) {
                prevFileName = res.rows[0].resource_image;
            }

            // cerate the update query to set the new name
            text = "UPDATE resources SET resource_image = $2 WHERE resource_id = $1";
            values = [ resourceId, filename ];

            // perform query
            await db.query( text, values );
            
        }
        catch( e ) {
            console.log( e.stack );
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
exports.saveResource = async ( resource ) => {
    // check to see if an id exists - insert / update check
    if( resource ) {
        // query to see if the resourceId exists
        let text = "SELECT resource_id FROM resources WHERE resource_id = $1;";
        let values = [ resource.resourceId ];
        try {
            let res = await db.query( text, values );
            if( res.rowCount > 0 ) {
            
                // update
                let text = "UPDATE resources SET resource_type = $1, resource_name = $2, resource_description = $3, resource_image = $4, resource_content_html=$5, resource_link=$6, is_required=$7, active = $8, owned_by = $9, visibility = $10 WHERE resource_id = $11;";
                let values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy, resource.visibility, resource.resourceId ];
        
                try {
                    let res = await db.query( text, values );
                }
                catch( e ) {
                    console.log( "[ERR]: Error updating resources - " + e );
                    return false;
                }
                
            }
            else {
                
                // insert
                let text = "INSERT INTO resources (resource_type, resource_name, resource_description, resource_image, resource_content_html, resource_link, is_required, active, owned_by, visibility, resource_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING resource_id;";
                let values = [ resource.resourceType, resource.resourceName, resource.resourceDescription, resource.resourceImage, resource.resourceContentHtml, resource.resourceLink, resource.isRequired, resource.active, resource.ownedBy, resource.visibility, resource.resourceId ];
    
                try {
                    let res2 = await db.query( text, values );
        
                    if( res2.rowCount > 0 ) {
                        resource.resourceId = res2.rows[0].resource_id; // TODO: Once database change goes through, this will need to be changed to .resourceId.-
                    }
                    
                }
                catch( e ) {
                    console.log( "[ERR]: Error inserting resources - " + e );
                    return false;
                }
            }
            return resource;
        }
        catch( e ) {
            console.log( "[ERR]: saveResource - error checking to see if resourceId exists - " + e );
            return false;
        }
        
    }
    else {
        return false;
    }
};

// Removes a resource given an ID
exports.deleteResourceById = async ( resourceId, ownerId ) => {
    let text = "DELETE FROM resources WHERE resource_id = $1 and owned_by = $2";
    let values = [ resourceId, ownerId ];

    try {
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            return true;
        }
        else {
            return false;
        }
    }
    catch ( e ) {
        console.log( e.stack );
        return false;
    }
};