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
import { topicModel, saveTopic, getTopic } from "./controllers/clientTopicController.js";
import { workspaceModel, saveWorkspace, getWorkspace } from "./controllers/clientWorkspaceController.js";

// get utility functions from modules
import { getWorkspaceUuid } from "./util/editorUtil.js";

// get DOM manipulation functions from modules
import { updateWorkspaceDom, updateTopicsDom } from "./editorManager.js";

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


    // // fetch the workspace
    // await fetchWorkspace();
    // console.log( "about to run getTags" );
    // getTags();
    // console.log( "about to run render topics" );
    // renderTopics();
    console.log( "window load event: complete" );
} );