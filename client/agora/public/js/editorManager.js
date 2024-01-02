/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
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

/**
 * DOM manipulation functions for the editor
 */


/**
 * Tab Management
 */
// 
// // topic uuid coresponding to the active tab
// let activeTabUuid = null;
// // topic tab HTML element (eg .id = topic0, topic1, etc) for the active tab
// let activeTab = null;


// resourcesZone of the active topics tab
let resourcesZone = null;              
let totalNumberResources = 0;

// // current workspace
// let workspace = null;

// Workspace resizing
let activeHeightObj = {};
let activeHeightList = [];

export let lastEditedResourceId;

/**=
 * Public functions exported from this module
 */


/**
 * Update the editor workspace DOM
 * @param {workspace} ws 
 */
const updateWorkspaceDom = function ( ) {
    ( debug ) ? console.log( "updateWorkspaceDom() : start" ) : null;
    ( debug && dataDebug ) ? console.log( "using workspace: " + JSON.stringify( getCurrentWorkspace() ) ) : null;
    document.getElementById( "workspace-title" ).value = getCurrentWorkspace().workspaceName;
    document.getElementById( "workspace-desc" ).value = getCurrentWorkspace().workspaceDescription;
    ( debug ) ? console.log( "updateWorkspaceDom() : complete" ) : null;
};

/**
 * Renders everything on the editor page under the workspace title and info
 * Does the following:
 *  Clears the current GUI state (tabs and active tab)
 *  Renders the tabs based on the current workspaces topics
 *  Renders a topic editor area for the active topic
 *  Renders each of the resources (based on the resources attached to the active topic)
 * 
 * It might make sense to break this up into smaller functions, but for now I want to keep it all together
 * while I disect the old methods into the new to understand the flow. TODO: comeback to when done.
 */
       
