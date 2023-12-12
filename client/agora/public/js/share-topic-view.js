// /**
//  * Agora - Close the loop
//  * © 2021-2023 Brian Gormanly
//  * BSD 3-Clause License
//  * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
//  */

// // get models and controller functions from modules
// import { createNewResource, saveResource } from "./controllers/clientResourceController.js";
// import { createNewTopic, saveTopic, getTopic } from "./controllers/clientTopicController.js";
// import { getWorkspace } from "./controllers/clientWorkspaceController.js";

// /** Globals */
// let resources = [];
// let numResources = 0;

// let numTopics = 0;
// let topics = [];



// // keeps track of the current topic tab identifier. When a user selects a tab, the div with name
// // matching this tabName is displayed. The divs have a class 'tabcontent'.
// let tabName = "";

// // Workspace resizing
// let activeHeightObj = {};
// let activeHeightList = [];

// // Creates a height object for each open topic
// function createNewActiveHeight() {
//     let tabElements = document.querySelectorAll( '.tabcontent' );
//     activeHeightObj[tabElements[tabElements.length-1].id] = 0;
//     activeHeightList.push( activeHeightObj[tabElements[tabElements.length-1].id] );
// }

// // Implemented to ensure resources fill a 1200px space first and then grows as needed
// function checkActiveHeight() {
//     if ( activeHeightObj[tabName] < 1200 ) {
//         let filler = document.createElement( "div" );
//         filler.setAttribute( "id", "filler-space" );
//         filler.style.height = ( 1200-activeHeightObj[tabName] ) + "px";
//         activeTab.appendChild( filler );
//     }
// }


// /* Topic Functions -------------------------------------------------------------------------- */
// // let numTopics = 1;
// // let topics = {};

// // Renders a new topic
// const createTopic = async( id, name ) => {
//     let tabContent = document.getElementsByClassName( "tabcontent" );
//     let lastTab = tabContent[tabContent.length-1];
//     let newTab = document.createElement( "div" );

//     // Create the tab content and append to last tab
//     newTab.id = "topic" + numTopics;
//     newTab.className = "tabcontent";

//     // If no topics are open...
//     if ( lastTab == null ) {
//         let workspaceEmptyState = document.getElementById( "workspace-empty-state" );
//         workspaceEmptyState.parentNode.insertBefore( newTab, workspaceEmptyState.nextSibling );
//         workspaceEmptyState.style.display = "none";
//         document.getElementById( "topic-background" ).style.backgroundColor = "#3f3f3f";
//     }
//     else {
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

//     let topicTitle = document.createElement( "input" );
//     topicTitle.type = "text";
//     topicTitle.className = "topic-title";
//     topicTitle.style.borderRadius = "5px";
//     topicTitle.id = "topic-title" + numTopics;
//     if( name ){
//         topicTitle.value = name;
//     }
//     else{
//         topicTitle.value = "Untitled";
//     }
//     if( editPermission == false ){
//         topicTitle.readOnly = true;
//     }
//     // let saveIcon = document.createElement( "span" );
//     // saveIcon.classList.add( "material-symbols-outlined" );
//     // saveIcon.classList.add( "saveBtn" );
//     // saveIcon.id = "save" + numTopics;
//     // saveIcon.innerHTML = "save_as";
//     // saveIcon.onclick = () => {
//     //     let resources = getResources();
//     //     updateTopic( topicTitle.value, resources );
//     // };

//     let topicDivider = document.createElement( "div" );
//     topicDivider.id = "topic-divider" + numTopics   ;

//     let resourcesZone = document.createElement( "div" );
//     resourcesZone.id = "resources-zone" + numTopics;
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

//     // Create a new tab button
//     let tabBtn = document.createElement( "button" );
//     tabBtn.className = "tablinks";
//     tabBtn.id = "tablinks" + numTopics;
//     if( name ){
//         tabBtn.innerHTML = name;
//     }
//     else{
//         tabBtn.innerHTML = "Untitled";
//     }

//     // Create close tab button
//     let closeTabBtn = document.createElement( "span" );
//     closeTabBtn.className = "close-tab";
//     closeTabBtn.id = "close-tab" + numTopics;
//     closeTabBtn.innerHTML = "&times;";
//     tabBtn.appendChild( closeTabBtn );

//     tabBtn.onclick = ( e ) => {
//         if ( e.target.className.includes( "close-tab" ) ) {
//             if( editPermission == true ){
//                 closeTab( e.target.id );
//             }
//         } 
//         else {
//             openTab( newTab.id );            
//         }
//     };

//     let currTabs = document.querySelector( ".tab" );
//     currTabs.appendChild( tabBtn );

//     // Append all elements accordingly
//     newTab.appendChild( topicContent );
//     topicContent.appendChild( topicTitle );
//     // topicContent.appendChild( saveIcon );
//     topicContent.appendChild( topicDivider );
//     topicContent.appendChild( resourcesZone );
//     resourcesZone.appendChild( newDropZone );
//     resourcesZone.appendChild( emptyDropZone );
//     emptyDropZone.appendChild( emptyState );
//     emptyState.appendChild( label1 );
//     emptyState.appendChild( label2 );

//     createNewActiveHeight();
//     openTab( newTab.id );

