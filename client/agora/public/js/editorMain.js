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
import { initializeWorkspace, setActiveTopicAndResources, debug, dataDebug, getCurrentActiveTopic } from "./state/stateManager.js";

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

    ( debug ) ? console.log( "window load event: complete" ) : null;
} );



const openBtn = document.getElementById( "new-element" );
if( openBtn ) {
    ( debug ) ? console.log( "New Topic: start" ) : null;

    openBtn.onclick = async () => {
        //modal.style.display = "block";
        let tname = prompt( "Enter a name for your new Topic" );
        //console.log( 'Took input from prompt' );

        console.log( "main click event - createResource() call" );
        const newResource = await createResource( null, 1, null, null );
        console.log( "newResource: " + JSON.stringify( newResource ) );

        console.log( "main click event - createTopic() call" );
        const newTopic = await createTopic( null, tname );
        console.log( "newTopic: " + JSON.stringify( newTopic ) );

        // render the resource text area
        createTextArea();
        
        numTopics++;

        // this is where i should call updateTopic sending the topic id retrieved from createTopic??
        
    };
    ( debug ) ? console.log( "New topic: complete" ) : null;
}