const createTopicEditorGui = async function ( ) {
    ( debug ) ? console.log( "createTopicEditorGui() : start" ) : null;

    // Dom parent for tabs
    let currTabs = document.querySelector( ".tabBar" );
    // clear tabs parent
    currTabs.textContent = "";

    // create the tab to add a new topic
    let newTab = document.createElement( "span" );
    newTab.className = "material-symbols-outlined";
    newTab.id = "new-element";
    newTab.style.color = "white";
    newTab.innerHTML = "add";
    newTab.addEventListener( "click", async () => {

        ( debug ) ? console.log( "New Topic: start" ) : null;
            
        addTopicEvent();

        ( debug ) ? console.log( "New topic: complete" ) : null;

    } );

    currTabs.appendChild( newTab );

    // render the tags for the workspace

    

    // verify we have a workspace and it has topics
    
    if( getCurrentWorkspace() && getCurrentWorkspace().topics && getCurrentActiveTopic() ) {

        /**
         * create share button
         * This builds the tabs based upon the topics in the getCurrentWorkspace() model
         */
        if ( getCurrentWorkspaceOwner() ) {
            const workspaceId = getCurrentWorkspace().workspaceId;
            const shareSearchButton = document.getElementById( 'share-btn-search' );
            let ownerDetails = null, allUsers = null, sharedUsers = [];

            ownerDetails = {
                name: getCurrentWorkspaceOwner().firstName + " " + getCurrentWorkspaceOwner().lastName,
                pfp: getCurrentWorkspaceOwner().profileFilename,
                status: "Owner",
                email: getCurrentWorkspaceOwner().email,
                userId: getCurrentWorkspaceOwner().userId,
                entityId: workspaceId,
            };

            if ( getCurrentWorkspaceSharedUsers() ) {
                sharedUsers = getCurrentWorkspaceSharedUsers().map( ( entity ) => ( {
                    name: entity.first_name + " " + entity.last_name,
                    pfp: entity.profile_filename,
                    status: entity.permissionLevel.charAt( 0 ).toUpperCase() + entity.permissionLevel.slice( 1 ),
                    email: entity.email,
                    userId: entity.sharedWithUserId,
                } ) );
            }
            else {
                ( debug ) ? console.log( "Unable to retrieve shared users OR no shared users." ): null;
            }

            allUsers = [ ownerDetails, ...sharedUsers ];

            const profilesList = document.getElementById( "profiles-list" );
            profilesList.innerHTML = "";
            allUsers.forEach( ( profile ) => {
                const userProfileElement = createUserProfile( profile, getCurrentWorkspace() );
                profilesList.appendChild( userProfileElement );
            } );
            
            let name = document.getElementById( "share-modal-title" );
            name.textContent = `Share "${getCurrentWorkspace().workspaceName}"`;

            shareSearchButton.addEventListener( 'click', function () {
                shareSearchUsers( ownerDetails, allUsers );
            } );
        
            // Clear old search results before displaying new ones
            const searchedUsersContainer = document.getElementById( "searched-users" );
            searchedUsersContainer.innerHTML = "";
        }
        else {
            console.error( "Unable to retrieve workspace owner." );
        }

        /**
         * Generate the tags that are associtad with the workspace
         */
        if( getCurrentWorkspace().tags && getCurrentWorkspace().tags.length > 0 ) {
            renderTags();
        }
        
        /**
         * create the tabs for each topic above the topic editor
         * This builds the tabs based upon the topics in the getCurrentWorkspace() model
         */
        if( getCurrentWorkspace().topics.length > 0 ) {
            for( let i=0; i < getCurrentWorkspace().topics.length; i++ ) {
                // Create a new tab button
                let tabBtn = document.createElement( "button" );
                tabBtn.className = "tablinks";
                tabBtn.id = "tablinks-" + getCurrentWorkspace().topics[i].topicId;

                let tabBtnName = document.createElement( "span" );
                tabBtnName.id = "tabTopicName-" + getCurrentWorkspace().topics[i].topicId;
                if( getCurrentWorkspace().topics[i].topicName ){
                    tabBtnName.innerHTML = getCurrentWorkspace().topics[i].topicName;
                }
                else{
                    tabBtnName.innerHTML = "Untitled";
                }
                tabBtn.appendChild( tabBtnName );

                // Create close tab button
                let closeTabBtn = document.createElement( "span" );
                closeTabBtn.className = "close-tab";
                closeTabBtn.id = "close-tab-" + getCurrentWorkspace().topics[i].topicId;
                closeTabBtn.innerHTML = "&times;";
                tabBtn.appendChild( closeTabBtn );

                // click timer
                let pressTimer;
                const longPressThreshold = 500; // time in ms
                let longPressDetected = false;  // flag to indicate a long press was detected

                tabBtn.addEventListener( "mousedown", async ( e ) => {
                    // Reset the long press flag
                    longPressDetected = false;
                
                    // Clear any existing timer
                    clearTimeout( pressTimer );
                
                    pressTimer = window.setTimeout( function() {
                        longPressDetected = true; // Set the flag indicating a long press occurred
                        console.log( 'Long press activated' );
                
                        // Long click / press detected, execute the long press event
                        tabLongClickEvent( e, getCurrentWorkspace().topics[i].topicId );
                    }, longPressThreshold );
                } );
                
                tabBtn.addEventListener( 'mouseup', function( e ) {
                    // If it's a short press (not a long press)
                    if ( !longPressDetected ) {
                        // Clear the timer
                        clearTimeout( pressTimer );
                
                        // Normal click / press detected, execute the click event
                        tabClickEvent( e, getCurrentWorkspace().topics[i].topicId );
                    }
                } );
                  
                // Reset the long press flag when the mouse leaves the element
                tabBtn.addEventListener( 'mouseleave', function( e ) {
                    clearTimeout( pressTimer );
                    longPressDetected = false;
                } );        
                
                currTabs.appendChild( tabBtn );

                // push the tab into the the tabs array
                addTab( tabBtn );

                // see if this is the active tab and if so, set it.
                if( getCurrentActiveTopic().topicId == getCurrentWorkspace().topics[i].topicId ) {
                    await setActiveTab( tabBtn );
                }
                
            }
            
            refreshTabs();

        }

        /**  END: Render tabs ---------------------------------------------------------------- */

        /**
         * Create the topicEditor (the main workspace that contains the topics resources)
         */

        // Create the topicEditor (the main workspace that contains the topics resources)
        if ( getCurrentActiveTopic() && activeTab ) {
            // get dom elements
            // let tabContent = document.getElementsByClassName( "tabcontent" );
            // ( debug ) ? console.log( "tabContent: " + JSON.stringify( tabContent ) ) : null;
            // let lastTab = tabContent[tabContent.length-1];

            // create the topic editor (the main workspace that contains the topics resources)
            let topicEditor = document.getElementById( 'topic-editor' );
            topicEditor.setAttribute( "name", getCurrentActiveTopic().topicId );
            topicEditor.className = "tabcontent, topic-content";

            // // ------------------------------------------------
            // // Create drop zone at the top of the topic
            // let newDropZone = document.createElement( "div" );
            // newDropZone.classList.add( "drop-zone" );
            // newDropZone.classList.add( "first-dropzone" );

            // // Create drop zone filler div
            // let newDropZoneFiller = document.createElement( "div" );
            // newDropZoneFiller.className = "dropzone-filler";
            // newDropZone.appendChild( newDropZoneFiller );

            // // Create drop zone input
            // let newDropZoneInput = document.createElement( "input" );
            // newDropZoneInput.className = "drop-zone__input";
            // newDropZoneInput.type = "file";
            // newDropZone.appendChild( newDropZoneInput );
            // createDropZoneEventListeners( newDropZone, newDropZoneInput );
            // newDropZone.style.display = "none";
            // // ------------------------------------------------------

            // // -----------------------------------------------------
            // // Create drop zone that fills the entire topic empty state
            // let emptyDropZone = document.createElement( "div" );
            // emptyDropZone.classList.add( "drop-zone" );
            // emptyDropZone.classList.add( "empty-topic-dropzone" );

            // // Create drop zone filler div
            // let emptyDropZoneFiller = document.createElement( "div" );
            // emptyDropZoneFiller.className = "dropzone-filler";
            // emptyDropZone.appendChild( emptyDropZoneFiller );

            // // Create drop zone input
            // let emptyDropZoneInput = document.createElement( "input" );
            // emptyDropZoneInput.className = "drop-zone__input";
            // emptyDropZoneInput.type = "file";
            // emptyDropZone.appendChild( emptyDropZoneInput );
            // createDropZoneEventListeners( emptyDropZone, emptyDropZoneInput );
            // // -------------------------------------------------------------

            // let topicDivider = document.createElement( "div" );
            // topicDivider.id = "topic-divider"   ;

            resourcesZone = document.createElement( "div" );
            resourcesZone.id = "resources-zone";
            resourcesZone.className = "resources-zone";



            // let currTabs = document.querySelector( ".tab" );
            // currTabs.appendChild( tabBtn );

            // Append all elements accordingly

            // remove the default empty topic
            topicEditor.innerText = "";

            let topicBackground = document.getElementById( "topic-background" );
            topicBackground.appendChild( topicEditor );

            //topicContent.appendChild( topicTitle );
            // topicContent.appendChild( saveIcon );
            // topicEditor.appendChild( topicDivider );
            topicEditor.appendChild( resourcesZone );
            // resourcesZone.appendChild( newDropZone );
            // resourcesZone.appendChild( emptyDropZone );
            // emptyDropZone.appendChild( emptyState );

            //createDropZone( "drop-zone-initial", 0 );

            //createNewActiveHeight();
            if( getCurrentActiveTopic() && getCurrentActiveTopic().resources ) {
                for( let i=0; i < getCurrentActiveTopic().resources.length; i++ ) {
                    let currentResource = getCurrentActiveTopic().resources[i];
                       
                    // TODO: evaluate what are these two??? why are there 2?
                    await createTextArea( getCurrentActiveTopic().resources[i], i );
             
                    let editor = "sunEditor-" + ( currentResource.resourceId );

                    if( currentResource.resourceContentHtml && currentResource.resourceContentHtml.length > 0 ){
                        ( debug ) ? console.log( sunEditor[editor] ) : null;
                        sunEditor[editor][1].setContents( currentResource.resourceContentHtml );
                    }       
                    
                    document.getElementById( "suneditor_" + editor ).addEventListener( 'click', () => {
                        lastEditedResourceId = currentResource.resourceId; // Set last edited resource ID for the API call
                        let resourceName = currentResource.resourceName;
                        if( resourceName == null || resourceName == "Untitled" ){
                            resourceName = getCurrentActiveTopic().topicName;
                        }

                        document.getElementById( "current-document" ).innerHTML = resourceName; // Set the name in the Modal
                    } );

                }
                if ( getCurrentActiveTopic().resources.length === 0 ) {
                    // there are now resources, so show the empty state
                    await createTextArea( null, 0 );
                }

                
            }

            totalNumberResources = getCurrentActiveTopic().resources.length;
            if( totalNumberResources < 0 ) {
                totalNumberResources = 0;
            }

            // create a drop zone for the resource
            createDropZone( "drop-zone-end", totalNumberResources );
            
            // since we have a topic, remove the empty state
            let emptyState = document.getElementById( "workspace-empty-state" );
            emptyState.style.display = "none";

        }


        // for( let i=0; i < getCurrentWorkspace().topics.length; i++ ) {

            
    
        //     // get the topic
        //     let topic = getCurrentWorkspace().topics[i];
        //     console.log( "just got the topic: " + JSON.stringify( topic ) );

            



        //     // create a tab for each topic
        //     if ( lastTab == null ) {
        //         ( debug ) ? console.log( "empty tab" ) : null;
        //         // if there are no tabs, create the first one
        //         let workspaceEmptyState = document.getElementById( "workspace-empty-state" );
        //         workspaceEmptyState.parentNode.insertBefore( newTab, workspaceEmptyState.nextSibling );
        //         workspaceEmptyState.style.display = "none";
        //         document.getElementById( "topic-background" ).style.backgroundColor = "#3f3f3f";
        //     }
        //     else {
        //         ( debug ) ? console.log( "non-empty tab" ) : null;
        //         // add additional tab
        //         lastTab.parentNode.insertBefore( newTab, lastTab.nextSibling );
        //     }

        //     // ------------------------------------------------
        //     // Create drop zone at the top of the topic
        //     let newDropZone = document.createElement( "div" );
        //     newDropZone.classList.add( "drop-zone" );
        //     newDropZone.classList.add( "first-dropzone" );

        //     // Create drop zone filler div
        //     let newDropZoneFiller = document.createElement( "div" );
        //     newDropZoneFiller.className = "dropzone-filler";
        //     newDropZone.appendChild( newDropZoneFiller );

        //     // Create drop zone input
        //     let newDropZoneInput = document.createElement( "input" );
        //     newDropZoneInput.className = "drop-zone__input";
        //     newDropZoneInput.type = "file";
        //     newDropZone.appendChild( newDropZoneInput );
        //     createDropZoneEventListeners( newDropZone, newDropZoneInput );
        //     newDropZone.style.display = "none";
        //     // ------------------------------------------------------

        //     // -----------------------------------------------------
        //     // Create drop zone that fills the entire topic empty state
        //     let emptyDropZone = document.createElement( "div" );
        //     emptyDropZone.classList.add( "drop-zone" );
        //     emptyDropZone.classList.add( "empty-topic-dropzone" );

        //     // Create drop zone filler div
        //     let emptyDropZoneFiller = document.createElement( "div" );
        //     emptyDropZoneFiller.className = "dropzone-filler";
        //     emptyDropZone.appendChild( emptyDropZoneFiller );

        //     // Create drop zone input
        //     let emptyDropZoneInput = document.createElement( "input" );
        //     emptyDropZoneInput.className = "drop-zone__input";
        //     emptyDropZoneInput.type = "file";
        //     emptyDropZone.appendChild( emptyDropZoneInput );
        //     createDropZoneEventListeners( emptyDropZone, emptyDropZoneInput );
        //     // -------------------------------------------------------------

        //     // Create all elements within a topic -----------------------------
        //     let topicContent = document.createElement( "div" );
        //     topicContent.className = "topic-content";

        //     let topicDivider = document.createElement( "div" );
        //     topicDivider.id = "topic-divider" + i   ;

        //     resourcesZone = document.createElement( "div" );
        //     resourcesZone.id = "resources-zone" + i;
        //     resourcesZone.className = "resources-zone";

        //     let emptyState = document.createElement( "div" );
        //     emptyState.className = "empty-state";

        //     let label1 = document.createElement( "label" );
        //     label1.className = "empty-state-text";
        //     let header = document.createElement( "h3" );
        //     header.innerHTML = "Your Topic is Empty";
        //     label1.appendChild( header );

        //     let label2 = document.createElement( "label" );
        //     label2.className = "empty-state-text";
        //     label2.innerHTML = "Drop a file or tap the + above to get started!";
        //     // --------------------------------------------------------------

            

        //     let currTabs = document.querySelector( ".tab" );
        //     currTabs.appendChild( tabBtn );

        //     // Append all elements accordingly
        //     newTab.appendChild( topicContent );
        //     //topicContent.appendChild( topicTitle );
        //     // topicContent.appendChild( saveIcon );
        //     topicContent.appendChild( topicDivider );
        //     topicContent.appendChild( resourcesZone );
        //     resourcesZone.appendChild( newDropZone );
        //     resourcesZone.appendChild( emptyDropZone );
        //     emptyDropZone.appendChild( emptyState );
        //     emptyState.appendChild( label1 );
        //     emptyState.appendChild( label2 );

        //     // push the tab into the the tabs array
        //     addTab( newTab );

            

        //     createNewActiveHeight();
             
        //     console.log( "current active topic : " + JSON.stringify( getCurrentActiveTopic() ) );

        //     // iterate through the topic resources and create the editors for them if this is the active topic
        //     console.log( "topic.topicId: " + topic.topicId + " current active topic: " + getCurrentActiveTopic().topicId );
        //     if( topic.topicId == getCurrentActiveTopic().topicId ) {
        //         console.log( "2222" );
        //         // note the active tab as the current
        //         setActiveTab( newTab );
        //         console.log( "activeTab set: " + JSON.stringify( activeTab ) );
            
        //         // render the resources fo this topic
        //         // console.log( "rendering resources for topic: " + JSON.stringify( topic ) );
        //         // console.log( " active topic: " + JSON.stringify( getCurrentActiveTopic() ) );
        //         if( getCurrentActiveTopic() && getCurrentActiveTopic().resources ) {
        //             for( let i=0; i < getCurrentActiveTopic().resources.length; i++ ) {

        //                 let currentResource = getCurrentActiveTopic().resources[i];
                       
        //                 // TODO: evaluate what are these two??? why are there 2?
        //                 await createTextArea( i );
        
        //                 ( debug ) ? console.log( "renderTextArea() : Start html: " + currentResource.resourceContentHtml ) : null;
        //                 if( currentResource.resourceContentHtml && currentResource.resourceContentHtml.length > 0 ){
                                        
        //                     let editor = "sunEditor" + ( i );

        //                     ( debug ) ? console.log( sunEditor[editor] ) : null;
        //                     sunEditor[editor][1].insertHTML( currentResource.resourceContentHtml );
        //                 }        
        //             }

        //             // remove the empty state
        //             emptyState.style.display = "none";
        //         }
        //     }



        //     // Update the GUI tabs
        //     refreshTabs();


        //     ( debug ) ? console.log( "createTopicEditorGui() : complete" ) : null;
        // }
    }
    else {
        ( debug ) ? console.log( "createTopicEditorGui() : no topics to update" ) : null;
    }

    
};

