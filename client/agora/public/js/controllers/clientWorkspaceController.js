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

const workspaceModel = {
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

const saveWorkspace = async( workspace, topicIds ) => {
    console.log( 'saveWorkspace()' );
    const topicsList = Object.values( topicIds );

    // if passed, add the topicIds to the workspace object
    if( topicIds ) {
        workspace.topics = topicsList;
    }

    //const [ isTopic, workspaceId ] = getPrefixAndId();
    // let name = document.getElementById( "workspace-title" ).value;
    // let description = document.getElementById( "workspace-desc" ).value;

    const response = await fetch( "api/v1/auth/workspaces", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( workspace )
    } );

    if( response.ok ) {
        const data = await response.json();
        ( debug ) ? console.log( "saveWorkspace() : Workspace created + Response: " + JSON.stringify( data ) ) : null;
        return data;
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

export { workspaceModel, saveWorkspace, getWorkspace };