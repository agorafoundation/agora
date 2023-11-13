/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * Main entry point for the Agora Editor
 */

// get models and controller functions from modules
import { resourceModel, saveResource } from "./controllers/clientResourceController.js";
import { topicModel, saveTopic, getTopic, getResourcesForTopic } from "./controllers/clientTopicController.js";
import { workspaceModel, saveWorkspace, getWorkspace } from "./controllers/clientWorkspaceController.js";

// get utility functions from modules
import { getWorkspaceUuid } from "./util/editorUtil.js";

// get DOM manipulation functions from modules
import { activeTabUuid, updateWorkspaceDom, updateTopicsDom, createTextArea, renderTextArea } from "./editorManager.js";

/**
 * Global editor variables
 */
let workspace = workspaceModel;



/**
 * window onLoad starts retreval for page render
 */
window.addEventListener( "load", async () => {
    console.log( "window load event: start" );

    // fetch the workspace and it's topics
    workspace = await getWorkspace( getWorkspaceUuid() );

    //update the workspace information in the GUI
    updateWorkspaceDom( workspace.results );

    // create the topics
    updateTopicsDom();

    // show the current tab
    console.log( "the active tab is: " + activeTabUuid );

    // retrieve the resources for the active topic
    await retrieveResourcesForTopic( activeTabUuid );

    console.log( "----------------------------------------------------------" );

    // render resources for the active topic
    renderResourcesForTopic( activeTabUuid );

    

    // render the current tabs resources
    //updateResourcesDom();


    // // fetch the workspace
    // await fetchWorkspace();
    // console.log( "about to run getTags" );
    // getTags();
    // console.log( "about to run render topics" );
    // renderTopics();
    console.log( "window load event: complete" );
} );

const retrieveResourcesForTopic = async function ( topicId ) {
    if( topicId && workspace.results.topics ) {
        const topic = workspace.results.topics.find( topic => topic.topicId === topicId );
        console.log( "topic matching open tab: " + JSON.stringify( topic ) );
        if( topic ) {
            const resources = await getResourcesForTopic( topicId );
            
            if( resources ) {
                topic.resources = await resources.results;
                console.log( "topic resources: " + JSON.stringify( topic.resources ) );
            }
            
        }
        
    }
};

const renderResourcesForTopic = async function ( topicId ) {
    console.log( "renderResourcesForTopic() : Start" );
    if( topicId && workspace.results.topics ) {
        const topic = workspace.results.topics.find( topic => topic.topicId === topicId );
        console.log( "topic matching open tab: " + JSON.stringify( topic ) );
        if( topic && topic.resources ) {
            for( let i=0; i < topic.resources.length; i++ ) {
                await createTextArea( topic.resources[i].resourceName, i );

                renderTextArea( topic.resources[i].resourceContentHtml, i );

            }
        }
    }
    console.log( "renderResourcesForTopic() : End" );
};


