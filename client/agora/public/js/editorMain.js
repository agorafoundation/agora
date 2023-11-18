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
import { initializeWorkspace, setActiveTopicAndResources, debug, addNewTopic, getCurrentWorkspace } from "./state/stateManager.js";

// get DOM manipulation functions from modules
import { updateWorkspaceDom, createTopicEditorGui } from "./editorManager.js";





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
    createTopicEditorGui();


    /**
     * Event listener for adding a new topic
     */
    const openBtn = document.getElementById( "new-element" );
    if( openBtn ) {
        openBtn.addEventListener( "click", async () => {
            ( debug ) ? console.log( "New Topic: start" ) : null;

            // make sure the worspace fields are up to date
            getCurrentWorkspace().name = document.getElementById( "workspace-title" ).value;
            getCurrentWorkspace().description = document.getElementById( "workspace-desc" ).value;
            
            let tname = prompt( "Enter a name for your new Topic" );
            //console.log( 'Took input from prompt' );

            await addNewTopic( tname );

            // render the topics for the workspace
            await createTopicEditorGui();

        
            
            ( debug ) ? console.log( "New topic: complete" ) : null;
        } );


    
    }

    ( debug ) ? console.log( "window load event: complete" ) : null;
} );










