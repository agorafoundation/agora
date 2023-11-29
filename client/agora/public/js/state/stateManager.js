// get models and controller functions from modules
import { addTopicEvent } from "../editorMain.js";
import { createNewResource, saveResource } from "../controllers/clientResourceController.js";
import { createNewTopic, saveTopic, getTopic, getResourcesForTopic, deleteTopic } from "../controllers/clientTopicController.js";
import { createNewWorkspace, saveWorkspace, getWorkspace } from "../controllers/clientWorkspaceController.js";

/**
 * Client side debugging flags
 */
const debug = true;
const dataDebug = true;


/**
 * Client model state 
 */
// Workspace for the loaded editor
let workspace = createNewResource;

// Active topic for the chosen tab
let activeTopic = createNewTopic();
/*--------------------------------------------------------------------------------*/

/**
 * Client model state management methods
 */

/**
 * Create workspace state for the editor
 */
const initializeWorkspace = async ( workspaceUuid ) => {
    ( debug ) ? console.log( "initializeWorkspace() : Start" ) : null;
    if( !workspace || workspace.workspaceId !== workspaceUuid ) {
        workspace = await getWorkspace( workspaceUuid );
    }
    else {
        console.log( "workspace already initialized" );
    }
    ( debug & dataDebug ) ? console.log( "initializeWorkspace() : workspace: " + JSON.stringify( workspace ) ) : null; 
    ( debug ) ? console.log( "initializeWorkspace() : Complete" ) : null;

};

/**
 * Getter for the current workspace
 * @returns the current workspace
 */
const getCurrentWorkspace = ( ) => {
    return workspace;
};

/**
 * Gettr for the current active topic
 * @returns the current active topic
 */
const getCurrentActiveTopic = ( ) => {
    return activeTopic;
};

/**
 * Manages updating the topicId and resources for the passed topic.
 * @param {uuid} topicId 
 */
const setActiveTopicAndResources = async function ( topicId ) {
    ( debug ) ? console.log( "setActiveTopicAndResources() : Start - topicId : " + topicId ) : null;

    // if no topicId is passed, use the first topic in the workspace
    // if( !topicId && workspace.topics ) {
    //     topicId = workspace.topics[0].topicId;
    // }
    
    // if there are topics in the workspace, set the active topic using the id passed or the first topic in the workspace
    
    if( topicId && workspace.topics ) {
        activeTopic = workspace.topics.find( topic => topic.topicId === topicId );
        ( debug && dataDebug ) ? console.log( "activeTopic: " + JSON.stringify( activeTopic ) ) : null;

        // get the resources for the active topic
        if( activeTopic ) {
            const resources = await getResourcesForTopic( activeTopic.topicId );
            
            if( resources ) {
                activeTopic.resources = await resources;
                ( debug && dataDebug ) ? console.log( "topic resources: " + JSON.stringify( activeTopic.resources ) ) : null;
            }

        }
    }
    else {
        // there are currently no topics in the workspace, create a new one
        addTopicEvent();
    }

    ( debug ) ? console.log( "setActiveTopicAndResources() : Complete" ) : null;
};

const addNewTopic = async function ( topicName ) {
    ( debug ) ? console.log( "addNewTopic() : Start - topicName: " + topicName ) : null;

    if( getCurrentWorkspace() ) {
        // create a new topic
        let newTopic = createNewTopic();
        newTopic.topicName = topicName;

        // make sure the worspace fields are up to date
        getCurrentWorkspace().name = document.getElementById( "workspace-title" ).value;
        getCurrentWorkspace().description = document.getElementById( "workspace-desc" ).value;

        // save the topic
        newTopic = await saveTopic( newTopic, null );

        // add the topic to the current workspace
        await getCurrentWorkspace().topics.push( newTopic );

        // save the current workspace
        await saveWorkspace( getCurrentWorkspace() );

        
        ( debug ) ? console.log( "addNewTopic() : Complete" ) : null;
        return newTopic;
    }
    else {
        ( debug ) ? console.log( "addNewTopic() : Error - No current workspace" ) : null;
        return null;
    }
    

};

const updateTopicName = async function ( topicId, topicName ) {
    ( debug ) ? console.log( "saveActiveTopic() : Start" ) : null;

    // get the topic from the current workspace
    let topic = getCurrentWorkspace().topics.find( topic => topic.topicId === topicId );

    // update the topic name
    topic.topicName = topicName;

    // save the topic
    await saveTopic( topic );

    ( debug ) ? console.log( "saveActiveTopic() : Start" ) : null;
};

const saveActiveTopic = async function ( ) {
    ( debug ) ? console.log( "saveActiveTopic() : Start" ) : null;

    // get the topics name
    //activeTopic.topicName = document.getElementById( "tabTopicName-" ).value;

    // save the topic
    await saveTopic( activeTopic );

    ( debug ) ? console.log( "saveActiveTopic() : Complete" ) : null;

};

const deleteTopicFromWorkspace = async function ( topicId ) {
    ( debug ) ? console.log( "deleteTopicFromWorkspace() : Start for topicId - " + topicId ) : null;

    // delete the topic and resources
    await deleteTopic( topicId );

    // remove the topic from the current workspace
    getCurrentWorkspace().topics = getCurrentWorkspace().topics.filter( topic => topic.topicId !== topicId );

    // save the current workspace (deletes association with workspace)
    await saveWorkspace( getCurrentWorkspace() );

    
    
    ( debug ) ? console.log( "deleteTopicFromWorkspace() : Complete" ) : null;
};

const addNewTextResource = async function ( ) {


    ( debug ) ? console.log( "addNewTextResource() : Start" ) : null;

    // create a new resource
    let resource = createNewResource();

    // save the resource
    await saveResource( resource );

    // add the resource to the current topic
    getCurrentActiveTopic().resources.push( resource );

    // save the topic
    await saveActiveTopic( );


    ( debug ) ? console.log( "addNewTextResource() : Complete" ) : null;
};

function saveTextResource( resource, content ) {
    ( debug ) ? console.log( "textEditorUpdate() : Start" ) : null;
    if ( resource ) {
        // update the resource title
        resource.resourceName = document.getElementById( "input-title-" + resource.resourceId ).value;

        // update the resource content
        if( content != null ) {
            resource.resourceContentHtml = content;
        }

        // save the resource
        saveResource( resource );

        
    }
    ( debug ) ? console.log( "textEditorUpdate() : Complete" ) : null;
    
}

/*--------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------*/



/*
 * GUI components state
 */ 
let tabs = [];
let activeTab =  null;
/*--------------------------------------------------------------------------------*/


/**
 * GUI state management methods
 */

const setActiveTab = ( tab ) => {
    ( debug ) ? console.log( "setActiveTab() : Start - tab: " + tab ) : null;
    activeTab = tab;
};

const addTab = ( tab ) => { 
    tabs.push( tab );
};

const removeTab = ( tab ) => {  
    tabs.splice( tabs.indexOf( tab ), 1 );
};

const resetTabs = () => {
    tabs = [];
    activeTab = null;
};

/*--------------------------------------------------------------------------------*/
/*--------------------------------------------------------------------------------*/





// Export members (Client state)
export { debug, dataDebug };
// Export methods to manage state
export { getCurrentWorkspace, getCurrentActiveTopic, initializeWorkspace, setActiveTopicAndResources, addNewTopic, saveActiveTopic, addNewTextResource, saveTextResource, updateTopicName, deleteTopicFromWorkspace };

// Export GUI state
export { tabs, activeTab };
// Export methods to manage GUI state
export { setActiveTab, addTab, removeTab, resetTabs };