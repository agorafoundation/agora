/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * Client Side controller for Workspaces
 * Contains the client side data model and API calls to maintain it.
 */

// import debug
import { debug, dataDebug } from "../state/stateManager.js";

function createNewTag() {
    return {
        tagId: -1,
        tag: "",
        lastUsed: null,
        ownedBy: -1
        
    };
}

function getEntityTypeEnum( entityType ) {
    switch( entityType ) {
    case "workspace":
        return EntityType.workspace;
    case "topic":
        return EntityType.topic;
    case "resource":
        return EntityType.resource;
    case "user":
        return EntityType.user;
    default:
        return EntityType.unknown;
    }
}

const EntityType = {
    unknown: 0,
    workspace: 1,
    topic: 2,
    resource: 3,
    user: 4
};



const saveTag = async ( tag, entityType, entityId ) => {
    ( debug ) ? console.log( "saveTag() : Start" ) : null;

    //console.log( "sending tag with workspaceId: " + workspaceId + " and tagType: " + tagType + " and tag: " + newTag.innerHTML + "" );
    const response = fetch( "api/v1/auth/tags/tagged", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "tag": {
                "tag": tag
            },
            entityType: entityType,
            entityId: entityId,
            active: true
        } )
    } )
        .then( response => response.json() )
        .then( ( data ) => {
            //console.log( "success saving tagged" );
            ( debug ) ? console.log( "saveTag() : Sucessful" ) : null;

        } );
    
    if( response.ok ) {
        const data = await response.json();
        ( debug && dataDebug ) ? console.log( "saveTag() tag saved : " + JSON.stringify( data ) ) : null;
        ( debug ) ? console.log( "saveTag() : tag created" ) : null;
        return data;
    }
    

};


const deleteTag = async ( tag, entityType, entityId ) => {
    ( debug ) ? console.log( "deleteTag() : Start" ) : null;

    const response = fetch( "api/v1/auth/tags/tagged/" + tag + "/" + entityType + "/" + entityId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ) {
        const data = await response.json();
        ( debug ) ? console.log( "deleteTag() tag deleted : " + JSON.stringify( data ) ) : null;
        
        ( debug && dataDebug ) ? console.log( "deleteTag() : tag deleted" ) : null;
        return data;
    }
};


export { createNewTag, saveTag, deleteTag, getEntityTypeEnum };