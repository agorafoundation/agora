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
import { initializeWorkspace, setActiveTopicAndResources, debug, addNewTopic, getCurrentActiveTopic, getCurrentWorkspace, saveTextResource, saveActiveTopic } from "./state/stateManager.js";

// get the data models
import { deleteResource } from "./controllers/clientResourceController.js";

// get DOM manipulation functions from modules
import { updateWorkspaceDom, createTopicEditorGui, editTopicName } from "./editorManager.js";
import { saveWorkspace } from "./controllers/clientWorkspaceController.js";



/**
 * window onLoad starts retreval for page render
 */
window.addEventListener( "load", async () => {
    ( debug ) ? console.log( "window load event: start" ) : null;

    // initialize the workspace
    await initializeWorkspace( await getWorkspaceUuid() );

    // retrieve the resources for the active topic, add them to the current state
    if( getCurrentWorkspace().topics && getCurrentWorkspace().topics.length > 0 ) {
        await setActiveTopicAndResources( getCurrentWorkspace().topics[0].topicId );
    }
    else {
        await setActiveTopicAndResources();
    }
    

    //update the workspace information in the GUI
    updateWorkspaceDom();
    
    // render the topics for the workspace
    if( getCurrentWorkspace().topics && getCurrentWorkspace().topics.length > 0 ) {
        createTopicEditorGui();
    }

    // add the event listener for adding a new topic
    addTopicEvent();
    

    /**
     * EVENT:: Event listener for saving workspace data
     */
    const workspaceTitle = document.getElementById( "workspace-title" );
    workspaceTitle.addEventListener( "change", async () => {
        ( debug ) ? console.log( "Workspace Title Change: start" ) : null;
        getCurrentWorkspace().workspaceName = workspaceTitle.value;
        await saveWorkspace( getCurrentWorkspace() );
        ( debug ) ? console.log( "Workspace Title Change: complete" ) : null;
    } );

    const workspaceDescription = document.getElementById( "workspace-desc" );
    workspaceDescription.addEventListener( "change", async () => {
        ( debug ) ? console.log( "Workspace Description Change: start" ) : null;
        getCurrentWorkspace().workspaceDescription = workspaceDescription.value;
        await saveWorkspace( getCurrentWorkspace() );
        ( debug ) ? console.log( "Workspace Description Change: complete" ) : null;
    } );


    ( debug ) ? console.log( "window load event: complete" ) : null;
} );

/**
 * EVENT:: Event listener for adding a new topic to the workspace
 */
function addTopicEvent() {
    /**
     * EVENT:: Event listener for adding a new topic
     */
    const openBtn = document.getElementById( "new-element" );
    if( openBtn ) {
        openBtn.addEventListener( "click", async () => {
            ( debug ) ? console.log( "New Topic: start" ) : null;
            
            let tname = prompt( "Enter a name for your new Topic" );
            //console.log( 'Took input from prompt' );

            await addNewTopic( tname );

            // render the topics for the workspace
            await createTopicEditorGui();

            
            ( debug ) ? console.log( "New topic: complete" ) : null;
        } );
    }
}

async function deleteResourceEvent( resourceId ) {
    let deleteConfirm = confirm( "Are you sure you want to delete this resource?" );
    if( deleteConfirm ) {
        // get the resource id from the element
        //let resourceId = e.target.id.split( "-" )[1];
        let response = await deleteResource( resourceId );
        console.log( "response: " + response );
        if ( response == "Success" ) {
            // remove the resource from the currentTopic
            getCurrentActiveTopic().resources = getCurrentActiveTopic().resources.filter( resource => resource.resourceId !== resourceId );
            // save the current topic
            saveActiveTopic();
        }
        console.log( "resourceId: " + resourceId );

        // get the resource from the current state
        //let resource = getCurrentActiveTopic().resources.find( resource => resource.resourceId === resourceId );

        // delete the resource
        //deleteResource( resource );
    }

}

async function changeTopicEvent( topicId ) {
    if ( getCurrentWorkspace() && getCurrentWorkspace().topics ) {
        /**
         * EVENT:: Entry point for changing tab event
         */
        // check to see if this is not the same tab as the active one
        if( getCurrentActiveTopic() && getCurrentActiveTopic().topicId == topicId ) {  
            ( debug ) ? console.log( "tabClickEvent() : same tab" ) : null;
        }
        else {
            await setActiveTopicAndResources( topicId );

            await createTopicEditorGui();
        }

        // add the event listener for adding a new topic
        addTopicEvent();

        
    }
}



/**
 * Event to handle saving changes to resources either because the content of the editor was changed
 * or because the resource title was updated.
 * @param {uuidv4} resourceId 
 * @param {String} content 
 */
function textEditorUpdateEvent( resourceId, content ) {
    ( debug ) ? console.log( "textEditorUpdate() : Start" ) : null;

    // get the resource from the current state
    let resource = getCurrentActiveTopic().resources.find( resource => resource.resourceId === resourceId );

    saveTextResource( resource, content );

    ( debug ) ? console.log( "textEditorUpdate() : Complete" ) : null;
}

async function tabClickEvent( event, topicId ) {
    ( debug ) ? console.log( "tabClickEvent() : Start - event: " + event + " topicId : " + topicId ) : null;

    if ( event.target.className.includes( "close-tab" ) ) {
        ( debug ) ? console.log( "tabClickEvent() : close tab event" ) : null;
        //closeTab( event.target.id );
    } 
    else {
        
        changeTopicEvent( topicId );
    }
    

    ( debug ) ? console.log( "tabClickEvent() : Complete" ) : null;
}

async function tabLongClickEvent( event, topicId ) {
    ( debug ) ? console.log( "tabDoubleClickEvent() : Start" ) : null;
    editTopicName( topicId );
    ( debug ) ? console.log( "tabDoubleClickEvent() : Complete" ) : null;
}


export { textEditorUpdateEvent, tabClickEvent, tabLongClickEvent, deleteResourceEvent };