/**
 * Makes the tab (topic) name editable by replacing the text with an input field
 * @param {uuid} topicId 
 */
function editTopicName( topicId ) {
    ( debug ) ? console.log( "editTopicName : Start" ) : null;

    // get the current tab button
    let tab = document.getElementById( "tablinks-" + topicId );
    let existingTopicName = document.getElementById( "tabTopicName-" + topicId ).innerHTML;

    // create a empty div to replace the tab button that will contain the input field and checkbox
    let newTab = document.createElement( "div" );
    newTab.id = "tabTopicName-" + topicId;
    newTab.className = "tablink-edit";


    // create the input field
    let input = document.createElement( "input" );
    input.type = "text";
    input.value = existingTopicName;
    input.id = "tabTopicNameInput-" + topicId;
    tab.innerHTML = "";
    input.addEventListener( 'keydown', function( event ) {
        // Check if the pressed key is the Enter key
        if ( event.key === 'Enter' ) {
            console.log( 'Enter key pressed' );
            saveTopicName( topicId );
        }
    } );
    input.addEventListener( 'blur', function( event ) {
        console.log( 'blur event' );
        saveTopicName( topicId );
    } );
    newTab.appendChild( input );

    //tab.preventDefault();

    // add a checkmark to confirm the change
    let checkmark = document.createElement( "span" );
    checkmark.setAttribute( "class", "material-symbols-outlined check-tab" );
    checkmark.id = "checkmark-" + topicId;
    checkmark.innerHTML = "check";
    newTab.appendChild( checkmark );

    // replace the tab with the newTab
    tab.parentNode.replaceChild( newTab, tab );

    // add the event listener for the checkmark to save the change
    checkmark.addEventListener( "click", async () => {
        saveTopicName( topicId );
    } );
    ( debug ) ? console.log( "editTopicName : Complete" ) : null;
}