//     if( !id ) {
//         const response = await fetch( "api/v1/auth/topics", {
//             method: "POST",
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify( {
//                 "topicType": 1,
//                 "topicName": "Untitled",
//                 "topicDescription": "",
//                 "topicHtml": "",
//                 "assessmentId": 1,
//                 "hasActivity": false,
//                 "hasAssessment": false,
//                 "activityId": 1,
//                 "active": true,
//                 "visibility": "private",
//                 "resources": [],
//                 "createTime": Date.now(),
//             } )
//         } );

//         if( response.ok ) {
//             const data = await response.json();
//             // map the resulting topic id to the value used in topic elements
//             topics[numTopics] = data.topicId;
//             numTopics++;
//             //console.log( topics );
//             saveWorkspace( topics );
//         }
//     }
//     else{
//         topics[numTopics] = id;
//         numTopics ++;
//     }
// };



// // Updates topic name
// const updateTopic = async( name ) => {
//     let isRequired = [];
//     let resources = getResources();
//     for( let i = 0; i < resources.length; i++ ){
//         isRequired.push( "true" );
//     }
//     let id = getCurrTopicID();
//     const response = await fetch( "api/v1/auth/topics", {
//         method: "POST",
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify( {
//             "topicId": id,
//             "topicName": name ? name : "Untitled",
//             "resources": resources ? resources : [],
//             "resourcesRequired": isRequired,
//             "visibility": "private",
//             "isRequired": true
//         } )
//     } );

//     if( response.ok ) {
//         const data = await response.json();
//     }
// };
// /* END Topic Functions -------------------------------------------------------------------------------------- */

// /*WORKSPACE function */
// const saveWorkspace = async( topics ) => {
//     const topicsList = Object.values( topics );


//     const [ isTopic, workspaceId ] = getPrefixAndId();
//     let name = document.getElementById( "workspace-title" ).value;
//     let description = document.getElementById( "workspace-desc" ).value;

//     const response = await fetch( "api/v1/auth/workspaces", {
//         method: "POST",
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify( {
//             "workspaceId": workspaceId,
//             "workspaceName": name,
//             "workspaceDescription": description,
//             "topics": topicsList,
//             "active":true,
//             "visibility": "private"
//         } )
//     } );

//     if( response.ok ) {
//         const data = await response.json();
//         //console.log( JSON.stringify( data ) );
//     }
// };



// let activeTab = null;


// // Change tabs
// function openTab( name ) {
//     tabName = name;
//     //console.log( tabName );
//     let i, tabcontent, tablinks;

//     tabcontent = document.getElementsByClassName( "tabcontent" );
//     for ( i = 0; i < tabcontent.length; i++ ) {
//         tabcontent[i].style.display = "none";
//     }

//     // Get all elements with class="tablinks" and remove the class "active"
//     tablinks = document.getElementsByClassName( "tablinks" );
//     for ( i = 0; i < tablinks.length; i++ ) {
//         tablinks[i].className = tablinks[i].className.replace( " active", "" );
//         tablinks[i].style.backgroundColor = "#17191a";
//         tablinks[i].style.color = "white";
//     }

//     activeTab = document.getElementById( "resources-zone" + name.slice( -1 ) );

//     // Show the current tab
//     document.getElementById( name ).style.display = "block";

//     // Set tab button to active
//     for ( i=0; i<tablinks.length; i++ ) {
//         if ( tablinks[i].id.slice( -1 ) == name.slice( -1 ) ) {
//             tablinks[i].className += " active";
//             tablinks[i].style.backgroundColor = "#3f3f3f";
//         }
//     }
// }

// function closeTab( id ) {
//     let tabContent = document.getElementsByClassName( "tabcontent" );
//     let tablinks = document.getElementsByClassName( "tablinks" );
//     let isActiveTab = false;
//     let tabLocation = -1;

//     let i = 0;
//     while ( i<tabContent.length ) {
//     // Find the tab content to be deleted
//         if ( tabContent[i].id.slice( -1 ) == id.slice( -1 ) ) {
//             // Check if the target tab is the active tab
//             if ( id.slice( -1 ) == activeTab.id.slice( -1 ) ) {
//                 isActiveTab = true;
//             }
//             tabLocation = i;
//         }
//         i++;
//     }

//     if ( isActiveTab ) {
//         if ( tabLocation+1 != tabContent.length ) {                                               // Open the tab to the right if there is one
//             openTab( tabContent[tabLocation+1].id );
//         }
//         else if ( tabLocation-1 >= 0 ) {                                                          // Otherwise, open the tab to the left
//             openTab( tabContent[tabLocation-1].id );
//         }
//         else if ( tabLocation-1 < 0 ) {                                                           // Show the workspace empty state if closing only open tab
//             document.getElementById( "workspace-empty-state" ).style.display = "block";
//             document.getElementById( "topic-background" ).style.backgroundColor = "#17191a";
//             activeTab = document.getElementById( "resources-zone0" );
//         }
//     }
//     // Remove tab button and tab content
//     // Closing non-active tabs doesn't change the active tab
//     tablinks[tabLocation].remove();
//     tabContent[tabLocation].remove();
// }

// function getTabLocation( id ) {
//     let tabContent = document.getElementsByClassName( "tabcontent" );
//     let location = -1;
//     for ( let i=0; i<tabContent.length; i++ ) {
//         if ( tabContent[i].id.slice( -1 ) == id.slice( -1 ) ) {
//             location = i;
//         }
//     }
//     return location;
// }
// /* END Tab Functions ------------------------------------------------------------------- */







// /* Tag Functions ------------------------------------------------------------------- */
// if( document.getElementById( "mySearch" ) ) {
//     document.getElementById( "mySearch" ).addEventListener( "keyup", () => {
//         let input, filter, ul, li, tag, i;
//         input = document.getElementById( "mySearch" );
//         filter = input.value.toUpperCase();
//         ul = document.querySelector( ".tag-list" );
//         li = ul.getElementsByTagName( "li" );

//         if ( filter == "" ) {
//             ul.style.display = "none";
//         }
//         else {
//             ul.style.display = "block";
//             // Hide items that don't match search query
//             for ( i = 0; i < li.length; i++ ) {
//                 tag = li[i].innerHTML;
//                 if ( tag.toUpperCase().indexOf( filter ) > -1 ) {
//                     li[i].style.display = "block";
//                 }
//                 else {
//                     li[i].style.display = "none";
//                 }
//             }
//         }
//     // Always show new tag option
//     // document.querySelector( "#new-tag-element" ).style.display = "block";
//     } );
// }

// // document.getElementById( "new-tag-element" ).addEventListener( "click", () => {
// //     const tagName = document.getElementById( "mySearch" ).value;
// //     newTag( tagName );
// // } );

// let currTagList = [];
// function newTag( tagName, isNewSave ) {
//     const ul = document.querySelector( ".tag-list" );
//     const li = document.createElement( "li" );
//     const searchList = document.querySelectorAll( ".tag-list-element" );

//     // check that selected tag doesn't already exist
//     let isActiveTag = false;
//     for ( let i = 0; i < currTagList.length; i++ ) {
//         if ( currTagList[i] ===  tagName ) {
//             isActiveTag = true;
//         }
//     }
//     if ( !isActiveTag ) {
//         let wasSearched = false;
//         for ( let i=0; i<searchList.length; i++ ) {
//             if ( searchList[i].innerHTML === tagName ) {
//                 wasSearched = true;
//             }
//         }
//         if ( !wasSearched ) {
//             // Add the new tag to the search list if it doesn't already exist
//             ul.appendChild( li );
//             li.addEventListener( "click", () => {
//                 newTag( tagName, isNewSave );
//             } );
//         }

//         // create the tag and add to existing tags
//         li.setAttribute( "class", "tag-list-element" );
//         li.innerHTML = tagName;
//         addTagToWorkspace( li, isNewSave );
//         currTagList.push( tagName );
//     }
// }

// // Add new tag by pressing enter key
// let ul = document.querySelector( ".tag-list" );
// document.addEventListener( "keyup", function( e ) {
//     if(  document.getElementById( "mySearch" ) ) {
//         const tagName = document.getElementById( "mySearch" ).value;
//         if ( e.key == "Enter" && ul.style.display == "block" ) {
//             newTag( tagName, true );
//             document.querySelector( ".tag-list" ).style.display = "none";
//             // document.querySelector( "#new-tag-element" ).style.display = "none";
//             document.querySelector( "#mySearch" ).value = "";
//         }
//     }
    
// } );

// function addTagToWorkspace( selectedTag, isNewSave ) {
//     const currTags = document.getElementById( "curr-tags" );
//     const newTag = document.createElement( "div" );

//     const [ isTopic, workspaceId ] = getPrefixAndId();
//     const tagType = isTopic ? "topic" : "workspace";


//     newTag.innerHTML = selectedTag.innerHTML;
//     newTag.setAttribute( "class", "styled-tags" );
//     newTag.setAttribute( "id", "tag-" + newTag.innerHTML );
        
//     // Create remove tag button
//     let removeTagBtn = document.createElement( "span" );
//     removeTagBtn.className = "close-tag";
//     removeTagBtn.id = "close-tag-" + newTag.innerHTML;
//     removeTagBtn.innerHTML = "&times;";
//     removeTagBtn.style.color = "#aaa";

//     // make the fetch call to save the tag
//     if( isNewSave ) {
//         //console.log( "sending tag with workspaceId: " + workspaceId + " and tagType: " + tagType + " and tag: " + newTag.innerHTML + "" );
//         fetch( "api/v1/auth/tags/tagged", {
//             method: "POST",
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify( {
//                 "tag": {
//                     "tag": newTag.innerHTML
//                 },
//                 entityType: tagType,
//                 entityId: workspaceId,
//                 active: true
//             } )
//         } )
//             .then( response => response.json() )
//             .then( ( data ) => {
//                 //console.log( "success saving tagged" );
//             } );
//     }

//     removeTagBtn.addEventListener( "click", () => {
//         if ( editPermission == true ){
//             // Get the id portion with the tag name
//             document.getElementById( "tag-" + removeTagBtn.id.substring( 10 ) ).remove();
//             for ( let i=0; i<currTagList.length; i++ ) {
//                 if ( removeTagBtn.id.substring( 10 ) === currTagList[i] ) {
//                     currTagList[i] = "";
//                 }
//             }
//         }
        

//         const [ isTopic, id ] = getPrefixAndId();
//         const tagType = isTopic ? "topic" : "workspace";

//         // call the .delete on the tagged
//         //console.log( "tag name to delete: " + removeTagBtn.id.substring( 10 ) + "/" + tagType + "/" + id );
//         fetch( "api/v1/auth/tags/tagged/" + removeTagBtn.id.substring( 10 ) + "/" + tagType + "/" + id, {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//         } );
            

//     } );
//     removeTagBtn.addEventListener( "mouseenter", () => {
//         removeTagBtn.style.color = "black";
//     } );
//     removeTagBtn.addEventListener( "mouseleave", () => {
//         removeTagBtn.style.color = "#aaa";
//     } );

//     newTag.appendChild( removeTagBtn );
//     currTags.appendChild( newTag );
// }
// /* END Tag Functions ----------------------------------------------------------------------------------- */





// // comment out to identify all of the areas using the previous approach

// // get the topic uuid id based on the currently visible topic tab
// // function getCurrTopicID() {
// //     let topicID = null;
// //     if( tabName ) {
// //         let topicVal = tabName.match( /\d+/g )[0];
// //         topicID = topics[topicVal];
// //     //console.log( "returning topic id: " + topicID );
// //     }
// //     else {
// //         topicID = 0;
// //     }
// //     return topicID;
// // }

// // create a new resource
// function createResource( name, type, imagePath, id ) {
//     //console.log( "createResource call: " + name + ", " + type + ", " + imagePath + ", " + id );
//     if( !id ){
//         fetch( "api/v1/auth/resources", {
//             method: "POST",
//             headers: {'Content-Type': 'application/json'},
//             body: JSON.stringify( {
//                 "resourceType": type,
//                 "resourceName": name ? name : "Untitled",
//                 "resourceDescription": "",
//                 "resourceContentHtml": "",
//                 "resourceImage": imagePath ? imagePath : "",
//                 "resourceLink": "",
//                 "isRequired": true,
//                 "active": true,
//                 "visibility": "private"
//             } )
//         } )
//             .then( response => response.json() )
//             .then( ( data ) => {
//                 //console.log( "new resource data: " + JSON.stringify( data ) );
//                 resources[numResources] = [ data.resourceId, getCurrTopicID() ];
//                 //console.log( "added resource: " + JSON.stringify( resources[numResources] ) );
//                 numResources++;

//                 // map the new resource to the associated topic
//                 let topicTitle = document.getElementById( 'topic-title' + tabName.match( /\d+/g )[0] ).value;
//                 //console.log( "topic title: " + topicTitle );
//                 updateTopic( topicTitle );
//             } );
//     }
//     else{
//         resources[numResources] = [ id, getCurrTopicID() ];
//         numResources ++;
       
//     }
   
// }

// // get the topic id based on the visible topic tab
// function getCurrTopicID() {
//     let topicVal = tabName.match( /\d+/g )[0];
//     let topicID = topics[topicVal];
//     //console.log( "returning topic id: " + topicID );
//     return topicID;
// }

// // returns an array of resource id's within a given topic, sorted by position
// function getResources() {
//     let topicResources = document.querySelectorAll( '.drop-zone__title' );
//     let sorted = [];
//     for ( let i=0; i<topicResources.length; i++ ) {
//         if ( topicResources[i].style.display == 'none' ) {
//             //console.log( true );
//         }
//         let val = topicResources[i].id.match( /\d+/g )[0];
//         let propertyNames = Object.getOwnPropertyNames( resources );
//         for ( let j=0; j<propertyNames.length; j++ ) {
//             if ( val == propertyNames[j] && resources[val][1] == getCurrTopicID() ) {
//                 sorted.push ( resources[val][0] );
//             }
//         }
//     }
//     return sorted;
// }

// // Create the suneditor text area

// function createTextArea( name, id ) {
//     // Text area has to be created before suneditor initialization, 
//     // so we have to return a promise indicating whether or not text area has been successfully created
//     let promise =  new Promise( ( resolve ) => {
//         // workspace empty state
//         if ( activeTab.id == "resources-zone0" ) {
//             createTopic();
//         }

//         // Check for filler space
//         if ( document.getElementById( "filler-space" ) ) {
//             document.getElementById( "filler-space" ).remove();
//         }

//         // Create drop zone
//         let newDropZone = document.createElement( "div" );
//         newDropZone.className = "drop-zone";

//         // Create drop zone filler space
//         let newDropZoneFiller = document.createElement( "div" );
//         newDropZoneFiller.className = "dropzone-filler";
//         newDropZone.appendChild( newDropZoneFiller );

//         // Create drop zone input
//         let newDropZoneInput = document.createElement( "input" );
//         newDropZoneInput.className = "drop-zone__input";
//         newDropZoneInput.type = "file";
//         newDropZone.appendChild( newDropZoneInput );
//         createDropZoneEventListeners( newDropZone, newDropZoneInput );

//         // Title element
//         let title = document.createElement( 'input' );
//         title.type = "text";
//         title.className = "drop-zone__title";
//         title.id = "input-title" + numResources;
//         if( name ){
//             title.value = name;
//         }
//         else{
//             title.value = "Untitled";
//         }

//         if( editPermission == false ){
//             title.readOnly = true;
//         }

//         // Edit icon
//         let editIcon = document.createElement( 'span' );
//         editIcon.setAttribute( "class", "material-symbols-outlined" );
//         editIcon.setAttribute( "id", "edit-icon" + numResources );
//         editIcon.innerHTML = "edit";
//         editIcon.style.display = "none";

//         // Done icon
//         let doneIcon = document.createElement( 'span' );
//         doneIcon.setAttribute( "class", "material-symbols-outlined" );
//         doneIcon.setAttribute( "id", "done-icon" + numResources );
//         doneIcon.innerHTML = "done";

//         // New Tab
//         let newTabIcon = document.createElement( 'span' );
//         newTabIcon.setAttribute( "class", "material-symbols-outlined" );
//         newTabIcon.setAttribute( "id", "open-tab-icon" + numResources );
//         newTabIcon.innerHTML = "open_in_new";

//         // Suneditor textarea
//         let sunEditor = document.createElement( "textarea" );
//         sunEditor.setAttribute( "id", "sunEditor" + numResources );

//         // Remove empty state if necessary
//         if ( activeTab.childElementCount > 0 ) {
//             let location = getTabLocation( tabName );
//             document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
//             document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
//         }

//         // Append elemets accordingly
//         activeTab.appendChild( title );
//         // activeTab.appendChild( newTabIcon );
//         activeTab.appendChild( editIcon );
//         activeTab.appendChild( doneIcon );
//         activeTab.appendChild( sunEditor );
//         activeTab.appendChild( newDropZone );

//         // Maintain a baseline height until 1200px is exceeded
//         activeHeightObj[tabName] += 800;
//         checkActiveHeight();
//         resolve( "TA created" );
//     } );

//     promise.then(
//         ( value ) => {
//             createSunEditor();
//             if( name ){
//                 createResource( name, 1, null, id  );
//             }
//             else{
//                 createResource( null, 1, null );
//             }
//         }
//     );
// }


// // Create the sun editor and initialize within designated text area
// let sunEditor = {};
// let sunEditorList = [];
// const createSunEditor = async() => {
//     console.log( "createSunEditor() : " + numResources );
//     // eslint-disable-next-line no-undef
//     sunEditor["sunEditor"+numResources] = [ numResources, SUNEDITOR.create( "sunEditor" + numResources, {
//         toolbarContainer: "#toolbar_container",
//         showPathLabel: false,
//         defaultTag: "p",
//         charCounter: true,
//         charCounterLabel: "Char Count",
//         width: "100%",
//         height: "auto",
//         minHeight: "200px",
//         defaultStyle: "font-size:15px;",
//         // eslint-disable-next-line no-undef
//         katex: katex, 
//         buttonList: [
//             [ "undo", "redo", "font", "fontSize", "formatBlock" ], 
//             [ "fontColor", "hiliteColor", "textStyle" ],
//             [
//                 "bold",
//                 "underline",
//                 "italic",
//                 "strike",
//                 "subscript",
//                 "superscript",
//                 "removeFormat",
//             ],
//             [ 'link', 'image', 'video', 'math' ],
//             [ "outdent", "indent", "align", "horizontalRule", "list", "table" ],
//             [
//                 "showBlocks",
//                 "codeView",
//                 "preview",
//                 "print",
//                 "save",
//                 "fullScreen",
//             ],
//         ],
//         mode: "classic",
//         // eslint-disable-next-line no-undef
//         lang: SUNEDITOR_LANG.en,
//         "lang(In nodejs)": "en",
//         callBackSave: function ( contents ) {
//             alert( contents );
//         },
//     } ) ];

//     sunEditorList.push( sunEditor["sunEditor"+numResources] );
// };

// // update the sun editor contents
// function updateSunEditor( id, name, contents ) {
//     //console.log( "updateSunEditor call: " + id + " " + name + " " + contents );
    
//     fetch( "api/v1/auth/resources", {
//         method: "POST",
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify( {
//             "resourceId":  id,
//             "resourceType": 1,
//             "resourceName": name ? name : "Untitled",
//             "resourceDescription": "",
//             "resourceContentHtml": contents ? contents : "",
//             "resourceImage": "",
//             "resourceLink": "",
//             "isRequired": false,
//             "active": true,
//             "visibility": "private"
//         } )
//     } )
//         .then( response => response.json() )
//         .then( ( data ) => {
//             //console.log( JSON.stringify( data ) );
//         } );
// }

// function getResourceID( val ) {
//     let resourceID = resources[val][0];
//     return resourceID;
// }

// /* Suneditor Events ------------------------------------------------------*/
// document.addEventListener( "mousemove", function() {
//     //console.log( "mouse move event" );
//     for ( let i=0; i<sunEditorList.length; i++ ) {
//         sunEditorList[i][1].onChange = () => {
//             console.log( "onChange event for sunEditor: " + getResourceID( i ) );
//             sunEditorList[i][1].save();

//             // actively get sun editor contents and make updates
//             let contents = sunEditorList[i][1].getContents();
//             let id = getResourceID( ( i ) );
//             //let id = resources-i - 1];
//             console.log( "resources: " + resources + " at index " + ( ( i ) + "is : " + id ) );
//             let title = document.getElementById( "input-title" + sunEditorList[i][0] ).value;
//             console.log( "calling from move" );
//             updateSunEditor( id, title, contents );
//         };
//         sunEditorList[i][1].onKeyUp = ( e ) => {
//             if ( e.key == "/" ) {
//                 sunEditorList[i].insertHTML(
//                     '<div><button style=background:pink;>Hello</button></div>',
//                     true
//                 );
//             }
//         };
//     }
// } );
// /* END Suneditor Events ---------------------------------------------------------------------------------*/


// /* Drag and Drop ------------------------------------------------------------------------- */
// /**
//  * Modified version of : https://codepen.io/dcode-software/pen/xxwpLQo
//  */
// // Workspace empty state drop zone
// if ( document.querySelectorAll( ".drop-zone" ) ) {
//     let dropZoneElement = document.querySelectorAll( ".drop-zone" )[0];
//     if( dropZoneElement ){
//         let inputElement = dropZoneElement.lastElementChild;
//         createDropZoneEventListeners( dropZoneElement, inputElement );
//     }
// }

// // Get the target drop zone
// let targetDropZone = null;
// document.addEventListener( "dragenter", ( e ) => {
//     targetDropZone = e.target;
// } );

// function createDropZoneEventListeners( dropZone, input ) {
//     dropZone.addEventListener( "dragover", ( e ) => {
//         e.preventDefault();

//         dropZone.firstElementChild.style.display = "block";

//         if ( activeTab.childElementCount == 1 ||
//       dropZone.className.includes( "empty-topic-dropzone" ) ) {
//             dropZone.classList.add( "drop-zone--over" );
//             dropZone.firstElementChild.style.display = "none";
//         }
//     } );

//     [ "dragleave", "dragend" ].forEach( ( type ) => {
//         dropZone.addEventListener( type, () => {
//             dropZone.classList.remove( "drop-zone--over" );
//             dropZone.firstElementChild.style.display = "none";
//         } );
//     } );

//     dropZone.addEventListener( "drop", ( e ) => {
//         e.preventDefault();
//         if ( e.dataTransfer.files.length && e.dataTransfer.files[0] ) {
//             if ( e.dataTransfer.files[0].size <= 1048576 ) {
//                 input.files = e.dataTransfer.files;
//                 updateThumbnail( dropZone, e.dataTransfer.files[0] );
//             }
//             else {
//                 alert( "Image size limit is 1MB!" );
//             }
//         }

//         dropZone.classList.remove( "drop-zone--over" );
//         dropZone.firstElementChild.style.display = "none";
//     } );
// }

// /**
//  * Updates the thumbnail on a drop zone element.
//  *
//  * @param {HTMLElement} dropZoneElement
//  * @param {File} file
//  */
// function updateThumbnail( dropZoneElement, file ) {
//     // Create a topic if file dropped in workspace empty state
//     if ( activeTab.id == "resources-zone0" ) {
//         createTopic();
//     } 
//     // Div that holds the thumbnail
//     let mydiv = document.createElement( 'div' );
//     mydiv.className = "drop-zone-show";

//     // Thumbnail element
//     let thumbnailElement = dropZoneElement.querySelector( ".drop-zone__thumb" );
//     thumbnailElement = document.createElement( "div" );
//     thumbnailElement.classList.add( "drop-zone__thumb" );

//     // File input element
//     let inputfile = document.createElement( 'input' );
//     inputfile.type = "file";
//     inputfile.name = "resourceImageField";
//     inputfile.className = "drop-zone__input";

//     // File title element
//     let inputTitle = document.createElement( 'div' );
//     inputTitle.id = "input-title" + numResources;
//     inputTitle.className = "drop-zone__title";

//     // Preview Icon
//     let previewIcon = document.createElement( 'span' );
//     previewIcon.setAttribute( "class", "material-symbols-outlined" );
//     previewIcon.setAttribute( "id", "preview-icon" + numResources );
//     previewIcon.innerHTML = "preview";

//     // New drop zone
//     let newDropZone = document.createElement( "div" );
//     newDropZone.className = "drop-zone";

//     // New drop zone filler div
//     let newDropZoneFiller = document.createElement( "div" );
//     newDropZoneFiller.className = "dropzone-filler";
//     newDropZone.appendChild( newDropZoneFiller );

//     // New drop zone input
//     let newDropZoneInput = document.createElement( "input" );
//     newDropZoneInput.className = "drop-zone__input";
//     newDropZoneInput.type = "file";
//     newDropZone.appendChild( newDropZoneInput );
//     createDropZoneEventListeners( newDropZone, newDropZoneInput );

//     // Check for filler space
//     if ( document.getElementById( "filler-space" ) ) {
//         document.getElementById( "filler-space" ).remove();
//     }
  
//     // Append the thumbnail to parent div
//     // Set the title to the file name
//     mydiv.appendChild( thumbnailElement );
//     thumbnailElement.dataset.label = file.name;
//     inputTitle.innerHTML = file.name;
  
//     // Show thumbnail for image files
//     if ( file.type.startsWith( "image/" ) ) {
//         //console.log( file );
//         getFile( file ).then( url => {
//             thumbnailElement.style.backgroundImage = url;
//             // PayloadTooLargeError: request entity too large
//             // createResource( file.name, 2, url );
//             createResource( file.name, 2, file.name );
//             // console.log( url ) ;
//         } );
        
//         mydiv.style.height = "500px";
//         activeHeightObj[tabName] += 500;
//     }
//     else {
//         thumbnailElement.style.backgroundSize = "200px";
//         mydiv.style.height = "200px";
//         activeHeightObj[tabName] += 200;
//         createResource( file.name, 3, null );
//     }
//     mydiv.appendChild( inputfile );

//     // Remove empty state if necessary
//     let location = getTabLocation( tabName );
//     if ( mydiv.childElementCount > 0 ) {
//         document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
//         document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
//     }

//     // File drop in topic empty state
//     if ( targetDropZone === document.querySelectorAll( ".empty-state" )[location+1] ) {
//         activeTab.firstChild.parentNode.insertBefore( inputTitle, activeTab.firstChild.nextSibling );
//         inputTitle.parentNode.insertBefore( previewIcon, inputTitle.nextSibling );
//         previewIcon.parentNode.insertBefore( mydiv, previewIcon.nextSibling );
//         mydiv.parentNode.insertBefore( newDropZone, mydiv.nextSibling );
//     }
//     else {
//         // File drop in workspace empty state
//         if ( dropZoneElement === document.querySelectorAll( ".drop-zone" )[0] ) {
//             activeTab.firstChild.parentNode.insertBefore( inputTitle, activeTab.firstChild.nextSibling );
//         }
//         else {
//             targetDropZone.parentNode.insertBefore( inputTitle, targetDropZone.nextSibling );
//         }
//         inputTitle.parentNode.insertBefore( previewIcon, inputTitle.nextSibling );
//         previewIcon.parentNode.insertBefore( mydiv, previewIcon.nextSibling );
//         mydiv.parentNode.insertBefore( newDropZone, mydiv.nextSibling );
//     }

//     // Maintain a baseline height until 1200px is exceeded
//     checkActiveHeight();
// }
// /* END Drag and Drop ------------------------------------------------------------------------- */

// function getFile( file ) {
//     return new Promise( ( resolve ) => {
//         const fileReader = new FileReader();
//         fileReader.onloadend = ( ) => { 
//             const res = `url('${fileReader.result}')`;
//             resolve( res );
//         };
//         fileReader.readAsDataURL( file );
//     } );
// }

// /* END Resource Functions ---------------------------------------------------------------------------------*/



// let currentTabIndex = null; 

// document.addEventListener( "click", function( e ) {
//     console.log( "suneditor click event" ); 
//     // toggle edit and done icons
//     if ( ( e.target.id ).includes( "done" ) ) {
//         let val = e.target.id.match( /\d+/g )[0];
//         e.target.style.display = "none";
//         document.getElementById( "edit-icon" + val ).style.display = "block";
//         console.log( sunEditor["sunEditor" + val] );
//         sunEditor["sunEditor" + val][1].readOnly( true );

//         // actively get sun editor contents and make updates
//         let contents = sunEditor["sunEditor" + val][1].getContents();
//         //let id = getResourceID( sunEditor["sunEditor" + val][0] );
//         let id = resources[currentTabIndex][val];
//         let title = document.getElementById( "input-title" + sunEditor["sunEditor" + val][0] ).value;
//         console.log( "calling from click" );
//         updateSunEditor( id, title, contents );
//     }
//     if ( ( e.target.id ).includes( "edit" ) ) {
//         e.target.style.display = "none";
//         document.getElementById( "done-icon" + e.target.id.match( /\d+/g )[0] ).style.display = "block";
//         sunEditor["sunEditor" + e.target.id.match( /\d+/g )[0]][1].readOnly( false );
//     }

//     // open suneditor in new tab
//     // if ( e.target.id.includes( "open-tab" ) ) {
//     //     window.open( "http://localhost:4200/note", "_blank" );
//     // }

//     // close tag list elements
//     if ( document.querySelector( ".tag-list" ) && document.querySelector( ".tag-list" ).style.display == "block" ) {
//         document.querySelector( ".tag-list" ).style.display = "none";
//         // document.querySelector( "#new-tag-element" ).style.display = "none";
//         document.querySelector( "#mySearch" ).value = "";
//     }
//     // if ( document.querySelector( "#new-tag-element" ) && document.querySelector( "#new-tag-element" ).style.display == "block" ) {
//     //     document.querySelector( ".tag-list" ).style.display = "none";
//     //     document.querySelector( "#new-tag-element" ).style.display = "none";
//     //     document.querySelector( "#mySearch" ).value = "";
//     // }

//     if ( document.getElementById( "tablinks" + tabName.slice( -1 ) ) && e.target.className != "topic-title" ) {
//         if ( document.getElementById( "topic-title" + tabName.slice( -1 ) ).value != "" ) {
//             // change the tab name to the new topic title
//             document.getElementById( "tablinks" + tabName.slice( -1 ) ).innerHTML = document.getElementById( "topic-title" + tabName.slice( -1 ) ).value;
//         } 
//         else {
//             document.getElementById( "tablinks" + tabName.slice( -1 ) ).innerHTML = "Untitled";
//         }

//         // replace the close tab button
//         // let closeTabBtn = document.createElement( "span" );
//         // closeTabBtn.className = "close-tab";
//         // closeTabBtn.id = "close-tab" + tabName.slice( -1 );
//         // closeTabBtn.innerHTML = "&times;";
//         // document.getElementById( "tablinks" + tabName.slice( -1 ) ).appendChild( closeTabBtn );
//     }
// } );

// document.addEventListener( 'keyup', ( e ) => {
//     let ele = document.getElementById( e.target.id );
//     if ( e.target.tagName == 'INPUT' ) {
//         if ( ele.className == 'topic-title' ) {
//             updateTopic( ele.value );
//         } 
//     }
// } );



// /* Workspace Manager Modal ----------------------------------------------- */
// // URBG: I removed the modal - commenting these out
// // const modal = document.getElementById( "resource-modal-div" );
// const openBtn = document.getElementById( "new-element" );
// //const closeBtns = document.querySelectorAll( ".close" );
// // const createDocBtn = document.getElementById( "create-doc-div" );
// // const createTopicBtn = document.getElementById( "create-topic-div" );
// const fileUploadBtn = document.getElementById( "file-upload-div" );
// // const openTopicBtn = document.getElementById( "open-topic-div" );
// // const openTopicModal = document.getElementById( "open-topic-modal-div" );

// // open the modal
// let modal = null;
// if( openBtn ) {
//     openBtn.onclick = () => {
//         if ( editPermission == true ){
//             modal.style.display = "block";
//         }
        
//     };
// }

// // //close the modal
// // if( closeBtns ) {
// //     closeBtns.forEach( ( btn ) => {
// //         btn.onclick = () => {
// //             if ( modal.style.display == "block" ) {
// //                 modal.style.display = "none";
// //             }
// //             else if ( openTopicModal.style.display == "block" ) {
// //                 openTopicModal.style.display = "none";
// //             }
// //         };
// //     } );
// // }

// // window.onclick = function( event ) {
// //     if ( event.target == modal ) {
// //         modal.style.display = "none";
// //     }
// //     else if ( event.target == openTopicModal ) {
// //         openTopicModal.style.display = "none";
// //     }
// // };

// // option hover events
// document.addEventListener( "mousemove", function( e ) {
//     for ( let i=0; i<document.getElementsByClassName( "modal-icon" ).length; i++ ) {
//         if ( e.target === document.getElementsByClassName( "modal-icon" )[i] ||
//         e.target === document.getElementsByClassName( "option" )[i] ) {
//             document.getElementsByClassName( "modal-icon" )[i].style.color = "black";
//             document.getElementsByClassName( "option" )[i].style.color = "black";
//             document.getElementsByClassName( "option" )[i].style.textDecoration = "underline";
//         }
//         else {
//             document.getElementsByClassName( "modal-icon" )[i].style.color = "rgb(100, 98, 98)";
//             document.getElementsByClassName( "option" )[i].style.color = "rgb(100, 98, 98)";
//             document.getElementsByClassName( "option" )[i].style.textDecoration = "none";
//         }
//     }
// } );

// // // option events
// // if ( createDocBtn ) { 
// //     createDocBtn.onclick = () => {
// //         modal.style.display = "none";
// //         createTextArea();
// //     };
// // }
// // if ( createTopicBtn ) {
// //     createTopicBtn.onclick = () => {
// //         modal.style.display = "none";
// //         createTopic();
// //     };
// // }
// if ( fileUploadBtn ) {
//     const pickerOpts = {
//         types: [
//             {
//                 description: 'Images',
//                 accept: {
//                     'image/*': [ '.png', '.gif', '.jpeg', '.jpg' ]
//                 }
//             },
//         ],
//         excludeAcceptAllOption: true,
//         multiple: false
//     };

//     fileUploadBtn.addEventListener( "mousedown", async() => {
//         console.log( "file upload button clicked" );
//         //let file = await window.showOpenFilePicker( pickerOpts );

//     } );
// }
// // if ( openTopicBtn ) {
// //     openTopicBtn.onclick = () => {
// //         modal.style.display = "none";
// //         openTopicModal.style.display = "block";
// //     };
// // }
// /* END Workspace Manager Modal ----------------------------------------------- */

// const toggleProfileList = () => {
//     let arrow = document.getElementById( "profiles-toggle" );

//     if ( arrow.classList.contains( "up-arrow" ) ) {
//         document.getElementById( "permissions-box" ).style.display = "none";
//         arrow.setAttribute( 'class', 'arrow down-arrow' );
//     }
//     else {
//         document.getElementById( "permissions-box" ).style.display = "flex";
//         arrow.setAttribute( 'class', 'arrow up-arrow' );
//     }
// };

// function toggleProfile ( e ) {
//     let target = e.target;
//     let box;

//     target.classList.contains( "permission-li" ) ? 
//         box = target.childNodes[3] : 
//         box = target.parentElement.childNodes[3];

//     box.checked ?
//         box.checked = false :
//         box.checked = true;
// }

// if ( document.getElementById( "profiles-toggle" ) ) {
//     document.getElementById( "profiles-toggle" ).addEventListener( "click", toggleProfileList );
// }

// var perms = document.getElementsByClassName( "permission-li" );

// for ( let i = 0; i < perms.length; i++ ) {
//     perms[i].addEventListener( "click", toggleProfile );
// }










// /* File Dropdown ----------------------------------------- */

// // // Toggles the rendering of more options menu
// // const toggleMoreOptions = () => {
// //     if (document.getElementById('dropdown-content').getAttribute('style')) {
// //         document.getElementById('dropdown-content').setAttribute('style','');
// //     } else {
// //         document.getElementById('dropdown-content').setAttribute('style',"display: block; right: 2%; top: 4%");
// //     }
// // }

// // // If file modal is on, it turns off and vice versa
// // const toggleFileModal = () => {
// //     if (document.getElementById('file-display').getAttribute('class') === 'hidden') {
// //     document.getElementById('file-display').setAttribute('class','file-display-shown');
// //     } else {
// //     document.getElementById('file-display').setAttribute('class','hidden');
// //     }
// // }

// // // Checks if someone is clicking off modal and then closes it
// // document.body.addEventListener( 'click', ( ev ) => {
// //     if ( document.getElementById( 'file-display' ).getAttribute( 'class' ) !== 'hidden' ) {
// //         if ( ev.target.id !== 'file-display-content' && ev.target.id !== 'show-files' && ev.target.id !== "file-display-name" && ev.target.id !== "file-display-icon" && ev.target.id !== "show-files" && ev.target.id !== 'new-file-icon' && ev.target.id !== 'new-file-coloring' ) {
// //             document.getElementById( 'file-display' ).setAttribute( 'class', 'hidden' );
// //         }
// //     }
// //     if ( ev.target.id !== 'ellipsis' ) {
// //         document.getElementById( 'dropdown-content' ).setAttribute( 'style', '' );
// //     }
// // } );

// // const onClickTesting = () => {
// //     console.log("clicked");
// // }

// // const returnFiles = () => {
// //     return [{name: "file 1", onClick: onClickTesting()},{name: "file 2", onClick: onClickTesting()}];
// // }

// /* END File Dropdown ----------------------------------------- */
// //////////////onload fetch functions //////////////////////


// const prefixPattern = /#t/;

// //const idPattern = /-([0-9]+)/;
// const uuidPattern = /[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89aAbB][a-f0-9]{3}-[a-f0-9]{12}/;

// const shareButton = document.getElementById( "share-button" );
// const shareInput = document.getElementById( "share-input" );
// const workspaceTitle = document.getElementById( "workspace-title" );
// const workspaceDescription = document.getElementById( "workspace-desc" );
// const tagBox = document.getElementById( "mySearch" );
// const editors = document.getElementsByClassName( "se-wrapper" );
// var editPermission = false;

// const getPrefixAndId = () => {

//     const url = window.location.href;
//     let urlId = null;
//     let tempUuid =  ( uuidPattern.exec( url ) );
//     if( tempUuid ) {
//         urlId = tempUuid[0];
//     }

//     return [ prefixPattern.test( url ), urlId ];
// };

// const idAndFetch = () => {
//     const [ isTopic, id ] = getPrefixAndId();
//     if ( id ){
//         getPermission( id ); 
//     }
//     if ( isTopic && id ) {
//         fetch( "api/v1/auth/topics/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 fillFields(
//                     response.topicName,
//                     response.topicDescription,
//                     response.topicImage
//                 );
//             } );
//     }
//     else if ( id ) {
//         fetch( "api/v1/auth/workspaces/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 fetchAndDisplaySharedUsers( response );
//                 fillFields(
//                     response.workspaceName,
//                     response.workspaceDescription,
//                     response.workspaceImage
//                 );
//             } )
//             .catch( error => {
//                 //console.error( 'Fetch Error: not owner' );
//                 fetchSharedWorkspace();
//             } );
//     }
// };

// const getPermission = ( workspaceId ) => {
//     fetch( "api/v1/auth/shared/getPermission/" + workspaceId, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//     } )
//         .then( ( response ) => response.json() )
//         .then( ( response ) => {
//             if ( response.permission_level == "edit" ){
//                 editPermission = true;
//                 applyEditPermission( editPermission );
//             }
//             else{
//                 applyEditPermission( editPermission );
//             }
//         } );
// };

// const applyEditPermission = ( editTool ) => {
//     if ( editTool == false ){
//         workspaceTitle.readOnly = true;
//         workspaceDescription.readOnly = true;
//         tagBox.readOnly = true;
//         console.log( editors );
//         Array.from( editors ).forEach( function( editor ){
//             console.log( editor );
//         } );
//     }
// };

// const fetchSharedWorkspace = () => {
//     const [ isTopic, id ] = getPrefixAndId();
//     //console.log( id );
//     if ( isTopic && id ) {
//         fetch( "api/v1/auth/topics/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 fillFields(
//                     response.topicName,
//                     response.topicDescription,
//                     response.topicImage
//                 );
//             } );
//     }
//     else if ( id ) {
//         fetch( "api/v1/auth/workspaces/shared/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 fetchAndDisplaySharedUsers( response );
//                 fillFields(
//                     response.workspaceName,
//                     response.workspaceDescription,
//                     response.workspaceImage
//                 );
//             } );
//     }
// };

// const getTags = async () => {
//     const [ isTopic, id ] = getPrefixAndId();
//     if ( isTopic && id ) {
//         fetch( "api/v1/auth/tags/tagged/topic/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 for( let i = 0; i < response.length; i++ ) {
//                     newTag( response[i].tag, false );
//                 }

                
//             } );
//     }
//     else if ( id ) {
//         fetch( "api/v1/auth/tags/tagged/workspace/" + id, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } )
//             .then( ( response ) => response.json() )
//             .then( ( response ) => {
//                 for( let i = 0; i < response.length; i++ ) {
//                     newTag( response[i].tag, false );
//                 }
//             } );
//     }
// };

// async function refreshSharedUserList( ) {
//     // Call fetchAndDisplaySharedUsers again to update the shared user list
//     idAndFetch();
// }

// // Define a function to fetch and display shared users
// async function fetchAndDisplaySharedUsers( workspace ) {
//     const workspaceId = workspace.workspaceId;
//     const shareSearchButton = document.getElementById( 'share-btn-search' );
//     let ownerDetails = null, allUsers = null, sharedUsers = [];

//     try {
//         const sharedUsersResponse = await fetch( `/api/v1/auth/shared/shared-entity/${workspaceId}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } );

//         const workspaceOwnerResponse = await fetch( `/api/v1/auth/user/userId/${workspace.ownedBy}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//         } );

//         if ( workspaceOwnerResponse.ok ) {
//             const workspaceOwner = await workspaceOwnerResponse.json();

//             ownerDetails = {
//                 name: workspaceOwner.firstName + " " + workspaceOwner.lastName,
//                 pfp: workspaceOwner.profileFilename,
//                 status: "Owner",
//                 email: workspaceOwner.email,
//                 userId: workspaceOwner.userId,
//                 entityId: workspaceId,
//             };

//             if ( sharedUsersResponse.ok ) {
//                 const sharedEntities = await sharedUsersResponse.json();
//                 sharedUsers = sharedEntities.map( ( entity ) => ( {
//                     name: entity.first_name + " " + entity.last_name,
//                     pfp: entity.profile_filename,
//                     status: entity.permissionLevel.charAt( 0 ).toUpperCase() + entity.permissionLevel.slice( 1 ),
//                     email: entity.email,
//                     userId: entity.sharedWithUserId,
//                 } ) );
//             }
//             else {
//                 console.error( "Unable to retrieve shared users OR no shared users." );
//             }

//             allUsers = [ ownerDetails, ...sharedUsers ];

//             const profilesList = document.getElementById( "profiles-list" );
//             profilesList.innerHTML = "";
//             allUsers.forEach( ( profile ) => {
//                 const userProfileElement = createUserProfile( profile, workspace );
//                 profilesList.appendChild( userProfileElement );
//             } );
//         }
//         else {
//             console.error( "Unable to retrieve workspace owner." );
//         }
//     }
//     catch ( error ) {
//         console.error( error );
//     }

//     let name = document.getElementById( "share-modal-title" );
//     name.textContent = `Share "${workspace.workspaceName}"`;

//     shareSearchButton.addEventListener( 'click', function () {
//         shareSearchUsers( ownerDetails, allUsers );
//     } );
    
//     // Clear old search results before displaying new ones
//     const searchedUsersContainer = document.getElementById( "searched-users" );
//     searchedUsersContainer.innerHTML = "";
// }

// const shareSearchUsers = ( workspaceOwner, allUsers ) => {
//     const shareUserSearch = document.getElementById( 'share-user-search' );
//     const excludedUserIds = new Set();

//     // Add workspace owner's ID to the excluded list
//     excludedUserIds.add( workspaceOwner.userId );
//     for ( let n = 0; n < allUsers.length; n++ ) {
//         excludedUserIds.add( allUsers[n].userId );
//     }

//     // Fetch the list of users matching the search term
//     fetch( "/api/v1/auth/user/search/" + shareUserSearch.value, {
//         method: "GET",
//         headers: { "Content-Type": "application/json" },
//     } )
//         .then( ( response ) => response.json() )
//         .then( ( response ) => {
//         // Clear old search results before displaying new ones
//             const searchedUsersContainer = document.getElementById( "searched-users" );
//             searchedUsersContainer.innerHTML = "";

//             for ( let i = 0; i < response.length; i++ ) {
//                 const data = response[i];
            
//                 // Check if the user is not in the excluded list (owner or shared)
//                 if ( !excludedUserIds.has( data.userId ) ) {
//                     createUserSearchCard( data, workspaceOwner );
//                 }
//             }
//         } );
// };

// // creates a user card for each user
// function createUserSearchCard( userData, workspace ) {
//     // Create a div element for the user card
//     const card = document.createElement( "div" );
//     card.className = "searched-user-card";
//     const user = {
//         name: userData.firstName + " " + userData.lastName,
//         pfp: userData.profileFilename,
//         email: userData.email,
//         userId: userData.userId,
//     };

//     // Create the HTML structure for the user card
//     card.innerHTML = `
//             <div class="profile-status-container">
//                 <img class="shared-profile-picture" src="/assets/uploads/profile/${user.pfp}">
//                 <div class="profile-info">
//                     <span class="profile-name">${user.name}</span>
//                     <span class="profile-email">${user.email}</span>
//                 </div>
//                 <button class="add-user-button" style="margin-right: 10px;">Add</button>    
//             </div>
//         `;

//     const addUserButton = card.querySelector( ".add-user-button" );
//     addUserButton.addEventListener( "click", async () => {
//         await fetch( "/api/v1/auth/shared/shareworkspace/", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify( {
//                 entityId: workspace.entityId,
//                 sharedWithUserId: user.userId,
//                 sharedWithEmail: user.email,
//                 permissionLevel: "view",
//                 canCopy: "false",
//             } ),
//         } );
      
//         // Refresh the shared user list
//         await refreshSharedUserList( );
//     } );

//     // Get the container for searched users and append the card
//     const searchedUsersContainer = document.getElementById( "searched-users" );
//     searchedUsersContainer.appendChild( card );
// }

// function createUserProfile( profile, workspace ) {
//     const li = document.createElement( "li" );
//     li.className = "profile-shared-with";

//     // Create only the necessary HTML elements based on the profile status
//     li.innerHTML = `
//         <div class="profile-status-container">
//             <img class="shared-profile-picture" src="/assets/uploads/profile/${profile.pfp}">
//             <div class="profile-info">
//                 <span class="profile-name">${profile.name}</span>
//                 <span class="profile-email">${profile.email}</span>
//             </div>
//             <span class="profile-status">${profile.status}</span>
//             ${profile.status !== 'Owner' ? `
//             <button class="arrow down-arrow" id="toggle-button-${profile.userId}" style="margin-right: 10px;"></button>
//             <div class="permissions-box" id="permissions-box-${profile.userId}" style="display: none;">
//                 <div class="permissions-col">
//                     <span class="permission-li">
//                         <button class="permission-button" data-permission="edit">Edit</button>
//                     </span>
//                     <span class="permission-li">  
//                         <button class="permission-button" data-permission="view">View</button>
//                     </span>
//                     <span class="permission-li removes">
//                         <button class="remove-button">Remove</button>
//                     </span>
//                 </div> 
//             </div>` : ''}
//         </div>
//     `;

//     // Add event listeners only if the profile is not an 'Owner'
//     if ( profile.status !== 'Owner' ) {
//         const permissionButtons = li.querySelectorAll( ".permission-button" );
//         const removeButton = li.querySelector( ".remove-button" );

//         permissionButtons.forEach( button => {
//             button.addEventListener( "click", async () => {
//                 const permission = button.getAttribute( "data-permission" );
//                 fetch( "/api/v1/auth/shared/updatePermission/", {
//                     method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify( {
//                         entityId: workspace.workspaceId,
//                         permissionLevel: permission,
//                         sharedUserId: profile.userId
//                     } ),
//                 } );
//                 await refreshSharedUserList();
//             } );
//         } );

//         removeButton.addEventListener( "click", async () => {
//             fetch( "/api/v1/auth/shared/removeShare/", {
//                 method: "DELETE",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify( {
//                     entityId: workspace.workspaceId,
//                     sharedUserId: profile.userId,
//                 } ),
//             } );
//             await refreshSharedUserList();
//         } );

//         // Attach event listener to the toggle button
//         const toggleButton = li.querySelector( `#toggle-button-${profile.userId}` );
//         const permissionsBox = li.querySelector( `#permissions-box-${profile.userId}` );

//         toggleButton.addEventListener( "click", () => {
//             if ( permissionsBox.style.display === "none" ) {
//                 permissionsBox.style.display = "block";
//                 toggleButton.classList.remove( "down-arrow" );
//                 toggleButton.classList.add( "up-arrow" );
//             }
//             else {
//                 permissionsBox.style.display = "none";
//                 toggleButton.classList.remove( "up-arrow" );
//                 toggleButton.classList.add( "down-arrow" );
//             }
//         } );
//     }

//     return li;
// }

// const fillFields = ( title, description, image ) => {
//     document.getElementById( "workspace-title" ).value = title.trim();
//     document.getElementById( "workspace-desc" ).value = description.trim();
// };

// const renderTopics = async ( workspace ) => {
//     const [ isTopic, id ] = getPrefixAndId();
//     if( id ) {
//         const response = await fetch( "api/v1/auth/workspaces/topics/"+ id   );
//         let topics = await response.json();
   
//         if ( topics.length > 0 ) {
//             for ( let i = 0; i < topics.length; i++ ) {
//                 await renderTopic( topics[i] );
            
//             }
//         }
//         else{
//             renderSharedTopics();
//         }   
//     }
    
   
// };

// const renderSharedTopics = async ( workspace ) => {
//     const [ isTopic, id ] = getPrefixAndId();
//     if( id ) {
//         const response = await fetch( "api/v1/auth/workspaces/topics/shared/"+ id   );
//         let topics = await response.json();
   
//         if ( topics.length > 0 ) {
//             for ( let i = 0; i < topics.length; i++ ) {
//                 await renderSharedTopic( topics[i] );
            
//             }
//         }   
//     }
    
   
// };

// //change order so the create stuff will all happen after information is gathered
// //let val = 1;
// let totalTopicsRendered = 0;
// async function renderTopic( topic ) {
  
//     await createTopic( topic.topicId, topic.topicName );
//     const resources = await renderResources( topic.topicId );
//     if ( resources.length > 0 ) {
//         //let docType1Count = 0;
//         for ( let i = 0; i < resources.length; i++ ) {
//             //console.log( "resource: " + i + " of " + resources.length );
//             //console.log( resources[i].resourceName + " id: " + resources[i].resourceId );
//             //if resource is a document
//             if( resources[i].resourceType == 1 ){
//                 await createTextArea( resources[i].resourceName, resources[i].resourceId );
//                 if( resources[i].resourceContentHtml && resources[i].resourceContentHtml.length > 0 ){
//                     totalTopicsRendered++; 
//                     let editor = "sunEditor" + ( totalTopicsRendered );
//                     //console.log( editor );
//                     //console.log( sunEditor[editor] );
//                     sunEditor[editor][1].insertHTML( resources[i].resourceContentHtml );

//                     //docType1Count++;
//                     //val++;
//                 }


//             }
//             else if( resources[i].resourceType == 3 ) {
//                 // todo: add code to deal with resource type 3
//             }
//             else if ( resources[i].resourceType == 2 ) {
//                 console.log( "other resource type??? " + resources[i].resourceName );
//             }
            
//         }
//         window.scrollTo( 0, 0 );
//     }
//     return topics;
// }

// let topicNum = 0;
// totalTopicsRendered = 0;
// async function renderSharedTopic( topic ) {

//     let localResources = null;
  
//     await createTopic( topic.topicId, topic.topicName );
//     const resources = await renderSharedResources( topic.topicId );
//     console.log( resources );
//     if ( resources.length > 0 ) {
//         //let docType1Count = 0;
//         for ( let i = 0; i < resources.length; i++ ) {
//             //console.log( "resource: " + i + " of " + resources.length );
//             //console.log( resources[i].resourceName + " id: " + resources[i].resourceId );
//             //if resource is a document
//             if( localResources[i].resourceType == 1 ){
//                 await createTextArea( localResources[i].resourceName, localResources[i].resourceId );
//                 if( localResources[i].resourceContentHtml && localResources[i].resourceContentHtml.length > 0 ){
                     
//                     let editor = "sunEditor" + ( totalTopicsRendered );

//                     totalTopicsRendered++;

//                     //console.log( editor );
//                     //console.log( sunEditor[editor] );
//                     sunEditor[editor][1].insertHTML( localResources[i].resourceContentHtml );

//                     //docType1Count++;
//                     //val++;
//                 }


//             }
//             else if( localResources[i].resourceType == 3 ) {
//                 // todo: add code to deal with resource type 3
//             }
//             else if ( localResources[i].resourceType == 2 ) {
//                 console.log( "other resource type??? " + localResources[i].resourceName );
//             }

//             // add the resource to the resources array
//             console.log( "----------------- saving resource to list 3 --------------- " );
//             resources[topicNum] = [];
//             resources[topicNum].push( localResources[i].resourceId );
            
//         }
//         window.scrollTo( 0, 0 );
//     }
//     return topics;
// }

// async function renderResources( topicId ) {
//     //console.log( "render resources call: " + topicId );
//     const response = await fetch( "api/v1/auth/topics/resources/" + topicId );
//     const data = await response.json();
//     //console.log( "render resources response: " + JSON.stringify( data ) );
//     return data;
// }

// async function renderSharedResources( topicId ) {
//     //console.log( "render resources call: " + topicId );
//     const response = await fetch( "api/v1/auth/topics/resources/shared/" + topicId );
//     const data = await response.json();
//     //console.log( "render resources response: " + JSON.stringify( data ) );
//     return data;
// }

// async function removeUser( email, workspaceId ) {
//     try {
//         const response = await fetch( "api/v1/auth/shared/removeUserFromWorkspaceByEmail", { 
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify( {
//                 emailToRemove: email,
//                 entityId: workspaceId
//             } )
//         } );

//         if ( response.ok ) {
//             const data = await response.json();
//             alert( data.message || 'User removed successfully' );
//             fetchSharedWorkspace();
//         } 
//         else {
//             const errorData = await response.json();
//             alert( errorData.message || 'Failed to remove user' );
//         }
//     } 
//     catch ( error ) {
//         console.error( 'Error removing user:', error );
//         alert( 'Error removing user' );
        
//     }
// }

// window.addEventListener( "load", () => {
//     idAndFetch();
//     getTags();  
//     renderTopics();
// } );



// ////////* discussions code *///////

// //////New Comment/////
// const addComment = async ( user, pfp, text, isTopic, id ) => {
//     if ( text ) {

//         let commentId, date, type;

//         date = new Date();

//         const hasComments = await document.querySelectorAll( ".comment-countable" ).length;

//         isTopic ? type = "topic" : type = "workspace";

//         id = parseInt( id, 10 );

//         if ( !hasComments ) {
//             //console.log( "Creating discussion" );
//             await fetch( "api/v1/auth/discussions/" + type + "/" + id, 
//                 { method: "POST",
//                     headers: { "Content-Type": "application/json" },
//                     body: JSON.stringify( {  
//                         "parent_id": id,
//                         "parent_type": type,
//                         "discussion_text": "string"     
//                     } )
//                 } );
//             /*.then( ( response ) => response.json() )
//             .then( ( data ) => {
//                 console.log( data );
//             } );*/
//         }
        
//         await fetch( "api/v1/auth/discussions/comment", 
//             { method: "POST",
//                 headers: { "Content-Type": "application/json" },
//                 body: JSON.stringify( {
//                     "parent_id": id, 
//                     "parent_type": type,
//                     "comment_text": text
//                 } ) 
//             } )
//             .then( ( response ) => response.json() )
//             .then( ( data ) => {
//                 //console.log( data );
//                 commentId = data.id;
//             } );
            
//         ///UPDATING THE DOM///

//         //cloning the comment template so we can modify it then add it to the stream
//         let newEl = document.getElementById( "comment-template" ).cloneNode( true );

//         //setting the attributes of the comment
//         newEl.style.display = "block";
//         newEl.id = commentId;
//         newEl.childNodes[1].childNodes[1].innerText = pfp;
//         newEl.childNodes[1].childNodes[3].innerText = user;
//         newEl.childNodes[3].innerText = text;
//         newEl.childNodes[5].childNodes[5].innerText = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
//         newEl.classList.add( "comment-countable" );

//         //make sure the like button works
//         newEl.querySelector( "#like-button" ).addEventListener( "click", addOrRemoveLike );

//         //inserting the modified clone into the comment stream
//         document.getElementById( "discussions-body" ).insertBefore( newEl, document.getElementById( "post-comment-btn" ).nextSibling );  

//         //removing the value from the textarea
//         document.getElementById( "discussion-textarea" ).innerText = '';
//     }
//     else {
//         window.alert( "You cannot leave a blank comment" );
//     }
// };


// //window.onload rendering comment
// const loadComment = ( {user_id, pfp = "account_circle", comment_text, created_at, id, likes, user_rating } ) => {

//     //cloning the comment template so we can modify it then add it to the stream
//     let newEl = document.getElementById( "comment-template" ).cloneNode( true );

//     //setting the attributes of the comment
//     newEl.style.display = "block";
//     newEl.id = id;
//     newEl.childNodes[1].childNodes[1].innerText = pfp;
//     newEl.childNodes[1].childNodes[3].innerText = user_id;
//     newEl.childNodes[3].innerText = comment_text;
//     newEl.childNodes[5].childNodes[5].innerText = created_at;
//     newEl.childNodes[5].childNodes[1].childNodes[3].innerText = likes;
//     newEl.classList.add( "comment-countable" );

//     let likeButton = newEl.querySelector( "#like-button" );

//     //make sure the like button works
//     likeButton.addEventListener( "click", addOrRemoveLike );

//     if ( user_rating ) {
//         newEl.classList.add( "liked" );
//         likeButton.childNodes[1].style.color = "gray";
//         likeButton.childNodes[3].style.color = "gray";
//         likeButton.style.outline = "none";
//     } 

//     //inserting the modified clone under the proper discussion
//     document.getElementById( "discussions-body" ).insertBefore( newEl, document.getElementById( "post-comment-btn" ).nextSibling );  
// };

// const getDiscussions = async ( isTopic, id ) => {

//     let pageComments;

//     if ( isTopic && id ) {

//         const response = await fetch( "/api/v1/auth/discussions/topic/" + id, { headers: { "Content-Type": "application/json" } } );
//         if ( response.ok ) {
//             const data = await response.json();
//             ( data ) ? pageComments = data.comments : pageComments = null;
//         }
//         else {
//             //console.log( response.status );
//         }
//     } 
//     else if( id ) {

//         const response = await  fetch( "/api/v1/auth/discussions/workspace/" + id, { headers: { "Content-Type": "application/json" }} );
//         if ( response.ok ) {
//             const data = await response.json();
//             ( data ) ? pageComments = data.comments : pageComments = null;
//         }
//         else {
//             //console.log( response.status );
//         }
            
//     }

//     if ( pageComments ) {
//         await pageComments.forEach( ( comment ) => {
//             loadComment( comment );
//         } );
//     }
    
// };


// window.addEventListener( "load", () => {

//     const [ isTopic, id ] = getPrefixAndId();
    
//     if( document.getElementById( "post-comment-btn" ) ) {
//         document.getElementById( "post-comment-btn" ).addEventListener( "click", () => {
//             addComment( "Max", "account_circle", document.getElementById( "discussion-textarea" ).innerText, isTopic, id );
//         } );
//     }
//     if( document.getElementById( "post-topic-btn" ) ) {
//         document.getElementById( "post-comment-btn" ).addEventListener( "click", () => {
//             addComment( "Max", "account_circle", document.getElementById( "discussion-textarea" ).innerText, isTopic, id );
//         } );
//     }   

//     getDiscussions( isTopic, id );
// } );


// ///////Like Button////////

// const addOrRemoveLike = ( e ) => {

//     let goodElement;

//     //making sure the element we are clicking is the one we're looking to use
//     e.target.id ? 
//         goodElement = e.target.childNodes[3] : 
//         e.target.style ? 
//             goodElement = e.target.parentElement.childNodes[3] : 
//             goodElement = e.target;

//     let parentEl = goodElement.parentElement.parentElement.parentElement;

//     if ( parentEl.classList.contains( "liked" ) ) {
//         parentEl.classList.remove( "liked" );
//         goodElement.innerText = parseInt( goodElement.innerText, 10 ) - 1;
//         goodElement.parentElement.childNodes[1].style.color = "black";
//         goodElement.style.color = "black";
//         goodElement.parentElement.style.outline = "2px solid gray";

//         fetch( "api/v1/auth/discussions/rating/" +  parentEl.id, {
//             method: "DELETE",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify( { "rating": false } )
//         } );
//     } 
//     else {
//         parentEl.classList.add( "liked" );
//         goodElement.innerText = parseInt( goodElement.innerText, 10 ) + 1;
//         goodElement.parentElement.childNodes[1].style.color = "gray";
//         goodElement.style.color = "gray";
//         goodElement.parentElement.style.outline = "none";

//         fetch( "api/v1/auth/discussions/rating/" +  parentEl.id, {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify( { "rating": true } )
//         } );
//     }
// };


// ////*Saving Title and Description/////

// const saveTitleOrDescription = ( ) => {
//     const [ isTopic, id ] = getPrefixAndId();

//     const input = document.getElementById( "workspace-title" ).value;
        
//     fetch( "api/v1/auth/workspaces", {
//         method: "POST",
//         headers: {'Content-Type': 'application/json'},
//         body: JSON.stringify( {
//             "workspaceId": id,
//             "workspaceName":  input ? input : "Untitled",
//             "workspaceDescription": document.getElementById( "workspace-desc" ).value,
//             "topics": topics,
//             "active": true,
//             "visibility": "private"
//         } )
//     } );
// }; 


// if( document.getElementById( "workspace-title" ) ) {
//     document.getElementById( "workspace-title" ).addEventListener( "input", saveTitleOrDescription );
// }
// if( document.getElementById( "workspace-desc" ) ) {
//     document.getElementById( "workspace-desc" ).addEventListener( "input", saveTitleOrDescription );
// }