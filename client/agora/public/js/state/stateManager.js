// get models and controller functions from modules
import { resourceModel, saveResource } from "../controllers/clientResourceController.js";
import { topicModel, saveTopic, getTopic, getResourcesForTopic } from "../controllers/clientTopicController.js";
import { workspaceModel, saveWorkspace, getWorkspace } from "../controllers/clientWorkspaceController.js";

/**
 * Client state 
 */
// Workspace for the loaded editor
let workspace = workspaceModel;

// Active topic for the chosen tab
let activeTopic = topicModel;


/*
 * GUI components state
 */ 
let tabs = [];
let activeTab =  null;

const setActiveTab = ( tab ) => {
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

/**
 * Editor Debugging flag
 */
const debug = true;
const dataDebug = true;


/**
 * Create workspace state for the editor
 */
const initializeWorkspace = async ( workspaceUuid ) => {
    ( debug ) ? console.log( "initializeWorkspace() : Start" ) : null;
    workspace = await getWorkspace( workspaceUuid );
    //( debug ) ? console.log( "initializeWorkspace() : workspace: " + JSON.stringify( workspace ) );
    ( debug ) ? console.log( "initializeWorkspace() : Complete" ) : null;

};

const getCurrentWorkspace = ( ) => {
    return workspace;
};

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
    if( !topicId && workspace.topics ) {
        topicId = workspace.topics[0].topicId;
    }
    
    // if there are topics in the workspace, set the active topic using the id passed or the first topic in the workspace
    if( topicId && workspace.topics ) {
        activeTopic = workspace.topics.find( topic => topic.topicId === topicId );
        console.log( "activeTopic: " + JSON.stringify( activeTopic ) ); 

        // get the resources for the active topic
        if( activeTopic ) {
            const resources = await getResourcesForTopic( activeTopic.topicId );
            console.log( "resources: " + JSON.stringify( resources ) );
            
            if( resources ) {
                activeTopic.resources = await resources;
                ( debug && dataDebug ) ? console.log( "topic resources: " + JSON.stringify( activeTopic.resources ) ) : null;
            }

        }
    }
    else {
        // there are currently no topics in the workspace, create a new one
        activeTopic = topicModel;
        activeTopic.topicName = "Untitled";
        activeTopic.topicDescription = "";
        workspace.topics.push( activeTopic );
    }

    ( debug ) ? console.log( "setActiveTopicAndResources() : Complete" ) : null;
};

// Export members (Client state)
export { debug, dataDebug };
// Export methods to manage state
export { getCurrentWorkspace, getCurrentActiveTopic, initializeWorkspace, setActiveTopicAndResources};

// Export GUI state
export { tabs, activeTab };
// Export methods to manage GUI state
export { setActiveTab, addTab, removeTab, resetTabs };