async function saveTopicName( topicId ) {
    ( debug ) ? console.log( "checkmark-topicId - updateTopic() call : Start" ) : null;

    let topicName = document.getElementById( "tabTopicNameInput-" + topicId ).value;
    console.log( "topicName: " + topicName );
    
    // update the topic
    await updateTopicName( topicId, topicName );
    // update the gui
    createTopicEditorGui();

    ( debug ) ? console.log( "checkmark-topicId - updateTopic() call : Complete" ) : null;
}


function createTextArea( resource, position ) {
    // Text area has to be created before suneditor initialization, 
    // so we have to return a promise indicating whether or not text area has been successfully created
    let promise =  new Promise( ( resolve ) => {
        // the resource id is appended to the end of the id to make it unique, if it does not exist, because 
        // no resource is associted yet the id is appended with "-new"
        let resourceId = ( resource ) ? resource.resourceId : "-new";

        // Check for filler space
        if ( document.getElementById( "filler-space" ) ) {
            document.getElementById( "filler-space" ).remove();
        }

        

        if( resource ) {

            

            

            // title container
            let titleContainer = document.createElement( "div" );
            titleContainer.className = "title-container";
            titleContainer.id = "title-container-" + resourceId;
            titleContainer.style.display = "none";

            // Title element
            let title = document.createElement( 'input' );
            title.type = "text";
            title.className = "drop-zone__title";
            title.id = "input-title-" + resourceId;
            if( resource.resourceName ){
                title.value = resource.resourceName;
            }
            else{
                title.value = "Untitled";
            }

            
            // add the change listener for the title
            title.addEventListener( "change", async () => {
                if( await getPermission( getCurrentWorkspace().workspaceId ) != false ){
                    ( debug ) ? console.log( "title change event : Start - resourceId: " + resource.resourceId ) : null;
                    textEditorUpdateEvent( resource.resourceId, null );
                    ( debug ) ? console.log( "title change event : Complete" ) : null;
                }
                else{
                    title.readOnly = true;
                }
            } );

            resourcesZone.appendChild( titleContainer );
            titleContainer.appendChild( title );

            
            // create a drop zone for the resource
            createDropZone( resourceId, position, resource.resourceType );
            

            // Edit icon
            // let editIcon = document.createElement( 'span' );
            // editIcon.setAttribute( "class", "material-symbols-outlined" );
            // editIcon.setAttribute( "id", "edit-icon-" + resourceId );
            // editIcon.innerHTML = "edit";
            // editIcon.style.display = "none";

            // Delete icon
            let doneIcon = document.createElement( 'span' );
            doneIcon.setAttribute( "class", "material-symbols-outlined no-top-margin" );
            doneIcon.setAttribute( "id", "delete-icon-" + resourceId );
            doneIcon.innerHTML = "delete";
            doneIcon.addEventListener( "click", async () => {
                ( debug ) ? console.log( "delete-icon-resourceId - deleteResource() call : Start" ) : null;
                await deleteResourceEvent( resource.resourceId );
                // update the gui
                createTopicEditorGui();
                ( debug ) ? console.log( "delete-icon-resourceId - deleteResource() call : Complete" ) : null;
            } );

            // New Tab
            let newTabIcon = document.createElement( 'span' );
            newTabIcon.setAttribute( "class", "material-symbols-outlined" );
            newTabIcon.setAttribute( "id", "open-tab-icon-" + resourceId );
            newTabIcon.innerHTML = "open_in_new";

            // Suneditor textarea
            let sunEditor = document.createElement( "textarea" );
            sunEditor.setAttribute( "id", "sunEditor-" + resourceId );

        

            // Append elemets accordingly
            // URBG this was not in the current version without sharing (line below) might need to double checked.
            //resourcesZone.appendChild( title );
            // resourcesZone.appendChild( newTabIcon );
            // resourcesZone.appendChild( editIcon );
            titleContainer.appendChild( doneIcon );
            resourcesZone.appendChild( sunEditor );
            

            // Maintain a baseline height until 1200px is exceeded
            activeHeightObj[activeTab] += 800;
            checkActiveHeight();

            resolve( "TA created" );

        }

        
 
        // Create drop zone filler space
        // let newDropZoneFiller = document.createElement( "div" );
        // newDropZoneFiller.className = "dropzone-filler";
        // newDropZone.appendChild( newDropZoneFiller );
 
        // Create drop zone input
        // let newDropZoneInput = document.createElement( "input" );
        // newDropZoneInput.className = "drop-zone__input";
        // newDropZoneInput.type = "file";
 
        // add the new drop zone
        // newDropZone.appendChild( newDropZoneInput );
        // createDropZoneEventListeners( newDropZone, newDropZoneInput );
        

        //alert( "hold" );
        ( debug ) ? console.log( "createTextArea() complete promise cerated" ) : null;
        
    } );

    promise.then(
        ( ) => {
            createSunEditor( resource );
            

            ( debug ) ? console.log( "createTextArea() complete promise then (suneditor) completed" ) : null;
        }
    );
}



const addTagToWorkspace = async function ( tagName ) {
    
    ( debug ) ? console.log( "addTagToWorkspace() : Start" ) : null;
    console.log( "tag name:" + tagName );

                
    document.querySelector( ".tag-list" ).style.display = "none";
    // document.querySelector( "#new-tag-element" ).style.display = "none";
    document.querySelector( "#mySearch" ).value = "";

    //renderTag( tagName );


    ( debug ) ? console.log( "addTagToWorkspace() : Complete" ) : null;
};



export { updateWorkspaceDom, createTopicEditorGui, createTextArea, editTopicName, addTagToWorkspace };


/**
 * Private functions
 */

function getTabLocation( id ) {
    let tabContent = document.getElementsByClassName( "tabcontent" );
    let location = -1;
    for ( let i=0; i<tabContent.length; i++ ) {
        if ( tabContent[i].id.slice( -1 ) == id.slice( -1 ) ) {
            location = i;
        }
    }
    return location;
}

