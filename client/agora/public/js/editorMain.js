/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * Main entry point for the Agora Editor
 */



// get utility functions from modules
import { getWorkspaceUuid } from "./util/editorUtil.js";

// get the state manager
import { initializeWorkspace, setActiveTopicAndResources, debug, dataDebug } from "./state/stateManager.js";

// get DOM manipulation functions from modules
import { updateWorkspaceDom, createTopicsGui, renderResourcesForActiveTopic } from "./editorManager.js";





/**
 * window onLoad starts retreval for page render
 */
window.addEventListener( "load", async () => {
    ( debug ) ? console.log( "window load event: start" ) : null;

    // initialize the workspace
    await initializeWorkspace( await getWorkspaceUuid() );

    // retrieve the resources for the active topic, add them to the current state
    await setActiveTopicAndResources();

    //update the workspace information in the GUI
    updateWorkspaceDom();
    
    // render the topics for the workspace
    createTopicsGui();

    // render resources for the active topic
    renderResourcesForActiveTopic();

    

    // render the current tabs resources
    //updateResourcesDom();


    // // fetch the workspace
    // await fetchWorkspace();
    // console.log( "about to run getTags" );
    // getTags();
    // console.log( "about to run render topics" );
    // renderTopics();
    ( debug ) ? console.log( "window load event: complete" ) : null;
} );






