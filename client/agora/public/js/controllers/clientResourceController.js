/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * Client Side controller for Resources
 * Contains the client side data model and API calls to maintain it.
 */

import { debug, dataDebug } from "../state/stateManager.js";
import { uuidv4 } from "../util/editorUtil.js";


const resourceModel = {
    resourceId: uuidv4(),
    resourceType: 1,
    resourceName: "",
    resourceDescription: "",
    resourceContentHtml: "",
    resourceImage: "",
    resourceLink: "",
    isRequired: -1,
    active: true,
    visibility: "private",
    createTime: null,
    ownedBy: -1
};

async function saveResource( resource ) {
    ( debug ) ? console.log( "saveResource() : start" ) : null;
    const response = await fetch( "api/v1/auth/resources", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "resourceId":  resource.resourceId,
            "resourceType": resource.resourceType ? resource.resourceType : 1,
            "resourceName": resource.resourceName ? resource.resourceName : "Untitled",
            "resourceDescription": resource.resourceDescription,
            "resourceContentHtml": resource.resourceContentHtml,
            "resourceImage": resource.resourceImage,
            "resourceLink": resource.resourceLink,
            "isRequired": resource.isRequired ? resource.isRequired : false,
            "active": resource.active ? resource.active : true,
            "visibility": resource.visibility ? resource.visibility : "private"
        } )
    } );

    if( response.ok ) {
        const data = await response.json();
        ( debug ) ? console.log( "saveResource() resource saved : " + JSON.stringify( data ) ) : null;
        ( debug && dataDebug ) ? console.log( "saveResource() : resource created" ) : null;
        return data;
    }

}

// async function updateResource( id, name, contents ) {
//     console.log( "updateResource() call: " + id + " " + name + " " + contents );
//     fetch( "api/v1/auth/resources", {
//         method: "POST",
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify( {
//             "resourceId":  id,
//             "resourceType": 1,
//             "resourceName": name ? name : "Untitled",
//             "resourceDescription": "",
//             "resourceContentHtml": contents ? contents : "",
//             "resourceImage": "",
//             "resourceLink": "",
//             "isRequired": false,
//             "active": true,
//             "visibility": "private"
//         } )
//     } )
//         .then( response => response.json() )
//         .then( ( data ) => {
//             //console.log( JSON.stringify( data ) );
//         } );
// }

// // create a new resource
// async function createResource( name, type, imagePath, id ) {
//     console.log( "createResource() name: " + name + " type " + type + " imagePath " + imagePath + " id " + id );
//     if( !id ){
//         const response = await fetch( "api/v1/auth/resources", {
//             method: "POST",
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify( {
//                 "resourceType": type,
//                 "resourceName": name ? name : "Untitled",
//                 "resourceDescription": "",
//                 "resourceContentHtml": "",
//                 "resourceImage": imagePath ? imagePath : "",
//                 "resourceLink": "",
//                 "isRequired": true,
//                 "active": true,
//                 "visibility": "private"
//             } )
//         } );

//         if( response.ok ) {
//             const data = await response.json();
//             console.log( "createResource() : Resource created + Resource: " + JSON.stringify( data ) );
//             // if( tabName.match( /\d+/g ) ) {
//             //     resources-numResources] = [ data.resourceId, getCurrTopicID() ];
//             // }
//             // else {
//             //     resources-numResources] = [];
//             // }
            
//             //console.log( "saving resource id: " + data.resourceId + " to resources array " + " at getCurrTopicIndex " + getCurrTopicIndex() );
//             console.log( "saving resource id: " + data.resourceId + " to resources array " + " at getCurrTopicIndex " + currentTabIndex );
            
//             console.log( "----------------- saving resource to list 1 --------------- " );
//             // if( resources[getCurrTopicIndex()] == null ) {
//             //     resources[getCurrTopicIndex()] = [];
//             // }
//             //resources[getCurrTopicIndex()].push( data.resourceId );

//             if( resources[currentTabIndex] == null ){
//                 resources[currentTabIndex] = [];
//             }
//             resources[currentTabIndex].push( data.resourceId );
//             console.log( "resources array: " + JSON.stringify( resources ) );    
//             //numResources++;

//             // map the new resource to the associated topic
//             //let topicTitle = document.getElementById( 'topic-title' + tabName.match( /\d+/g )[0] ).value;
            
//             //let topicTitle = document.getElementById( 'tablinks' + currentTagId );
//             //let topicTitle = document.getElementById( 'tabTopicName' + currentTagId );
            
            

//             //console.log( "added resource: " + JSON.stringify( resources-numResources] ) );
//             //console.log( "createResource() : updateTopic() call" );
//             // URBG: removed this to test fix for update being called in the middle of save.
//             // this might be needed for a different thread but not called here.
//             //updateTopic( topicTitle.innerHTML );
//             console.log( "createResource() : complete : Resources array: " + JSON.stringify( resources ) );
//             return data;
//         }
//     }
//     else{
//         console.log( "!!----------------- saving resource to list 2 ---------------!! " );
//         console.log( "saving resource id: " + id + " to resources array" );
//         //console.log( "current topic id: " + getCurrTopicID() + " current topic index: " + getCurrTopicIndex() );
//         //resources[getCurrTopicIndex()].push( id );

//         if( resources[currentTabIndex] == null ){
//             resources[currentTabIndex] = [];
//         }
//         resources[currentTabIndex].push( id );

//         console.log( "createResource() : complete - No id" );
//     }
   
// }

export { saveResource, resourceModel };