function createDropZone( resourceId, position, resourceType ) {

    // drop zone container
    let dropZoneContainer = document.createElement( "div" );
    dropZoneContainer.className = "drop-zone-container";
    dropZoneContainer.id = "drop-zone-container-" + resourceId;

    // create a toggle for the resource title and meta data and the resource type
    if( resourceId != "drop-zone-end" ) {
        let titleToggle = document.createElement( "span" );
        titleToggle.setAttribute( "class", "resource-toggle" );
        titleToggle.innerHTML = "\u21A7";
        titleToggle.title = "Show/Hide Resource Meta information / Title";
        titleToggle.setAttribute( "id", "title-toggle-" + resourceId );
        titleToggle.setAttribute( "alt", "Show/Hide Resource Meta information / Title" );
        titleToggle.addEventListener( "click", async () => {
        // shows or hides the title-contain element
            let titleContainer = document.getElementById( "title-container-" + resourceId );
            let titleToggle = document.getElementById( "title-toggle-" + resourceId );
            if( titleContainer.style.display === "none" ) {
                titleContainer.style.display = "block";
                titleToggle.innerHTML = "\u21A5";
            }
            else {
                titleContainer.style.display = "none";
                titleToggle.innerHTML = "\u21A7";
            }
        } );

        dropZoneContainer.appendChild( titleToggle );

        

    }

    // document.querySelector( '.selected-value' ).addEventListener( 'click', function() {
    //     this.nextElementSibling.style.display = 'block';
    // } );
    
    document.querySelectorAll( '.option' ).forEach( function( item ) {
        item.addEventListener( 'click', function() {
            document.querySelector( '.selected-value' ).innerText = this.innerText;
            this.parentElement.style.display = 'none';
        } );
    } );


    // Create drop zone
    let newDropZone = document.createElement( "span" );
    newDropZone.id = "create-resource-" + resourceId;
    newDropZone.title = "Create Resource Here";
    newDropZone.className = "drop-zone-new";
    // URBG: TODO removed the icon for file upload for now until / if this function in brought back.
    //newDropZone.innerHTML = "+ | <i class=\"fas fa-upload\">";
    newDropZone.innerHTML = "+";

    newDropZone.addEventListener( "click", async () => {
        /**
          * EVENT:: listener for adding a text resource via clicking the drop-zone-new
          */
        ( debug ) ? console.log( "drop-zone-resourceId - createResource() call : Start" ) : null;

        // create the new resource pass one more then the position of the current resource to add it to the end of the list
        await addNewTextResource( position );

        // update the gui
        createTopicEditorGui();


        ( debug ) ? console.log( "drop-zone-resourceId - createResource() call : Complete" ) : null;
    } );

    dropZoneContainer.appendChild( newDropZone );

    // Show an icon for the currently selected resource type that shows a div with the other options when the user hovers over it.
    if( resourceId != "drop-zone-end" ) {
        let resourceTypeList = document.createElement( "span" );
        resourceTypeList.className = "resource-type-container";
        resourceTypeList.title = "Select Resource Type";
        resourceTypeList.id = "resource-type-" + resourceId;
    
        // Text label for the icon selection
        let selectionLabel = document.createElement( "p" );
        resourceTypeList.appendChild( selectionLabel );

        // create the icon for the document type
        let documentIcon = document.createElement( "i" );
        documentIcon.className = "fa fa-file-alt fa-sm icon";
        documentIcon.id = "document-icon-" + resourceId;
        documentIcon.title = "Type: Document";
        resourceTypeList.appendChild( documentIcon );
       
        

        // creeate the icon for the research type
        let researchIcon = document.createElement( "i" );
        researchIcon.className = "fa fa-flask fa-sm icon selected";
        researchIcon.id = "research-icon-" + resourceId;
        researchIcon.title = "Type: Research";
        
        researchIcon.addEventListener( "click", async () => {
            console.log( "2" );
            setResourceType( resourceId, "research" );
        
        } );
        resourceTypeList.appendChild( researchIcon );

        // create the icon for the notes type
        let notesIcon = document.createElement( "i" );
        notesIcon.className = "fa fa-sticky-note fa-sm icon";
        notesIcon.id = "notes-icon-" + resourceId;
        notesIcon.title = "Type: Notes";
        resourceTypeList.appendChild( notesIcon );
        notesIcon.addEventListener( "click", async () => {
            console.log( "3" );
            setResourceType( resourceId, "note" );
        
        } );

        // create the icon for the collection type
        let collectionIcon = document.createElement( "i" );
        collectionIcon.className = "fa fa-boxes fa-sm icon";
        collectionIcon.id = "collection-icon-" + resourceId;
        collectionIcon.title = "Type: Collection";
        resourceTypeList.appendChild( collectionIcon );
        collectionIcon.addEventListener( "click", async () => {
            console.log( "4" );
            setResourceType( resourceId, "collection" );
        
        } );

        // add the resource type to the drop zone container
        dropZoneContainer.appendChild( resourceTypeList );

        resourceTypeList.addEventListener( "click", function( e ) {
            if ( e.target && e.target.id === "document-icon-" + resourceId ) {
                console.log( "1" );
            }
            if ( e.target && e.target.id === "research-icon-" + resourceId ) {
                console.log( "2" );
            }
            if ( e.target && e.target.id === "notes-icon-" + resourceId ) {
                console.log( "3" );
            }
            if ( e.target && e.target.id === "collection-icon-" + resourceId ) {
                console.log( "4" );
            }
        } );
        
    }


    resourcesZone.appendChild( dropZoneContainer );

    // mark the selected resource type
    console.log( "resourceType: " + resourceType );
    if ( resourceType && resourceId ) {
        document.getElementById( "document-icon-" + resourceId ).classList.remove( "selected" );
        document.getElementById( "research-icon-" + resourceId ).classList.remove( "selected" );
        document.getElementById( "notes-icon-" + resourceId ).classList.remove( "selected" );
        document.getElementById( "collection-icon-" + resourceId ).classList.remove( "selected" );
        document.getElementById( resourceType + "-icon-" + resourceId ).classList.add( "selected" );
    }
}



// Creates a height object for each open topic
// function createNewActiveHeight() {
//     let tabElements = document.querySelectorAll( '.tabcontent' );
//     activeHeightObj[tabElements[tabElements.length-1].id] = 0;
//     activeHeightList.push( activeHeightObj[tabElements[tabElements.length-1].id] );
// }


