/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 * 
 * Description: Decision Engine for dynamic input. This file deals with what should be
 * happening every so often such as paper references, tone analysis, and
 * paper structure
 * 
 * Authors: Christian Sarmiento, Luke Pecovic
 * 
 * Date Created: 7/8/2024
 * 
 * Last Updated: 7/8/2024
 */

// Imports

// state manager
import { getCurrentWorkspace, getCurrentActiveTopic, addTab, activeTab, setActiveTab, debug, dataDebug, addNewTextResource, updateTopicName, getCurrentWorkspaceOwner, getCurrentWorkspaceSharedUsers, updateUserPermission, addNewTag } from "./state/stateManager.js";
// DOM event functions (eg. 
import { textEditorUpdateEvent, tabClickEvent, tabLongClickEvent, deleteResourceEvent, addTopicEvent, deleteTagEvent } from "./editorMain.js";

// Controllers
import { getPermission } from "./controllers/clientWorkspaceController.js";
import { getResourceById, setResourceType } from "./controllers/clientResourceController.js";

// AI API Call
import { makeAPICall } from "./agnesAI.js"

// Variables
const minWordsRef = 50  // arbitrary value for paper references, can be changed

async function getDecisionEngine( resource ) {

    // Variables
    let apiCalled = false;
    let resourceTextLength = resource.resourceContentHtml.length;

    // Paper References
    if ( resourceTextLength >= minWordsRef ) {

        await makeAPICall();
        apiCalled = true;

    } // if

    // Tone Analysis
    if ( apiCalled ) {

        console.log('stuff is working!');
        setInterval(getToneAnalysis(), 120000); // every 2 minutes

    } // if


} // getDecisionEngine

export { getDecisionEngine }


