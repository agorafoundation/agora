/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * imports
 */
import { getCurrentWorkspace, getCurrentActiveTopic, addTab, activeTab, setActiveTab, debug, dataDebug } from "./state/stateManager.js";

/**
 * DOM manipulation functions for the editor
 */

/**
 * global variables
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

const createTopicsGui = function ( ) {
    ( debug ) ? console.log( "updateTopicDom() : start" ) : null;

    // verify we have a workspace and it has topics
    if( getCurrentWorkspace() && getCurrentWorkspace().topics ) {
        for( let i=0; i < getCurrentWorkspace().topics.length; i++ ) {

            // get dom elements
            let tabContent = document.getElementsByClassName( "tabcontent" );
            ( debug ) ? console.log( "tabContent: " + JSON.stringify( tabContent ) ) : null;
            let lastTab = tabContent[tabContent.length-1];
            let newTab = document.createElement( "div" );
    
            // get the topic
            let topic = getCurrentWorkspace().topics[i];

            // Create the tab content and append to last tab
            newTab.id = "topic" + i;
            newTab.setAttribute( "name", topic.topicId );
            newTab.className = "tabcontent";

            // create a tab for each topic
            if ( lastTab == null ) {
                ( debug ) ? console.log( "empty tab" ) : null;
                // if there are no tabs, create the first one
                let workspaceEmptyState = document.getElementById( "workspace-empty-state" );
                workspaceEmptyState.parentNode.insertBefore( newTab, workspaceEmptyState.nextSibling );
                workspaceEmptyState.style.display = "none";
                document.getElementById( "topic-background" ).style.backgroundColor = "#3f3f3f";
            }
            else {
                ( debug ) ? console.log( "non-empty tab" ) : null;
                // add additional tab
                lastTab.parentNode.insertBefore( newTab, lastTab.nextSibling );
            }

            // ------------------------------------------------
            // Create drop zone at the top of the topic
            let newDropZone = document.createElement( "div" );
            newDropZone.classList.add( "drop-zone" );
            newDropZone.classList.add( "first-dropzone" );

            // Create drop zone filler div
            let newDropZoneFiller = document.createElement( "div" );
            newDropZoneFiller.className = "dropzone-filler";
            newDropZone.appendChild( newDropZoneFiller );

            // Create drop zone input
            let newDropZoneInput = document.createElement( "input" );
            newDropZoneInput.className = "drop-zone__input";
            newDropZoneInput.type = "file";
            newDropZone.appendChild( newDropZoneInput );
            createDropZoneEventListeners( newDropZone, newDropZoneInput );
            newDropZone.style.display = "none";
            // ------------------------------------------------------

            // -----------------------------------------------------
            // Create drop zone that fills the entire topic empty state
            let emptyDropZone = document.createElement( "div" );
            emptyDropZone.classList.add( "drop-zone" );
            emptyDropZone.classList.add( "empty-topic-dropzone" );

            // Create drop zone filler div
            let emptyDropZoneFiller = document.createElement( "div" );
            emptyDropZoneFiller.className = "dropzone-filler";
            emptyDropZone.appendChild( emptyDropZoneFiller );

            // Create drop zone input
            let emptyDropZoneInput = document.createElement( "input" );
            emptyDropZoneInput.className = "drop-zone__input";
            emptyDropZoneInput.type = "file";
            emptyDropZone.appendChild( emptyDropZoneInput );
            createDropZoneEventListeners( emptyDropZone, emptyDropZoneInput );
            // -------------------------------------------------------------

            // Create all elements within a topic -----------------------------
            let topicContent = document.createElement( "div" );
            topicContent.className = "topic-content";




            let topicDivider = document.createElement( "div" );
            topicDivider.id = "topic-divider" + i   ;

            resourcesZone = document.createElement( "div" );
            resourcesZone.id = "resources-zone" + i;
            resourcesZone.className = "resources-zone";

            let emptyState = document.createElement( "div" );
            emptyState.className = "empty-state";

            let label1 = document.createElement( "label" );
            label1.className = "empty-state-text";
            let header = document.createElement( "h3" );
            header.innerHTML = "Your Topic is Empty";
            label1.appendChild( header );

            let label2 = document.createElement( "label" );
            label2.className = "empty-state-text";
            label2.innerHTML = "Drop a file or tap the + above to get started!";
            // --------------------------------------------------------------

            // Create a new tab button
            let tabBtn = document.createElement( "button" );
            tabBtn.className = "tablinks";
            tabBtn.id = "tablinks" + i;

            let tabBtnName = document.createElement( "span" );
            tabBtnName.id = "tabTopicName" + i;
            if( topic.topicName ){
                tabBtnName.innerHTML = topic.topicName;
            }
            else{
                tabBtnName.innerHTML = "Untitled";
            }
            tabBtn.appendChild( tabBtnName );

            // Create close tab button
            let closeTabBtn = document.createElement( "span" );
            closeTabBtn.className = "close-tab";
            closeTabBtn.id = "close-tab" + i;
            closeTabBtn.innerHTML = "&times;";
            tabBtn.appendChild( closeTabBtn );

            tabBtn.onclick = ( e ) => {
                if ( e.target.className.includes( "close-tab" ) ) {
                    closeTab( e.target.id );
                } 
                else {
                    openTab( newTab );            
                }
            };

            let currTabs = document.querySelector( ".tab" );
            currTabs.appendChild( tabBtn );

            // Append all elements accordingly
            newTab.appendChild( topicContent );
            //topicContent.appendChild( topicTitle );
            // topicContent.appendChild( saveIcon );
            topicContent.appendChild( topicDivider );
            topicContent.appendChild( resourcesZone );
            resourcesZone.appendChild( newDropZone );
            resourcesZone.appendChild( emptyDropZone );
            emptyDropZone.appendChild( emptyState );
            emptyState.appendChild( label1 );
            emptyState.appendChild( label2 );

            // push the tab into the the tabs array
            addTab( newTab );
            // note the active tab as the current
            setActiveTab( newTab );

            createNewActiveHeight();
            
            // urbg evaluate
            openTab( newTab );

            ( debug ) ? console.log( "updateTopicDom() : complete" ) : null;
        }
    }
    else {
        ( debug ) ? console.log( "updateTopicDom() : no topics to update" ) : null;
    }

    
};

const renderResourcesForActiveTopic = async function () {
    ( debug ) ? console.log( "renderResourcesForActiveTopic() : Start" ) : null;
    if( getCurrentActiveTopic() && getCurrentWorkspace().topics ) {

        if( getCurrentActiveTopic() && getCurrentActiveTopic().resources ) {
            for( let i=0; i < getCurrentActiveTopic().resources.length; i++ ) {
               
                // TODO: evaluate what are these two??? why are there 2?
                await createTextArea( getCurrentActiveTopic().resources[i].resourceName, i );

                renderTextArea( getCurrentActiveTopic().resources[i].resourceContentHtml, i );

            }
        }
    }
    ( debug ) ? console.log( "renderResourcesForActiveTopic() : End" ) : null;
};




function createTextArea( name, i ) {
    // Text area has to be created before suneditor initialization, 
    // so we have to return a promise indicating whether or not text area has been successfully created
    let promise =  new Promise( ( resolve ) => {
        // workspace empty state
        // if ( activeTab.id == "resources-zone0" ) {
        //     createTopic();
        // }

        // Check for filler space
        if ( document.getElementById( "filler-space" ) ) {
            document.getElementById( "filler-space" ).remove();
        }

        // Create drop zone
        let newDropZone = document.createElement( "div" );
        newDropZone.className = "drop-zone-new";
        newDropZone.innerHTML = "Drop a file or click here to create an addtional text area";
        newDropZone.addEventListener( "click", async () => {
            ( debug ) ? console.log( "createTextArea - Promise - createResource() call" ) : null;

            //( debug ) ? console.log( "getCurrTopicID: " + getCurrTopicID() );
            //( debug ) ? console.log( "getCurrTopicIndex: " + currentTabIndex );

            /**
             * TOOD: evaluate
             */
            // ( debug ) ? console.log( "create new resource click event - createResource() call" );
            // const newResource = await createResource( null, 1, null, null );
            // ( debug ) ? console.log( "newResource: " + JSON.stringify( newResource ) );

            // ( debug ) ? console.log( "create new resource click event - updateTopic() call" );
            // let topicTitle = document.getElementById( 'tabTopicName' + tabName.match( /\d+/g ) );
            // ( debug ) ? console.log( "topicTitle: " + topicTitle );

            // const newTopic = await updateTopic( topicTitle.innerHTML )
            // // send the resources from the current;
            // const newTopic = await saveTopic( topicTitle.innerHTML, resources[currentTabIndex] );
            
            // ( debug ) ? console.log( "newTopic: " + JSON.stringify( newTopic ) );

            // // render the resource text area
            // createTextArea();

            //numTopics++;

        } );

        // Create drop zone filler space
        let newDropZoneFiller = document.createElement( "div" );
        newDropZoneFiller.className = "dropzone-filler";
        newDropZone.appendChild( newDropZoneFiller );

        // Create drop zone input
        let newDropZoneInput = document.createElement( "input" );
        newDropZoneInput.className = "drop-zone__input";
        newDropZoneInput.type = "file";
        newDropZone.appendChild( newDropZoneInput );
        createDropZoneEventListeners( newDropZone, newDropZoneInput );

        // Title element
        let title = document.createElement( 'input' );
        title.type = "text";
        title.className = "drop-zone__title";
        title.id = "input-title" + i;
        if( name ){
            title.value = name;
        }
        else{
            title.value = "Untitled";
        }

        // Edit icon
        let editIcon = document.createElement( 'span' );
        editIcon.setAttribute( "class", "material-symbols-outlined" );
        editIcon.setAttribute( "id", "edit-icon" + i );
        editIcon.innerHTML = "edit";
        editIcon.style.display = "none";

        // Done icon
        let doneIcon = document.createElement( 'span' );
        doneIcon.setAttribute( "class", "material-symbols-outlined" );
        doneIcon.setAttribute( "id", "done-icon" + i );
        doneIcon.innerHTML = "done";

        // New Tab
        let newTabIcon = document.createElement( 'span' );
        newTabIcon.setAttribute( "class", "material-symbols-outlined" );
        newTabIcon.setAttribute( "id", "open-tab-icon" + i );
        newTabIcon.innerHTML = "open_in_new";

        // Suneditor textarea
        let sunEditor = document.createElement( "textarea" );
        sunEditor.setAttribute( "id", "sunEditor" + i );

        

        /**
         * TODO: Evaluate
         */
        //Remove empty state if necessary
        // if ( resourcesZone.childElementCount > 0 ) {
            
        //     //let location = getTabLocation( tabName );
        //     ( debug ) ? console.log( "resourcesZone: " + resourcesZone.id );
        //     ( debug ) ? console.log( "resourcesZone with slice: " + JSON.stringify( activeTab ) );
        //     ( debug ) ? console.log( "number of empty-topic-dropzone: " + document.querySelectorAll( ".empty-topic-dropzone" ).length );
        //     ( debug ) ? console.log( "first-dropzone: " + document.querySelectorAll( ".first-dropzone" ).length );
        //     ( debug ) ? console.log( "here! --- : " + location );
        //     // document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
        //     // document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
        // }

        // Append elemets accordingly
        resourcesZone.appendChild( title );
        // resourcesZone.appendChild( newTabIcon );
        resourcesZone.appendChild( editIcon );
        resourcesZone.appendChild( doneIcon );
        resourcesZone.appendChild( sunEditor );
        resourcesZone.appendChild( newDropZone );

        // Maintain a baseline height until 1200px is exceeded
        activeHeightObj[activeTab] += 800;
        checkActiveHeight();
        //alert( "hold" );
        ( debug ) ? console.log( "createTextArea() complete promise cerated" ) : null;
        resolve( "TA created" );
    } );

    promise.then(
        ( ) => {
            createSunEditor( i );
            

            ( debug ) ? console.log( "createTextArea() complete promise then (suneditor) completed" ) : null;
        }
    );
}