/* BEGIN Tab Functions ------------------------------------------------------------- */
// Change tabs
function refreshTabs( ) {


    ( debug ) ? console.log( "refreshTabs() : Start" ) : null;
    let i, tabcontent, tablinks;

    // activeTabUuid = tab.getAttribute( "name" );
    // activeTab = activeTab = document.getElementById( "resources-zone" + name.slice( -1 ) );

    // tabcontent = document.getElementsByClassName( "tabcontent" );
    // for ( i = 0; i < tabcontent.length; i++ ) {
    //     tabcontent[i].style.display = "none";
    // }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName( "tablinks" );
    for ( i = 0; i < tablinks.length; i++ ) {
        tablinks[i].className = tablinks[i].className.replace( " active", "" );
        tablinks[i].style.backgroundColor = "#17191a";
        tablinks[i].style.color = "white";
    }

    resourcesZone = document.getElementById( "resources-zone" + activeTab.id.split( "-" )[1] );
    //currentTagId = name.slice( -1 );

    // Show the current tab
    document.getElementById( activeTab.id ).style.display = "block";

    // Set tab button to active
    for ( i=0; i<tablinks.length; i++ ) {
        if ( tablinks[i].id.split( "-" )[1] == activeTab.id.split( "-" )[1] ) {
            tablinks[i].className += " active";
            tablinks[i].style.backgroundColor = "#3f3f3f";
        }
    }
    ( debug ) ? console.log( "refreshTabs : Complete" ) : null;
}

function closeTab( tabId ) {
    ( debug ) ? console.log( "closeTab : " + tabId ) : null;
    let tabContent = document.getElementsByClassName( "tabcontent" );
    let tablinks = document.getElementsByClassName( "tablinks" );
    let isActiveTab = false;
    let tabLocation = -1;

    let i = 0;
    while ( i<tabContent.length ) {
    // Find the tab content to be deleted
        if ( tabContent[i].id.slice( -1 ) == tabId.slice( -1 ) ) {
            // Check if the target tab is the active tab
            if ( tabId.slice( -1 ) == resourcesZone.id.slice( -1 ) ) {
                isActiveTab = true;
            }
            tabLocation = i;
        }
        i++;
    }

    if ( isActiveTab ) {
        if ( tabLocation+1 != tabContent.length ) {                                               // Open the tab to the right if there is one
            //openTab( tabContent[tabLocation+1] );
        }
        else if ( tabLocation-1 >= 0 ) {                                                          // Otherwise, open the tab to the left
            //openTab( tabContent[tabLocation-1] );
        }
        else if ( tabLocation-1 < 0 ) {                                                           // Show the workspace empty state if closing only open tab
            document.getElementById( "workspace-empty-state" ).style.display = "block";
            document.getElementById( "topic-background" ).style.backgroundColor = "#17191a";
            resourcesZone = document.getElementById( "resources-zone0" );
        }
    }
    // Remove tab button and tab content
    // Closing non-active tabs doesn't change the active tab
    tablinks[tabLocation].remove();
    tabContent[tabLocation].remove();
    ( debug ) ? console.log( "closeTab : Complete" ) : null;
}

// function getTabLocation( id ) {
//     ( debug ) ? console.log( "getTabLocation : " + id );
//     let tabContent = document.getElementsByClassName( "tabcontent" );
//     let location = -1;
//     for ( let i=0; i<tabContent.length; i++ ) {
//         if ( tabContent[i].id.slice( -1 ) == id.slice( -1 ) ) {
//             location = i;
//         }
//     }
//     ( debug ) ? console.log( "getTabLocation : Complete" );
//     return location;
// }
/* END Tab Functions ------------------------------------------------------------------- */



/* BEGIN drag and drop Functions ------------------------------------------------------------- */

// Get the target drop zone
let targetDropZone = null;
document.addEventListener( "dragenter", ( e ) => {
    targetDropZone = e.target;
} );

/**
 * 
 * @param {*} dropZone 
 * @param {*} input 
 */
function createDropZoneEventListeners( dropZone, input ) {
    dropZone.addEventListener( "dragover", ( e ) => {
        e.preventDefault();

        dropZone.firstElementChild.style.display = "block";

        if ( resourcesZone.childElementCount == 1 ||
      dropZone.className.includes( "empty-topic-dropzone" ) ) {
            dropZone.classList.add( "drop-zone--over" );
            dropZone.firstElementChild.style.display = "none";
        }
    } );

    [ "dragleave", "dragend" ].forEach( ( type ) => {
        dropZone.addEventListener( type, () => {
            dropZone.classList.remove( "drop-zone--over" );
            dropZone.firstElementChild.style.display = "none";
        } );
    } );

    dropZone.addEventListener( "drop", ( e ) => {
        e.preventDefault();
        if ( e.dataTransfer.files.length && e.dataTransfer.files[0] ) {
            if ( e.dataTransfer.files[0].size <= 1048576 ) {
                input.files = e.dataTransfer.files;
                updateThumbnail( dropZone, e.dataTransfer.files[0] );
            }
            else {
                alert( "Image size limit is 1MB!" );
            }
        }

        dropZone.classList.remove( "drop-zone--over" );
        dropZone.firstElementChild.style.display = "none";
    } );
}

