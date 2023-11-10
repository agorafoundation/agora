/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/** 
 * Client Side controller
 * Manages Workspace, Topic, and Resource creation and updates
 * Contains the client side data model and API calls to maintain it.
 */

// client side data model
let currentWorkspace = null;
let clientTopics = [];


/* Workspace Functions -------------------------------------------------------------------------------------- */

/*WORKSPACE function */
const saveWorkspace = async( workspace, topics ) => {
    console.log( 'saveWorkspace()' );
    const topicsList = Object.values( topics );

    // update the model with the new workspace name and description from the view
    workspace.workspaceName = document.getElementById( "workspace-title" ).value;
    workspace.workspaceDescription = document.getElementById( "workspace-desc" ).value;

    const response = await fetch( "api/v1/auth/workspaces", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "workspaceId": workspace.workspaceId,
            "workspaceName": workspace.workspaceName,
            "workspaceDescription": workspace.workspaceDescription,
            "topics": topicsList,
            "active":true,
            "visibility": "private"
        } )
    } );

    if( response.ok ) {
        const data = await response.json();
        //console.log( JSON.stringify( data ) );
        console.log( 'saveWorkspace() saved and complete' );
    }
};


/* END Workspace Functions ---------------------------------------------------------------------------------- */






const saveTopic = async( topic ) => {

        
    const response = await fetch( "api/v1/auth/topics", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "topicId": topic.topicId,
            "topicType": 1,
            "topicName": topic.topicName,
            "topicDescription": topic.topicDescription,
            "topicHtml": topic.topicHtml,
            "assessmentId": 1,
            "hasActivity": false,
            "hasAssessment": false,
            "activityId": 1,
            "active": true,
            "visibility": "private",
            "resources": topic.resources ? topic.resources : [],
            "createTime": Date.now(),
        } )
    } );

    if( response.ok ) {
        const data = await response.json();
        //console.log( "createTopic() topic saved " );
        // map the resulting topic id to the value used in topic elements
        topics[numTopics] = data.topicId;

        //console.log( topics );
        await saveWorkspace( topics );

        return data;
    }

    console.log( "createTopic() Complete " );
};




// Updates topic name
const updateTopic = async( name ) => {
    console.log( "updateTopic() " + name );
    let isRequired = [];

    // console.log( "resources found: " + JSON.stringify( resources ) );
    for( let i = 0; i < resources.length; i++ ){
        isRequired.push( "true" );
    }
    let id = getCurrTopicID();
    // console.log( "topic object: " + JSON.stringify( {
    //     "topicId": id,
    //     "topicName": name ? name : "Untitled",
    //     "resources": resources ? resources : [],
    //     "resourcesRequired": isRequired,
    //     "visibility": "private",
    //     "isRequired": true
    // } ) );
    const response = await fetch( "api/v1/auth/topics", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "topicId": id,
            "topicName": name ? name : "Untitled",
            "resources": resources ? resources : [],
            "resourcesRequired": isRequired,
            "visibility": "private",
            "isRequired": true
        } )
    } );

    if( response.ok ) {
        const data = await response.json();
        console.log( "updateTopic() saved and Complete" );
        return data;
    }
};
/* END Topic Functions -------------------------------------------------------------------------------------- */







/* Resource Functions --------------------------------------------------------------------------------- */
let resources = [];
let numResources = 0;

// create a new resource
async function createResource( name, type, imagePath, id ) {
    console.log( "createResource() name: " + name + " type " + type + " imagePath " + imagePath + " id " + id );
    if( !id ){
        const response = await fetch( "api/v1/auth/resources", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "resourceType": type,
                "resourceName": name ? name : "Untitled",
                "resourceDescription": "",
                "resourceContentHtml": "",
                "resourceImage": imagePath ? imagePath : "",
                "resourceLink": "",
                "isRequired": true,
                "active": true,
                "visibility": "private"
            } )
        } );

        if( response.ok ) {
            const data = await response.json();
            console.log( "createResource() : Resource created + Resource: " + JSON.stringify( data ) );
            // if( tabName.match( /\d+/g ) ) {
            //     resources-numResources] = [ data.resourceId, getCurrTopicID() ];
            // }
            // else {
            //     resources-numResources] = [];
            // }
            
            console.log( "saving resource id: " + data.resourceId + " to resources array " + " at getCurrTopicIndex " + getCurrTopicIndex() );
            
            console.log( "----------------- saving resource to list 1 --------------- " );
            if( resources[getCurrTopicIndex()] == null ) {
                resources[getCurrTopicIndex()] = [];
            }
            resources[getCurrTopicIndex()].push( data.resourceId );
            console.log( "resources array: " + JSON.stringify( resources ) );    
            //numResources++;

            // map the new resource to the associated topic
            //let topicTitle = document.getElementById( 'topic-title' + tabName.match( /\d+/g )[0] ).value;
            
            //let topicTitle = document.getElementById( 'tablinks' + currentTagId );
            //let topicTitle = document.getElementById( 'tabTopicName' + currentTagId );
            
            

            //console.log( "added resource: " + JSON.stringify( resources-numResources] ) );
            //console.log( "createResource() : updateTopic() call" );
            // URBG: removed this to test fix for update being called in the middle of save.
            // this might be needed for a different thread but not called here.
            //updateTopic( topicTitle.innerHTML );
            console.log( "createResource() : complete : Resources array: " + JSON.stringify( resources ) );
            return data;
        }
    }
    else{
        console.log( "!!----------------- saving resource to list 2 ---------------!! " );
        console.log( "saving resource id: " + id + " to resources array" );
        console.log( "current topic id: " + getCurrTopicID() + " current topic index: " + getCurrTopicIndex() );
        resources[getCurrTopicIndex()].push( id );

        console.log( "createResource() : complete - No id" );
    }
   
}
/* END Resource Functions -------------------------------------------------------------------------------------- */