const renderTextArea = function ( resourceContentHtml, i ) {
    ( debug ) ? console.log( "renderTextArea() : Start html: " + resourceContentHtml ) : null;
    if( resourceContentHtml && resourceContentHtml.length > 0 ){
                     
        let editor = "sunEditor" + ( i );


        //( debug ) ? console.log( editor );
        ( debug ) ? console.log( sunEditor[editor] ) : null;
        sunEditor[editor][1].insertHTML( resourceContentHtml );

        //docType1Count++;
        //val++;
    }
    ( debug ) ? console.log( "renderTextArea() : End" ) : null;
};



export { updateWorkspaceDom, createTopicsGui, createTextArea, renderTextArea, renderResourcesForActiveTopic };


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



// Creates a height object for each open topic
function createNewActiveHeight() {
    let tabElements = document.querySelectorAll( '.tabcontent' );
    activeHeightObj[tabElements[tabElements.length-1].id] = 0;
    activeHeightList.push( activeHeightObj[tabElements[tabElements.length-1].id] );
}


/* BEGIN Tab Functions ------------------------------------------------------------- */
// Change tabs
function openTab( tab ) {
    ( debug ) ? console.log( "openTab : " + tab + " id: " + tab.id + " name: " + tab.getAttribute( "name" ) ) : null;
    let i, tabcontent, tablinks;

    // activeTabUuid = tab.getAttribute( "name" );
    // activeTab = activeTab = document.getElementById( "resources-zone" + name.slice( -1 ) );

    tabcontent = document.getElementsByClassName( "tabcontent" );
    for ( i = 0; i < tabcontent.length; i++ ) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName( "tablinks" );
    for ( i = 0; i < tablinks.length; i++ ) {
        tablinks[i].className = tablinks[i].className.replace( " active", "" );
        tablinks[i].style.backgroundColor = "#17191a";
        tablinks[i].style.color = "white";
    }

    resourcesZone = document.getElementById( "resources-zone" + tab.id.slice( -1 ) );
    //currentTagId = name.slice( -1 );

    // Show the current tab
    document.getElementById( tab.id ).style.display = "block";

    // Set tab button to active
    for ( i=0; i<tablinks.length; i++ ) {
        if ( tablinks[i].id.slice( -1 ) == tab.id.slice( -1 ) ) {
            tablinks[i].className += " active";
            tablinks[i].style.backgroundColor = "#3f3f3f";
        }
    }
    ( debug ) ? console.log( "openTab : Complete" ) : null;
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
            openTab( tabContent[tabLocation+1] );
        }
        else if ( tabLocation-1 >= 0 ) {                                                          // Otherwise, open the tab to the left
            openTab( tabContent[tabLocation-1] );
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

const createSunEditor = async( num ) => {
    ( debug ) ? console.log( "createSunEditor() num: " + num ) : null;
    // eslint-disable-next-line no-undef
    sunEditor["sunEditor"+ num] = [ num, SUNEDITOR.create( "sunEditor" + num, {
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
        callBackSave: function ( contents ) {
            alert( contents );
        },
    } ) ];

    sunEditorList.push( sunEditor["sunEditor" + num] );
    ( debug ) ? console.log( "createSunEditor() complete" ) : null;
    window.scrollTo( 0, 0 );
};
