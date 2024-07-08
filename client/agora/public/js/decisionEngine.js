/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * imports
 */
// state manager
import { getCurrentWorkspace, getCurrentActiveTopic, addTab, activeTab, setActiveTab, debug, dataDebug, addNewTextResource, updateTopicName, getCurrentWorkspaceOwner, getCurrentWorkspaceSharedUsers, updateUserPermission, addNewTag } from "./state/stateManager.js";
// DOM event functions (eg. 
import { textEditorUpdateEvent, tabClickEvent, tabLongClickEvent, deleteResourceEvent, addTopicEvent, deleteTagEvent } from "./editorMain.js";

// Controllers
import { getPermission } from "./controllers/clientWorkspaceController.js";
import { getResourceById, setResourceType } from "./controllers/clientResourceController.js";

// AI API Call
import { makeAPICall } from "./agnesAI.js"


