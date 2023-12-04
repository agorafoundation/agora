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


// Function to share a workspace
const shareWorkspace = async ( workspaceId, sharedWithEmail, permissionLevel = 'view' ) => {
    ( debug ) ? console.log( "shareWorkspace() : Start" )  : null;

    try {
        const response = await fetch( "api/v1/auth/shareworkspace", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                entityId: workspaceId,
                sharedWithEmail: sharedWithEmail,
                permissionLevel: permissionLevel,
                canCopy: false  // Users can't copy the workspace on an initial share
            } 
            )
        }
        );

        if ( response.ok ) {
            const data = await response.json();
            ( debug && dataDebug ) ? console.log( "shareWorkspace() : Workspace shared successfully: " + JSON.stringify( data ) ) : null;
            return data;
        } 
        else {
            const errorData = await response.json();
            ( debug ) ? console.log( "shareWorkspace() : Error - " + errorData.message ) : null;
        }
    } 
    catch ( error ) {
        ( debug ) ? console.log( "shareWorkspace() : Exception - " + error.message ) : null;
    }

    return null;
};

// used for permission checks
const getPermission = async ( workspaceId ) => {
    return fetch( "api/v1/auth/shared/getPermission/" + workspaceId, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            if ( response.permission_level == "edit" ) {
                return true;
            }
            else {
                return false;
            }
        } )
        .catch( ( error ) => {
            console.error( "Error fetching permission:", error );
            return false;
        } );
};

// for displaying shared users in a workspace
const getAllSharedUsersForWorkspace = async ( id ) => {
    ( debug ) ? console.log( "getAllSharedUsersForWorkspace() - Start - id: " + id ) : null;
    const response = await fetch( "/api/v1/auth/shared/shared-entity/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ){
        const sharedUsers = await response.json();
        ( debug && dataDebug ) ? console.log( "getAllSharedUsersForWorkspace() : shared workspace users retrieved: " + JSON.stringify( sharedUsers ) ): null;
        ( debug ) ? console.log( "getAllSharedUsersForWorkspace() : Complete" ) : null;
        return sharedUsers;
    }
};

// for displaying workspace owner
const getWorkspaceOwner = async ( ownerId ) => {
    ( debug ) ? console.log( "getWorkspaceOwner() - Start - id: " + ownerId ) : null;
    console.log( "urbg: t2" );
    const response = await fetch( "/api/v1/auth/user/userId/" + ownerId, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ){
        const workspaceOwner = await response.json();
        ( debug && dataDebug ) ? console.log( "getWorkspaceOwner() : workspace owner retrieved: " + JSON.stringify( workspaceOwner ) ): null;
        ( debug ) ? console.log( "getWorkspaceOwner() : Complete" ) : null;
        return workspaceOwner;
    }
};

// for updating a user's permission
const updatePermission = async ( id, permission, profile ) => {
    ( debug ) ? console.log( "updatePermission() : Start" ) : null;
    if( id && profile ) {
        const response = await fetch( "/api/v1/auth/shared/updatePermission/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( {
                entityId: id.workspaceId,
                permissionLevel: permission,
                sharedUserId: profile.userId
            } ),
        } );

        if( response.ok ) {
            const data = await response.json();
            
            ( debug && dataDebug ) ? console.log( "updatePermission() permission updated : " + JSON.stringify( data ) ) : null;
            ( debug ) ? console.log( "updatePermission() : Permission updated" ) : null;
            return data;
        }
    }
    else {
        ( debug ) ? console.log( "updatePermission() : Error - workspace and or shared user dont exist" ) : null;
        return null;
    }

};

export { createNewWorkspace, saveWorkspace, getWorkspace, getAllSharedUsersForWorkspace, getWorkspaceOwner, updatePermission, getPermission, shareWorkspace};