function updateThumbnail( dropZoneElement, file ) {
    // Create a topic if file dropped in workspace empty state
    // TODO: evaluate
    // if ( activeTab.id == "resources-zone0" ) {
    //     createTopic();
    // } 
    // Div that holds the thumbnail
    let mydiv = document.createElement( 'div' );
    mydiv.className = "drop-zone-show";

    // Thumbnail element
    let thumbnailElement = dropZoneElement.querySelector( ".drop-zone__thumb" );
    thumbnailElement = document.createElement( "div" );
    thumbnailElement.classList.add( "drop-zone__thumb" );

    // File input element
    let inputfile = document.createElement( 'input' );
    inputfile.type = "file";
    inputfile.name = "resourceImageField";
    inputfile.className = "drop-zone__input";

    // File title element
    let inputTitle = document.createElement( 'div' );
    inputTitle.id = "input-title" + totalNumberResources;
    inputTitle.className = "drop-zone__title";

    // Preview Icon
    let previewIcon = document.createElement( 'span' );
    previewIcon.setAttribute( "class", "material-symbols-outlined" );
    previewIcon.setAttribute( "id", "preview-icon" + totalNumberResources );
    previewIcon.innerHTML = "preview";

    // New drop zone
    let newDropZone = document.createElement( "div" );
    newDropZone.className = "drop-zone";

    // New drop zone filler div
    let newDropZoneFiller = document.createElement( "div" );
    newDropZoneFiller.className = "dropzone-filler";
    newDropZone.appendChild( newDropZoneFiller );

    // New drop zone input
    let newDropZoneInput = document.createElement( "input" );
    newDropZoneInput.className = "drop-zone__input";
    newDropZoneInput.type = "file";
    newDropZone.appendChild( newDropZoneInput );
    createDropZoneEventListeners( newDropZone, newDropZoneInput );

    // Check for filler space
    if ( document.getElementById( "filler-space" ) ) {
        document.getElementById( "filler-space" ).remove();
    }
  
    // Append the thumbnail to parent div
    // Set the title to the file name
    mydiv.appendChild( thumbnailElement );
    thumbnailElement.dataset.label = file.name;
    inputTitle.innerHTML = file.name;
  
    // Show thumbnail for image files
    if ( file.type.startsWith( "image/" ) ) {
        //( debug ) ? console.log( file );
        // TODO: evaluate
        // getFile( file ).then( url => {
        //     thumbnailElement.style.backgroundImage = url;
        //     // PayloadTooLargeError: request entity too large
        //     // createResource( file.name, 2, url );
        //     ( debug ) ? console.log( "updateThumbnail - getFile - createResource() call" );
        //     createResource( file.name, 2, file.name );
        //     // ( debug ) ? console.log( url ) ;
        // } );
        
        mydiv.style.height = "500px";
        activeHeightObj[activeTab] += 500;
    }
    else {
        thumbnailElement.style.backgroundSize = "200px";
        mydiv.style.height = "200px";
        activeHeightObj[activeTab] += 200;
        ( debug ) ? console.log( "updateThumbnail - getFile - else - createResource() call" ) : null;
        // TODO: evaluate 
        //createResource( file.name, 3, null );
    }
    mydiv.appendChild( inputfile );

    // // TODO: evaluate
    // // Remove empty state if necessary
    // let location = getTabLocation( activeTab );
    // if ( mydiv.childElementCount > 0 ) {
    //     document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
    //     document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
    // }

    // File drop in topic empty state
    if ( targetDropZone === document.querySelectorAll( ".empty-state" )[location+1] ) {
        resourcesZone.firstChild.parentNode.insertBefore( inputTitle, resourcesZone.firstChild.nextSibling );
        inputTitle.parentNode.insertBefore( previewIcon, inputTitle.nextSibling );
        previewIcon.parentNode.insertBefore( mydiv, previewIcon.nextSibling );
        mydiv.parentNode.insertBefore( newDropZone, mydiv.nextSibling );
    }
    else {
        // File drop in workspace empty state
        if ( dropZoneElement === document.querySelectorAll( ".drop-zone" )[0] ) {
            resourcesZone.firstChild.parentNode.insertBefore( inputTitle, resourcesZone.firstChild.nextSibling );
        }
        else {
            targetDropZone.parentNode.insertBefore( inputTitle, targetDropZone.nextSibling );
        }
        inputTitle.parentNode.insertBefore( previewIcon, inputTitle.nextSibling );
        previewIcon.parentNode.insertBefore( mydiv, previewIcon.nextSibling );
        mydiv.parentNode.insertBefore( newDropZone, mydiv.nextSibling );
    }

    // Maintain a baseline height until 1200px is exceeded
    checkActiveHeight();
}


// Implemented to ensure resources fill a 1200px space first and then grows as needed
function checkActiveHeight() {
    if ( activeHeightObj[activeTab] < 1200 ) {
        let filler = document.createElement( "div" );
        filler.setAttribute( "id", "filler-space" );
        filler.style.height = ( 1200-activeHeightObj[activeTab] ) + "px";
        activeTab.appendChild( filler );
    }
}

// Create the sun editor and initialize within designated text area
let sunEditor = {};
let sunEditorList = [];

const createSunEditor = async( resource ) => {
    ( debug ) ? console.log( "createSunEditor() num: " + resource.currentVersion ) : null;
    // eslint-disable-next-line no-undef
    const newEditor = sunEditor["sunEditor-"+ resource.resourceId] = [ resource.resourceId, SUNEDITOR.create( "sunEditor-" + resource.resourceId, {
        toolbarContainer: "#toolbar_container",
        showPathLabel: false,
        defaultTag: "p",
        charCounter: true,
        charCounterLabel: "Char Count",
        width: "100%",
        height: "auto",
        minHeight: "40vh",
        defaultStyle: "font-size:15px;",
        // eslint-disable-next-line no-undef
        katex: katex, 
        buttonList: [
            [ "undo", "redo", "font", "fontSize", "formatBlock" ], 
            [ "fontColor", "hiliteColor", "textStyle" ],
            [
                "bold",
                "underline",
                "italic",
                "strike",
                "subscript",
                "superscript",
                "removeFormat",
            ],
            [ 'link', 'image', 'video', 'math' ],
            [ "outdent", "indent", "align", "horizontalRule", "list", "table" ],
            [
                "showBlocks",
                "codeView",
                "preview",
                "print",
                "save",
                "fullScreen",
            ],
        ],
        mode: "classic",
        // eslint-disable-next-line no-undef
        lang: SUNEDITOR_LANG.en,
        "lang(In nodejs)": "en",
    } ) ];

    newEditor[1].onChange = function( content ) {
        // ENTRY point for text editor update event, for ease of understanding function is called in editorMain.js
        textEditorUpdateEvent( resource.resourceId, content );
    };

    // focus event handler to ensure that the editor is up to date anytime the user clicks on it
    newEditor[1].onFocus = async function() {
        ( debug ) ? console.log( "sunEditor-focus - textEditorUpdateEvent() call : Start" ) : null;
        
        // get the latest version of the resource from the server 
        let latestResource = await getResourceById( resource.resourceId );
        
        if( latestResource.currentVersion > resource.currentVersion ) {
            // update the resource
            ( debug ) ? console.log( "-------------------- resource out of date with server, updating -------------------" ) : null;
            resource = latestResource;
            newEditor[1].setContents( resource.resourceContentHtml );
        }

        ( debug ) ? console.log( "sunEditor-focus - textEditorUpdateEvent() call : Complete" ) : null;
    };

    newEditor[1].onBlur = function() {
        ( debug ) ? console.log( "sunEditor-blur - textEditorUpdateEvent() call : Start" ) : null;
        //newEditor[1].disabled();
        ( debug ) ? console.log( "sunEditor-blur - textEditorUpdateEvent() call : Complete" ) : null;
    };

    sunEditorList.push( newEditor );  
    ( debug ) ? console.log( "createSunEditor() complete current editors: " ) : null;
    window.scrollTo( 0, 0 );
};

const shareSearchUsers = ( workspaceOwner, allUsers ) => {
    const shareUserSearch = document.getElementById( 'share-user-search' );
    const excludedUserIds = new Set();

    // Add workspace owner's ID to the excluded list
    excludedUserIds.add( workspaceOwner.userId );
    for ( let n = 0; n < allUsers.length; n++ ) {
        excludedUserIds.add( allUsers[n].userId );
    }

    // Fetch the list of users matching the search term
    fetch( "/api/v1/auth/user/search/" + shareUserSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
        // Clear old search results before displaying new ones
            const searchedUsersContainer = document.getElementById( "searched-users" );
            searchedUsersContainer.innerHTML = "";

            for ( let i = 0; i < response.length; i++ ) {
                const data = response[i];
            
                // Check if the user is not in the excluded list (owner or shared)
                if ( !excludedUserIds.has( data.userId ) ) {
                    createUserSearchCard( data, workspaceOwner );
                }
            }
        } );
};

