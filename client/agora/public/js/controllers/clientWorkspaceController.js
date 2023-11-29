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

function createNewWorkspace() {
    return {
        workspaceRid: -1,
        workspaceId: null,
        workspaceVersion: 1,
        workspaceName: "",
        workspaceDescription: "",
        workspaceImage: "",
        active: true,
        completable: false,
        createTime: null,
        visibility: "private",
        ownedBy: -1,

        topics: [],
        tags: []
    };
}

const saveWorkspace = async( workspace ) => {
    ( debug ) ? console.log( "saveWorkspace() : Start" ) : null;

    // prepare the topics as an array of uuids
    let topicUuids = [];
    if( workspace.topics ) {
        workspace.topics.forEach( topic => {
            topicUuids.push( topic.topicId );
        } );
    }

    if( workspace ) {
        const response = await fetch( "api/v1/auth/workspaces", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "workspaceId": workspace.workspaceId,
                "workspaceName":  workspace.workspaceName,
                "workspaceDescription": workspace.workspaceDescription,
                "topics": topicUuids,
                "active": true,
                "visibility": "private"
            } )
        } );

        if( response.ok ) {
            const data = await response.json();
            
            ( debug && dataDebug ) ? console.log( "saveWorkspace() workspace saved : " + JSON.stringify( data ) ) : null;
            ( debug ) ? console.log( "saveWorkspace() : Workspace created" ) : null;
            return data;
        }
    }
    else {
        ( debug ) ? console.log( "saveWorkspace() : Error - no workspace passed" ) : null;
        return null;
    }

    // const response = await fetch( "api/v1/auth/workspaces", {
    //     method: "POST",
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify( {
    //         "workspaceId": workspaceId,
    //         "workspaceName": name,
    //         "workspaceDescription": description,
    //         "topics": topicsList,
    //         "active":true,
    //         "visibility": "private"
    //     } )
    // } );

    // if( response.ok ) {
    //     const data = await response.json();
    //     //console.log( JSON.stringify( data ) );
    //     console.log( 'saveWorkspace() saved and complete' );
    // }
};

const getWorkspace = async( id ) => {
    ( debug ) ? console.log( "getWorkspace() - Start - id: " + id ) : null;
    const response = await fetch( "api/v1/auth/workspaces/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ) {
        const workspace = await response.json();
        ( debug && dataDebug ) ? console.log( "getWorkspace() : workspace retrieved: " + JSON.stringify( workspace ) ): null;
        ( debug ) ? console.log( "getWorkspace() : Complete" ) : null;
        return workspace.results;
    }
};

const getSharedWorkspace = async( id ) => {
    ( debug ) ? console.log( "getSharedWorkspace() - Start - id: " + id ) : null;
    const response = await fetch( "api/v1/auth/workspaces/shared/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ){
        const workspace = await response.json();
        ( debug && dataDebug ) ? console.log( "getWorkspace() : workspace retrieved: " + JSON.stringify( workspace ) ): null;
        ( debug ) ? console.log( "getSharedWorkspace() : Complete" ) : null;
        console.log( workspace.results );
        return workspace;
    }
};
export { createNewWorkspace, saveWorkspace, getWorkspace, getSharedWorkspace };