// creates a user card for each user
function createUserSearchCard( userData, workspace ) {
    // Create a div element for the user card
    const card = document.createElement( "div" );
    card.className = "searched-user-card";
    const user = {
        name: userData.firstName + " " + userData.lastName,
        pfp: userData.profileFilename,
        email: userData.email,
        userId: userData.userId,
    };

    if ( user.pfp.toString().substring( 0, 7 )=="http://" || user.pfp.toString().substring( 0, 8 )=="https://" ) {
        // correct
    }
    else {
        user.pfp = "/assets/uploads/profile/" + user.pfp;
    }

    console.log( "user.pfp: " + user.pfp );

    // Create the HTML structure for the user card
    card.innerHTML = `
            <div class="profile-status-container">
                <img class="shared-profile-picture" src="${user.pfp}">
                <div class="profile-info">
                    <span class="profile-name">${user.name}</span>
                    <span class="profile-email">${user.email}</span>
                </div>
                <button class="add-user-button" style="margin-right: 10px;">Add</button>    
            </div>
        `;

    const addUserButton = card.querySelector( ".add-user-button" );
    addUserButton.addEventListener( "click", async () => {
        await fetch( "/api/v1/auth/shared/shareworkspace/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( {
                entityId: workspace.entityId,
                sharedWithUserId: user.userId,
                sharedWithEmail: user.email,
                permissionLevel: "view",
                canCopy: "false",
            } ),
        } );
      
        // Refresh the shared user list
        location.reload();
    } );

    // Get the container for searched users and append the card
    const searchedUsersContainer = document.getElementById( "searched-users" );
    searchedUsersContainer.appendChild( card );
}

function createUserProfile( profile, workspace ) {
    const li = document.createElement( "li" );
    li.className = "profile-shared-with";
    
    if ( profile.pfp.toString().substring( 0, 7 )=="http://" || profile.pfp.toString().substring( 0, 8 )=="https://" ) {
        // correct
    }
    else {
        profile.pfp = "/assets/uploads/profile/" + profile.pfp;
    }

    // Create only the necessary HTML elements based on the profile status
    li.innerHTML = `
        <div class="profile-status-container">
            <img class="shared-profile-picture" src="${profile.pfp}">
            <div class="profile-info">
                <span class="profile-name">${profile.name}</span>
                <span class="profile-email">${profile.email}</span>
            </div>
            <span class="profile-status">${profile.status}</span>
            ${profile.status !== 'Owner' ? `
            <button class="arrow down-arrow" id="toggle-button-${profile.userId}" style="margin-right: 10px;"></button>
            <div class="permissions-box" id="permissions-box-${profile.userId}" style="display: none;">
                <div class="permissions-col">
                    <span class="permission-li">
                        <button class="permission-button" data-permission="edit">Edit</button>
                    </span>
                    <span class="permission-li">  
                        <button class="permission-button" data-permission="view">View</button>
                    </span>
                    <span class="permission-li removes">
                        <button class="remove-button">Remove</button>
                    </span>
                </div> 
            </div>` : ''}
        </div>
    `;

    // Add event listeners only if the profile is not an 'Owner'
    if ( profile.status !== 'Owner' ) {
        const permissionButtons = li.querySelectorAll( ".permission-button" );
        const removeButton = li.querySelector( ".remove-button" );

        permissionButtons.forEach( button => {
            button.addEventListener( "click", async () => {
                const permission = button.getAttribute( "data-permission" );
                updateUserPermission( getCurrentWorkspace(), permission, profile );
                location.reload();
            } );
        } );

        removeButton.addEventListener( "click", async () => {
            fetch( "/api/v1/auth/shared/removeShare/", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    entityId: workspace.workspaceId,
                    sharedUserId: profile.userId,
                } ),
            } );
            location.reload();
        } );

        // Attach event listener to the toggle button
        const toggleButton = li.querySelector( `#toggle-button-${profile.userId}` );
        const permissionsBox = li.querySelector( `#permissions-box-${profile.userId}` );

        toggleButton.addEventListener( "click", () => {
            if ( permissionsBox.style.display === "none" ) {
                permissionsBox.style.display = "block";
                toggleButton.classList.remove( "down-arrow" );
                toggleButton.classList.add( "up-arrow" );
            }
            else {
                permissionsBox.style.display = "none";
                toggleButton.classList.remove( "up-arrow" );
                toggleButton.classList.add( "down-arrow" );
            }
        } );
    }

    return li;
}

/**
 * Iterates through the tags associated with the workspace and renders them in the tag list
 */
const renderTags = ( ) => {
    ( debug ) ? console.log( "renderTags() : Start" ) : null;
    const ul = document.querySelector( ".tag-list" );
    const currTags = document.getElementById( "curr-tags" );

    // clear the current tags
    currTags.innerHTML = "";
    
    ul.innerHTML = "";
    if( getCurrentWorkspace() && getCurrentWorkspace().tags ) {
        for ( let i = 0; i < getCurrentWorkspace().tags.length; i++ ) {
            renderTag( getCurrentWorkspace().tags[i].tag );
        }
    }
    ( debug ) ? console.log( "renderTags() : Complete" ) : null;
};

const renderTag = ( tag ) => {
    ( debug ) ? console.log( "renderTag() : Start" ) : null;

    const currTags = document.getElementById( "curr-tags" );
    const newTag = document.createElement( "div" );

    newTag.innerHTML = tag;
    newTag.setAttribute( "class", "styled-tags" );
    newTag.setAttribute( "id", "tag-" + newTag.innerHTML );
        
    // Create remove tag button
    let removeTagBtn = document.createElement( "span" );
    removeTagBtn.className = "close-tag";
    removeTagBtn.id = "close-tag-" + newTag.innerHTML;
    removeTagBtn.innerHTML = "&times;";
    removeTagBtn.style.color = "#aaa";


    removeTagBtn.addEventListener( "click", async () => {

        ( debug ) ? console.log( "removeTagBtn.addEventListener( click : Start for tag: " + tag ) : null;

        // // delete the tag from the workspace
        // await deleteTag( tag, "workspace", getCurrentWorkspace().workspaceId );

        // // remove the tag from the current workspace
        // getCurrentWorkspace().tags = getCurrentWorkspace().tags.filter( ( item ) => item.tag !== tag );

        await deleteTagEvent( tag );

        ( debug ) ? console.log( "removeTagBtn.addEventListener( click : Complete" ) : null;
            

    } );
    removeTagBtn.addEventListener( "mouseenter", () => {
        removeTagBtn.style.color = "black";
    } );
    removeTagBtn.addEventListener( "mouseleave", () => {
        removeTagBtn.style.color = "#aaa";
    } );

    newTag.appendChild( removeTagBtn );
    currTags.appendChild( newTag );


    ( debug ) ? console.log( "renderTag() : Complete" ) : null;
};