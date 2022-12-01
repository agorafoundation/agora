let tabName = "";

// Workspace resizing
let activeHeightObj = {};
let activeHeightList = [];

// Creates a height object for each open topic
function createNewActiveHeight() {
    let tabElements = document.querySelectorAll( '.tabcontent' );
    activeHeightObj[tabElements[tabElements.length-1].id] = 0;
    activeHeightList.push( activeHeightObj[tabElements[tabElements.length-1].id] );
}

// Implemented to ensure resources fill a 1200px space first and then grows as needed
function checkActiveHeight() {
    if ( activeHeightObj[tabName] < 1200 ) {
        let filler = document.createElement( "div" );
        filler.setAttribute( "id", "filler-space" );
        filler.style.height = ( 1200-activeHeightObj[tabName] ) + "px";
        activeTab.appendChild( filler );
    }
}





/* Topic Functions -------------------------------------------------------------------------- */
let numTopics = 1;
let topics = {};

// Creates a new topic
function createTopic( name ) {
    if( !name ){
        fetch( "api/v1/auth/topics", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "topicType": 1,
                "topicName": "Untitled",
                "topicDescription": "",
                "topicHtml": "",
                "assessmentId": 1,
                "hasActivity": false,
                "hasAssessment": false,
                "activityId": 1,
                "active": true,
                "visibility": 0,
                "resources": [],
                "createTime": Date.now(),
            } )
        } )
            .then( response => response.json() )
            .then( ( data ) => {
                console.log( data );
                // map the resulting topic id to the value used in topic elements
                topics[numTopics] = data.topicId;
                console.log( topics );
                numTopics++;
            } );
    }
    else{
        numTopics ++;
    }

    let tabContent = document.getElementsByClassName( "tabcontent" );
    let lastTab = tabContent[tabContent.length-1];
    let newTab = document.createElement( "div" );

    // Create the tab content and append to last tab
    newTab.id = "topic" + numTopics;
    newTab.className = "tabcontent";

    // If no topics are open...
    if ( lastTab == null ) {
        let workspaceEmptyState = document.getElementById( "workspace-empty-state" );
        workspaceEmptyState.parentNode.insertBefore( newTab, workspaceEmptyState.nextSibling );
        workspaceEmptyState.style.display = "none";
        document.getElementById( "topic-background" ).style.backgroundColor = "#ddd";
    }
    else {
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

    let topicTitle = document.createElement( "input" );
    topicTitle.type = "text";
    topicTitle.className = "topic-title";
    topicTitle.id = "topic-title" + numTopics;
    if( name ){
        topicTitle.placeholder = name;
    }
    else{
        topicTitle.placeholder = "Untitled";
    }

    let saveIcon = document.createElement( "span" );
    saveIcon.classList.add( "material-symbols-outlined" );
    saveIcon.classList.add( "saveBtn" );
    saveIcon.id = "save" + numTopics;
    saveIcon.innerHTML = "save_as";
    saveIcon.onclick = () => {
        let resources = getResources();
        updateTopic( topicTitle.value, resources );
    };

    let topicDivider = document.createElement( "div" );
    topicDivider.id = "topic-divider";

    let resourcesZone = document.createElement( "div" );
    resourcesZone.id = "resources-zone" + numTopics;
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
    tabBtn.id = "tablinks" + numTopics;
    if( name ){
        tabBtn.innerHTML = name;
    }
    else{
        tabBtn.innerHTML = "Untitled";
    }

    // Create close tab button
    let closeTabBtn = document.createElement( "span" );
    closeTabBtn.className = "close-tab";
    closeTabBtn.id = "close-tab" + numTopics;
    closeTabBtn.innerHTML = "&times;";
    tabBtn.appendChild( closeTabBtn );

    tabBtn.onclick = ( e ) => {
        if ( e.target.className.includes( "close-tab" ) ) {
            closeTab( e.target.id );
        } 
        else {
            openTab( newTab.id );
        }
    };

    let currTabs = document.querySelector( ".tab" );
    currTabs.appendChild( tabBtn );

    // Append all elements accordingly
    newTab.appendChild( topicContent );
    topicContent.appendChild( topicTitle );
    topicContent.appendChild( saveIcon );
    topicContent.appendChild( topicDivider );
    topicContent.appendChild( resourcesZone );
    resourcesZone.appendChild( newDropZone );
    resourcesZone.appendChild( emptyDropZone );
    emptyDropZone.appendChild( emptyState );
    emptyState.appendChild( label1 );
    emptyState.appendChild( label2 );


    createNewActiveHeight();
    openTab( newTab.id );
}

// Updates topic name
function updateTopic( name, resources ) {
    let id = getCurrTopicID();
    fetch( "api/v1/auth/topics", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "topicId": id,
            "topicName": name ? name : "Untitled",
            "resources": resources ? resources : []
        } )
    } )
        .then( response => response.json() )
        .then( ( data ) => {
            console.log( JSON.stringify( data ) );
            console.log( data.topicId );
        } );
}
/* END Topic Functions -------------------------------------------------------------------------------------- */







/* Tab Functions -------------------------------------------------------------------------------------------- */
// Workspace empty state
let activeTab = document.getElementById( "resources-zone0" );


// Change tabs
function openTab( name ) {
    tabName = name;
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName( "tabcontent" );
    for ( i = 0; i < tabcontent.length; i++ ) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName( "tablinks" );
    for ( i = 0; i < tablinks.length; i++ ) {
        tablinks[i].className = tablinks[i].className.replace( " active", "" );
        tablinks[i].style.backgroundColor = "#f1f1f1";
    }

    activeTab = document.getElementById( "resources-zone" + name.slice( -1 ) );

    // Show the current tab
    document.getElementById( name ).style.display = "block";

    // Set tab button to active
    for ( i=0; i<tablinks.length; i++ ) {
        if ( tablinks[i].id.slice( -1 ) == name.slice( -1 ) ) {
            tablinks[i].className += " active";
            tablinks[i].style.backgroundColor = "#ddd";
        }
    }
}

function closeTab( id ) {
    let tabContent = document.getElementsByClassName( "tabcontent" );
    let tablinks = document.getElementsByClassName( "tablinks" );
    let isActiveTab = false;
    let tabLocation = -1;

    let i = 0;
    while ( i<tabContent.length ) {
    // Find the tab content to be deleted
        if ( tabContent[i].id.slice( -1 ) == id.slice( -1 ) ) {
            // Check if the target tab is the active tab
            if ( id.slice( -1 ) == activeTab.id.slice( -1 ) ) {
                isActiveTab = true;
            }
            tabLocation = i;
        }
        i++;
    }

    if ( isActiveTab ) {
        if ( tabLocation+1 != tabContent.length ) {                                               // Open the tab to the right if there is one
            openTab( tabContent[tabLocation+1].id );
        }
        else if ( tabLocation-1 >= 0 ) {                                                          // Otherwise, open the tab to the left
            openTab( tabContent[tabLocation-1].id );
        }
        else if ( tabLocation-1 < 0 ) {                                                           // Show the workspace empty state if closing only open tab
            document.getElementById( "workspace-empty-state" ).style.display = "block";
            document.getElementById( "topic-background" ).style.backgroundColor = "#f1f1f1";
            activeTab = document.getElementById( "resources-zone0" );
        }
    }
    // Remove tab button and tab content
    // Closing non-active tabs doesn't change the active tab
    tablinks[tabLocation].remove();
    tabContent[tabLocation].remove();
}

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

async function createTopicTab( name ) {
    let tabContent = document.getElementsByClassName( "tabcontent" );
    let lastTab = tabContent[tabContent.length - 1];
    let newTab = document.createElement( "div" );

    // Create the tab content and append to last tab
    newTab.id = "topic" + numTopics;
    newTab.className = "tabcontent";

    // If no topics are open...
    if ( lastTab == null ) {
        let workspaceEmptyState = document.getElementById( "workspace-empty-state" );
        workspaceEmptyState.parentNode.insertBefore(
            newTab,
            workspaceEmptyState.nextSibling
        );
        workspaceEmptyState.style.display = "none";
        document.getElementById( "topic-background" ).style.backgroundColor = "#ddd";
    }
    else {
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

    let resourcesZone = document.createElement( "div" );
    resourcesZone.id = "resources-zone" + numTopics;
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
    tabBtn.id = "tablinks" + numTopics;
    if ( name ) {
        tabBtn.innerHTML = name;
    }
    else {
        tabBtn.innerHTML = "Topic " + numTopics;
    }

    // Create close tab button
    let closeTabBtn = document.createElement( "span" );
    closeTabBtn.className = "close-tab";
    closeTabBtn.id = "close-tab" + numTopics;
    closeTabBtn.innerHTML = "&times;";
    tabBtn.appendChild( closeTabBtn );

    tabBtn.onclick = ( e ) => {
        if ( e.target.className.includes( "close-tab" ) ) {
            closeTab( e.target.id );
        }
        else {
            openTab( newTab.id );
        }
    };

    let currTabs = document.querySelector( ".tab" );
    currTabs.appendChild( tabBtn );

    // Append all elements accordingly
    newTab.appendChild( topicContent );
    topicContent.appendChild( resourcesZone );
    resourcesZone.appendChild( newDropZone );
    resourcesZone.appendChild( emptyDropZone );
    emptyDropZone.appendChild( emptyState );
    emptyState.appendChild( label1 );
    emptyState.appendChild( label2 );

    numTopics++;
    createNewActiveHeight();
    openTab( newTab.id );
}
/* END Tab Functions ------------------------------------------------------------------- */







/* Tag Functions ------------------------------------------------------------------- */
document.getElementById( "mySearch" ).addEventListener( "keyup", () => {
    let input, filter, ul, li, tag, i;
    input = document.getElementById( "mySearch" );
    filter = input.value.toUpperCase();
    ul = document.querySelector( ".tag-list" );
    li = ul.getElementsByTagName( "li" );

    if ( filter == "" ) {
        ul.style.display = "none";
    }
    else {
        ul.style.display = "block";
        // Hide items that don't match search query
        for ( i = 0; i < li.length; i++ ) {
            tag = li[i].innerHTML;
            if ( tag.toUpperCase().indexOf( filter ) > -1 ) {
                li[i].style.display = "block";
            }
            else {
                li[i].style.display = "none";
            }
        }
    }
    // Always show new tag option
    // document.querySelector( "#new-tag-element" ).style.display = "block";
} );

// document.getElementById( "new-tag-element" ).addEventListener( "click", () => {
//     const tagName = document.getElementById( "mySearch" ).value;
//     newTag( tagName );
// } );

let currTagList = [];
function newTag( tagName ) {
    const ul = document.querySelector( ".tag-list" );
    const li = document.createElement( "li" );
    const searchList = document.querySelectorAll( ".tag-list-element" );

    // check that selected tag doesn't already exist
    let isActiveTag = false;
    for ( let i = 0; i < currTagList.length; i++ ) {
        if ( currTagList[i] ===  tagName ) {
            isActiveTag = true;
        }
    }
    if ( !isActiveTag ) {
        let wasSearched = false;
        for ( let i=0; i<searchList.length; i++ ) {
            if ( searchList[i].innerHTML === tagName ) {
                wasSearched = true;
            }
        }
        if ( !wasSearched ) {
            // Add the new tag to the search list if it doesn't already exist
            ul.appendChild( li );
            li.addEventListener( "click", () => {
                newTag( tagName );
            } );
        }

        // create the tag and add to existing tags
        li.setAttribute( "class", "tag-list-element" );
        li.innerHTML = tagName;
        addTag( li );
        currTagList.push( tagName );
    }
}

// Add new tag by pressing enter key
let ul = document.querySelector( ".tag-list" );
document.addEventListener( "keyup", function( e ) {
    const tagName = document.getElementById( "mySearch" ).value;
    if ( e.key == "Enter" && ul.style.display == "block" ) {
        newTag( tagName );
        document.querySelector( ".tag-list" ).style.display = "none";
        // document.querySelector( "#new-tag-element" ).style.display = "none";
        document.querySelector( "#mySearch" ).value = "";
    }
} );

function addTag( selectedTag ) {
    const currTags = document.getElementById( "curr-tags" );
    const newTag = document.createElement( "div" );

    newTag.innerHTML = selectedTag.innerHTML;
    newTag.setAttribute( "class", "styled-tags" );
    newTag.setAttribute( "id", "tag-" + newTag.innerHTML );
        
    // Create remove tag button
    let removeTagBtn = document.createElement( "span" );
    removeTagBtn.className = "close-tag";
    removeTagBtn.id = "close-tag-" + newTag.innerHTML;
    removeTagBtn.innerHTML = "&times;";
    removeTagBtn.style.color = "#aaa";

    removeTagBtn.addEventListener( "click", () => {
        // Get the id portion with the tag name
        document.getElementById( "tag-" + removeTagBtn.id.substring( 10 ) ).remove();
        for ( let i=0; i<currTagList.length; i++ ) {
            if ( removeTagBtn.id.substring( 10 ) === currTagList[i] ) {
                currTagList[i] = "";
            }
        }
    } );
    removeTagBtn.addEventListener( "mouseenter", () => {
        removeTagBtn.style.color = "black";
    } );
    removeTagBtn.addEventListener( "mouseleave", () => {
        removeTagBtn.style.color = "#aaa";
    } );

    newTag.appendChild( removeTagBtn );
    currTags.appendChild( newTag );
}
/* END Tag Functions ----------------------------------------------------------------------------------- */






/* Resource Functions --------------------------------------------------------------------------------- */
let resources = {};
// create a new resource
function createResource( name, type, imagePath, id ) {
    if( !id ){
    
        fetch( "api/v1/auth/resources", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "resourceId": -1,
                "resourceType": type,
                "resourceName": name ? name : "Untitled",
                "resourceDescription": "",
                "resourceContentHtml": "",
                "resourceImage": imagePath ? imagePath : "",
                "resourceLink": "",
                "isRequired": false,
                "active": true,
                "visibility": 0
            } )
        } )
            .then( response => response.json() )
            .then( ( data ) => {
                // console.log( JSON.stringify( data ) );
                console.log( data.resourceId );
                resources[numResources] = [ data.resourceId, getCurrTopicID() ];
                numResources++;
            } );
    }
    else{
        resources[numResources] = [ id, getCurrTopicID() ];
        numResources ++;
       
    }
   
}

// get the topic id based on the currently visible topic tab
function getCurrTopicID() {
    let topicVal = tabName.match( /\d+/g )[0];
    let topicID = topics[topicVal];
    return topicID;
}

// returns an array of resource id's within a given topic, sorted by position
function getResources() {
    let topicResources = document.querySelectorAll( '.drop-zone__title' );
    let sorted = [];
    for ( let i=0; i<topicResources.length; i++ ) {
        console.log( topicResources[i] );
        if ( topicResources[i].style.display == 'none' ) {
            console.log( true );
        }
        let val = topicResources[i].id.match( /\d+/g )[0];
        let propertyNames = Object.getOwnPropertyNames( resources );
        for ( let j=0; j<propertyNames.length; j++ ) {
            if ( val == propertyNames[j] && resources[val][1] == getCurrTopicID() ) {
                sorted.push ( resources[val][0] );
            }
        }
    }
    console.log( sorted );
    return sorted;
}

// Create the suneditor text area
let numResources = 1;
function createTextArea( name, id ) {
    // Text area has to be created before suneditor initialization, 
    // so we have to return a promise indicating whether or not text area has been successfully created
    let promise =  new Promise( ( resolve ) => {
        // workspace empty state
        if ( activeTab.id == "resources-zone0" ) {
            createTopic();
        }

        // Check for filler space
        if ( document.getElementById( "filler-space" ) ) {
            document.getElementById( "filler-space" ).remove();
        }

        // Create drop zone
        let newDropZone = document.createElement( "div" );
        newDropZone.className = "drop-zone";

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
        title.id = "input-title" + numResources;
        if( name ){
            title.placeholder = name;
        }
        else{
            title.placeholder = "Untitled";
        }

        // Edit icon
        let editIcon = document.createElement( 'span' );
        editIcon.setAttribute( "class", "material-symbols-outlined" );
        editIcon.setAttribute( "id", "edit-icon" + numResources );
        editIcon.innerHTML = "edit";
        editIcon.style.display = "none";

        // Done icon
        let doneIcon = document.createElement( 'span' );
        doneIcon.setAttribute( "class", "material-symbols-outlined" );
        doneIcon.setAttribute( "id", "done-icon" + numResources );
        doneIcon.innerHTML = "done";

        // New Tab
        let newTabIcon = document.createElement( 'span' );
        newTabIcon.setAttribute( "class", "material-symbols-outlined" );
        newTabIcon.setAttribute( "id", "open-tab-icon" + numResources );
        newTabIcon.innerHTML = "open_in_new";

        // Suneditor textarea
        let sunEditor = document.createElement( "textarea" );
        sunEditor.setAttribute( "id", "sunEditor" + numResources );

        // Remove empty state if necessary
        if ( activeTab.childElementCount > 0 ) {
            let location = getTabLocation( tabName );
            document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
            document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
        }

        // Append elemets accordingly
        activeTab.appendChild( title );
        activeTab.appendChild( newTabIcon );
        activeTab.appendChild( editIcon );
        activeTab.appendChild( doneIcon );
        activeTab.appendChild( sunEditor );
        activeTab.appendChild( newDropZone );

        // Maintain a baseline height until 1200px is exceeded
        activeHeightObj[tabName] += 800;
        checkActiveHeight();
        resolve( "TA created" );
    } );

    promise.then(
        ( value ) => {
            console.log( value );
            createSunEditor();
            if( name ){
                createResource( name, 1, null, id  );
            }
            else{
                createResource( null, 1, null );
            }
        }
    );
}


// Create the sun editor and initialize within designated text area
let sunEditor = {};
let sunEditorList = [];
const createSunEditor = async() => {
    // eslint-disable-next-line no-undef
    sunEditor["sunEditor"+numResources] = [ numResources, SUNEDITOR.create( "sunEditor" + numResources, {
        toolbarContainer: "#toolbar_container",
        showPathLabel: false,
        defaultTag: "p",
        charCounter: true,
        charCounterLabel: "Char Count",
        width: "100%",
        height: "auto",
        minHeight: "800px",
        defaultStyle: "font-size:15px;",
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
            console.log( contents );
        },
    } ) ];

    sunEditorList.push( sunEditor["sunEditor"+numResources] );
};

// update the sun editor contents
function updateSunEditor( id, name, contents ) {
    fetch( "api/v1/auth/resources", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "resourceId":  id,
            "resourceType": 1,
            "resourceName": name ? name : "Untitled",
            "resourceDescription": "",
            "resourceContentHtml": contents ? contents : "",
            "resourceImage": "",
            "resourceLink": "",
            "isRequired": false,
            "active": true,
            "visibility": 0
        } )
    } )
        .then( response => response.json() )
        .then( ( data ) => {
            console.log( JSON.stringify( data ) );
        } );
}

function getResourceID( val ) {
    let resourceID = resources[val][0];
    return resourceID;
}

/* Suneditor Events ------------------------------------------------------*/
document.addEventListener( "mousemove", function() {
    
    for ( let i=0; i<sunEditorList.length; i++ ) {
        sunEditorList[i][1].onChange = () => {
            sunEditorList[i][1].save();

            // actively get sun editor contents and make updates
            let contents = sunEditorList[i][1].getContents();
            let id = getResourceID( sunEditorList[i][0] );
            let title = document.getElementById( "input-title" + sunEditorList[i][0] ).value;
            updateSunEditor( id, title, contents );
        };
        sunEditorList[i][1].onKeyUp = ( e ) => {
            if ( e.key == "/" ) {
                sunEditorList[i].insertHTML(
                    '<div><button style=background:pink;>Hello</button></div>',
                    true
                );
            }
        };
    }
} );
/* END Suneditor Events ---------------------------------------------------------------------------------*/


/* Drag and Drop ------------------------------------------------------------------------- */
/**
 * Modified version of : https://codepen.io/dcode-software/pen/xxwpLQo
 */
// Workspace empty state drop zone
if ( document.querySelectorAll( ".drop-zone" ) ) {
    let dropZoneElement = document.querySelectorAll( ".drop-zone" )[0];
    let inputElement = dropZoneElement.lastElementChild;
    createDropZoneEventListeners( dropZoneElement, inputElement );
}

// Get the target drop zone
let targetDropZone = null;
document.addEventListener( "dragenter", ( e ) => {
    targetDropZone = e.target;
} );

function createDropZoneEventListeners( dropZone, input ) {
    dropZone.addEventListener( "dragover", ( e ) => {
        e.preventDefault();

        dropZone.firstElementChild.style.display = "block";

        if ( activeTab.childElementCount == 1 ||
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

/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
function updateThumbnail( dropZoneElement, file ) {
    // Create a topic if file dropped in workspace empty state
    if ( activeTab.id == "resources-zone0" ) {
        createTopic();
    } 
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
    inputTitle.id = "input-title" + numResources;
    inputTitle.className = "drop-zone__title";

    // Preview Icon
    let previewIcon = document.createElement( 'span' );
    previewIcon.setAttribute( "class", "material-symbols-outlined" );
    previewIcon.setAttribute( "id", "preview-icon" + numResources );
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
        const reader = new FileReader();
      
        reader.readAsDataURL( file );
        reader.onload = () => {
            thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
        };
        mydiv.style.height = "500px";
        activeHeightObj[tabName] += 500;
        createResource( file.name, 2, file.name );
    }
    else {
        thumbnailElement.style.backgroundSize = "200px";
        mydiv.style.height = "200px";
        activeHeightObj[tabName] += 200;
        createResource( file.name, 3, null );
    }
    mydiv.appendChild( inputfile );

    // Remove empty state if necessary
    let location = getTabLocation( tabName );
    if ( mydiv.childElementCount > 0 ) {
        document.querySelectorAll( ".empty-topic-dropzone" )[location].style.display = "none";
        document.querySelectorAll( ".first-dropzone" )[location].style.display = "block";
    }

    // File drop in topic empty state
    if ( targetDropZone === document.querySelectorAll( ".empty-state" )[location+1] ) {
        activeTab.firstChild.parentNode.insertBefore( inputTitle, activeTab.firstChild.nextSibling );
        inputTitle.parentNode.insertBefore( previewIcon, inputTitle.nextSibling );
        previewIcon.parentNode.insertBefore( mydiv, previewIcon.nextSibling );
        mydiv.parentNode.insertBefore( newDropZone, mydiv.nextSibling );
    }
    else {
        // File drop in workspace empty state
        if ( dropZoneElement === document.querySelectorAll( ".drop-zone" )[0] ) {
            activeTab.firstChild.parentNode.insertBefore( inputTitle, activeTab.firstChild.nextSibling );
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
/* END Drag and Drop ------------------------------------------------------------------------- */

/* END Resource Functions ---------------------------------------------------------------------------------*/




document.addEventListener( "click", function( e ) {
    // toggle edit and done icons
    if ( ( e.target.id ).includes( "done" ) ) {
        e.target.style.display = "none";
        document.getElementById( "edit-icon" + e.target.id.match( /\d+/g )[0] ).style.display = "block";
        sunEditor["sunEditor" + e.target.id.match( /\d+/g )[0]].readOnly( true );
    }
    if ( ( e.target.id ).includes( "edit" ) ) {
        e.target.style.display = "none";
        document.getElementById( "done-icon" + e.target.id.match( /\d+/g )[0] ).style.display = "block";
        sunEditor["sunEditor" + e.target.id.match( /\d+/g )[0]].readOnly( false );
    }

    // open suneditor in new tab
    if ( e.target.id.includes( "open-tab" ) ) {
        window.open( "http://localhost:4200/note", "_blank" );
    }

    // close tag list elements
    if ( document.querySelector( ".tag-list" ) && document.querySelector( ".tag-list" ).style.display == "block" ) {
        document.querySelector( ".tag-list" ).style.display = "none";
        // document.querySelector( "#new-tag-element" ).style.display = "none";
        document.querySelector( "#mySearch" ).value = "";
    }
    // if ( document.querySelector( "#new-tag-element" ) && document.querySelector( "#new-tag-element" ).style.display == "block" ) {
    //     document.querySelector( ".tag-list" ).style.display = "none";
    //     document.querySelector( "#new-tag-element" ).style.display = "none";
    //     document.querySelector( "#mySearch" ).value = "";
    // }

    if ( document.getElementById( "tablinks" + tabName.slice( -1 ) ) && e.target.className != "topic-title" ) {
        if ( document.getElementById( "topic-title" + tabName.slice( -1 ) ).value != "" ) {
            // change the tab name to the new topic title
            document.getElementById( "tablinks" + tabName.slice( -1 ) ).innerHTML = document.getElementById( "topic-title" + tabName.slice( -1 ) ).value;
            // updateTopic( tabName.slice( -1 ), document.getElementById( "topic-title" + tabName.slice( -1 ) ).value );
        } 
        else {
            document.getElementById( "tablinks" + tabName.slice( -1 ) ).innerHTML = "Untitled";
            // updateTopic( tabName.slice( -1 ), 'Unitled' );
        }

        // replace the close tab button
        let closeTabBtn = document.createElement( "span" );
        closeTabBtn.className = "close-tab";
        closeTabBtn.id = "close-tab" + tabName.slice( -1 );
        closeTabBtn.innerHTML = "&times;";
        document.getElementById( "tablinks" + tabName.slice( -1 ) ).appendChild( closeTabBtn );
    }
} );



/* Workspace Manager Modal ----------------------------------------------- */
const modal = document.getElementById( "resource-modal-div" );
const openBtn = document.getElementById( "new-element" );
const closeBtns = document.querySelectorAll( ".close" );
const createDocBtn = document.getElementById( "create-doc-div" );
const createTopicBtn = document.getElementById( "create-topic-div" );
const fileUploadBtn = document.getElementById( "file-upload-div" );
const openTopicBtn = document.getElementById( "open-topic-div" );
const openTopicModal = document.getElementById( "open-topic-modal-div" );

// open the modal
if( openBtn ) {
    openBtn.onclick = () => {
        modal.style.display = "block";
    };
}

//close the modal
if( closeBtns ) {
    closeBtns.forEach( ( btn ) => {
        btn.onclick = () => {
            if ( modal.style.display == "block" ) {
                modal.style.display = "none";
            }
            else if ( openTopicModal.style.display == "block" ) {
                openTopicModal.style.display = "none";
            }
        };
    } );
}

window.onclick = function( event ) {
    if ( event.target == modal ) {
        modal.style.display = "none";
    }
    else if ( event.target == openTopicModal ) {
        openTopicModal.style.display = "none";
    }
};

// option hover events
document.addEventListener( "mousemove", function( e ) {
    for ( let i=0; i<document.getElementsByClassName( "modal-icon" ).length; i++ ) {
        if ( e.target === document.getElementsByClassName( "modal-icon" )[i] ||
        e.target === document.getElementsByClassName( "option" )[i] ) {
            document.getElementsByClassName( "modal-icon" )[i].style.color = "black";
            document.getElementsByClassName( "option" )[i].style.color = "black";
            document.getElementsByClassName( "option" )[i].style.textDecoration = "underline";
        }
        else {
            document.getElementsByClassName( "modal-icon" )[i].style.color = "rgb(100, 98, 98)";
            document.getElementsByClassName( "option" )[i].style.color = "rgb(100, 98, 98)";
            document.getElementsByClassName( "option" )[i].style.textDecoration = "none";
        }
    }
} );

// option events
if ( createDocBtn ) { 
    createDocBtn.onclick = () => {
        modal.style.display = "none";
        createTextArea();
    };
}
if ( createTopicBtn ) {
    createTopicBtn.onclick = () => {
        modal.style.display = "none";
        createTopic();
    };
}
if ( fileUploadBtn ) {
    const pickerOpts = {
        types: [
            {
                description: 'Images',
                accept: {
                    'image/*': [ '.png', '.gif', '.jpeg', '.jpg' ]
                }
            },
        ],
        excludeAcceptAllOption: true,
        multiple: false
    };

    fileUploadBtn.addEventListener( "click", async() => {
        let promise =  new Promise( ( resolve ) => {
            let file = window.showOpenFilePicker( pickerOpts );
            resolve( file );
        } );

        promise.then(
            ( value ) => {
                console.log( value[0] );
                console.log( value[0].name );
            }
        );
    } );
}
if ( openTopicBtn ) {
    openTopicBtn.onclick = () => {
        modal.style.display = "none";
        openTopicModal.style.display = "block";
    };
}
/* END Workspace Manager Modal ----------------------------------------------- */

const toggleProfileList = () => {
    let arrow = document.getElementById( "profiles-toggle" );

    if ( arrow.classList.contains( "down-arrow" ) ) {
        document.getElementById( "permissions-box" ).style.display = "none";
        arrow.setAttribute( 'class', 'arrow up-arrow' );
    }
    else {
        document.getElementById( "permissions-box" ).style.display = "flex";
        arrow.setAttribute( 'class', 'arrow down-arrow' );
    }
};

function toggleProfile ( e ) {
    let target = e.target;
    let box;

    target.classList.contains( "permission-li" ) ? 
        box = target.childNodes[3] : 
        box = target.parentElement.childNodes[3];

    box.checked ?
        box.checked = false :
        box.checked = true;
}

if ( document.getElementById( "profiles-toggle" ) ) {
    document.getElementById( "profiles-toggle" ).addEventListener( "click", toggleProfileList );
}

var perms = document.getElementsByClassName( "permission-li" );

for ( let i = 0; i < perms.length; i++ ) {
    perms[i].addEventListener( "click", toggleProfile );
}










/* File Dropdown ----------------------------------------- */

// // Toggles the rendering of more options menu
// const toggleMoreOptions = () => {
//     if (document.getElementById('dropdown-content').getAttribute('style')) {
//         document.getElementById('dropdown-content').setAttribute('style','');
//     } else {
//         document.getElementById('dropdown-content').setAttribute('style',"display: block; right: 2%; top: 4%");
//     }
// }

// // If file modal is on, it turns off and vice versa
// const toggleFileModal = () => {
//     if (document.getElementById('file-display').getAttribute('class') === 'hidden') {
//     document.getElementById('file-display').setAttribute('class','file-display-shown');
//     } else {
//     document.getElementById('file-display').setAttribute('class','hidden');
//     }
// }

// // Checks if someone is clicking off modal and then closes it
// $('body').click(function (ev) {
//     if (document.getElementById('file-display').getAttribute('class') !== 'hidden') {
//         if (ev.target.id !== 'file-display-content' && ev.target.id !== 'show-files' && ev.target.id !== "file-display-name" && ev.target.id !== "file-display-icon" && ev.target.id !== "show-files" && ev.target.id !== 'new-file-icon' && ev.target.id !== 'new-file-coloring') {
//         document.getElementById('file-display').setAttribute('class','hidden');
//         }

//     }
// if (ev.target.id !== 'ellipsis')
//     document.getElementById('dropdown-content').setAttribute('style','');
// });

// const onClickTesting = () => {
//     console.log("clicked");
// }

// const returnFiles = () => {
//     return [{name: "file 1", onClick: onClickTesting()},{name: "file 2", onClick: onClickTesting()}];
// }

/* END File Dropdown ----------------------------------------- */
//////////////onload fetch functions //////////////////////


const prefixPattern = /#t/;

const idPattern = /-([0-9]+)/;

const getPrefixAndId = () => {

    const url = window.location.href;
    return [ prefixPattern.test( url ), idPattern.exec( url )[1] ];
};

const idAndFetch = () => {

    const [ isTopic, id ] = getPrefixAndId();

    if ( isTopic ) {
        fetch( "api/v1/auth/topics/" + id, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } )
            .then( ( response ) => response.json() )
            .then( ( response ) => {
                fillFields(
                    response.topicName,
                    response.topicDescription,
                    response.topicImage
                );
            } );
    }
    else {
        fetch( "api/v1/auth/workspaces/" + id, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } )
            .then( ( response ) => response.json() )
            .then( ( response ) => {
                fillFields(
                    response.workspaceName,
                    response.workspaceDescription,
                    response.workspaceImage
                );
            } );
    }
};

const fillFields = ( title, description, image ) => {
    document.getElementById( "workspace-title" ).value = title.trim();
    document.getElementById( "workspace-desc" ).value = description.trim();
};

const renderTopics = async ( workspace ) => {
    const response = await fetch( "api/v1/auth/topics" );
    let topics = await response.json();
    //console.log( topics )
    let topicList = [];
    for( let i = 0; i < topics.length; i++ ) {
        topicList.push( topics[i].topicId );
    }
    if ( topicList.length > 0 ) {
        for ( let i = 0; i < topicList.length; i++ ) {
            await renderTopic( topicList[i] );
            
        }
    }
   
};

//change order so the create stuff will all happen after information is gathered
async function renderTopic( topicId ) {
    const response = await fetch( "api/v1/auth/topics/" + topicId );
    const topicData = await response.json();
    await createTopic( topicData.topicName );
    const resources = await renderResources( topicId );
    if ( resources.length > 0 ) {
        let docType1Count = 0;
        for ( let i = 0; i < resources.length; i++ ) {
            //if resource is a document
            if( resources[i].resourceType == 1 ){
                await createTextArea( resources[i].resourceName, resources[i].resourceId );
                if( resources[i].resourceContentHtml.length > 0 ){
                    sunEditorList[docType1Count][1].insertHTML( resources[i].resourceContentHtml );
                    docType1Count++;
                }
            }
            
        }
        window.scrollTo( 0, 0 );
    }
    return topicData;
}

async function renderResources( topicId ) {
    //console.log( topicId );
    const response = await fetch( "api/v1/auth/topics/resources/" + topicId );
    const data = await response.json();
    //console.log( data );
    return data;
}

window.addEventListener( "load", () => {
    idAndFetch();
    renderTopics();
   
} );



////////* discussions code *///////

//////New Comment/////
const addComment = async ( user, pfp, text, isTopic, id ) => {
    if ( text ) {

        let commentId, date, type;

        date = new Date();

        const hasComments = await document.querySelectorAll( ".comment-countable" ).length;

        isTopic ? type = "topic" : type = "workspace";

        id = parseInt( id, 10 );

        if ( !hasComments ) {
            console.log( "Creating discussion" );
            await fetch( "api/v1/auth/discussions/" + type + "/" + id, 
                { method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify( {  
                        "parent_id": id,
                        "parent_type": type,
                        "discussion_text": "string"     
                    } )
                } );
            /*.then( ( response ) => response.json() )
            .then( ( data ) => {
                console.log( data );
            } );*/
        }
        
        await fetch( "api/v1/auth/discussions/comment", 
            { method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    "parent_id": id, 
                    "parent_type": type,
                    "comment_text": text
                } ) 
            } )
            .then( ( response ) => response.json() )
            .then( ( data ) => {
                //console.log( data );
                commentId = data.id;
            } );
            
        ///UPDATING THE DOM///

        //cloning the comment template so we can modify it then add it to the stream
        let newEl = document.getElementById( "comment-template" ).cloneNode( true );

        //setting the attributes of the comment
        newEl.style.display = "block";
        newEl.id = commentId;
        newEl.childNodes[1].childNodes[1].innerText = pfp;
        newEl.childNodes[1].childNodes[3].innerText = user;
        newEl.childNodes[3].innerText = text;
        newEl.childNodes[5].childNodes[5].innerText = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
        newEl.classList.add( "comment-countable" );

        //make sure the like button works
        newEl.querySelector( "#like-button" ).addEventListener( "click", addOrRemoveLike );

        //inserting the modified clone into the comment stream
        document.getElementById( "discussions-body" ).insertBefore( newEl, document.getElementById( "post-comment-btn" ).nextSibling );  

        //removing the value from the textarea
        document.getElementById( "discussion-textarea" ).innerText = '';
    }
    else {
        window.alert( "You cannot leave a blank comment" );
    }
};


//window.onload rendering comment
const loadComment = ( {user_id, pfp = "account_circle", comment_text, created_at, id, likes } ) => {

    //cloning the comment template so we can modify it then add it to the stream
    let newEl = document.getElementById( "comment-template" ).cloneNode( true );

    //setting the attributes of the comment
    newEl.style.display = "block";
    newEl.id = id;
    newEl.childNodes[1].childNodes[1].innerText = pfp;
    newEl.childNodes[1].childNodes[3].innerText = user_id;
    newEl.childNodes[3].innerText = comment_text;
    newEl.childNodes[5].childNodes[5].innerText = created_at;
    newEl.childNodes[5].childNodes[1].childNodes[3] = likes;
    newEl.classList.add( "comment-countable" );

    //make sure the like button works
    newEl.querySelector( "#like-button" ).addEventListener( "click", addOrRemoveLike );

    /*Fetch for checking if user has liked post. If so, 
    assign "liked" class to comment. Either way, 
    change dom to reflect like status */

    //inserting the modified clone under the proper discussion
    document.getElementById( "discussions-body" ).insertBefore( newEl, document.getElementById( "post-comment-btn" ).nextSibling );  
};

const getDiscussions = async ( isTopic, id ) => {

    let pageComments;

    if ( isTopic ) {
        await fetch( "api/v1/auth/discussions/topic/" + id, {
            headers: { "Content-Type": "application/json" }
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) => {
                data ?
                    pageComments = data.comments :
                    pageComments = null;
            } );
    } 
    else {
        await fetch( "api/v1/auth/discussions/workspace/" + id, {
            headers: { "Content-Type": "application/json" }
        } )
            .then( ( response ) => response.json() )
            .then( ( data ) => {
                data ?
                    pageComments = data.comments :
                    pageComments = null;
            } );
    }

    if ( pageComments ) {
        await pageComments.forEach( ( comment ) => {
            loadComment( comment );
        } );
    }
    
};


window.addEventListener( "load", () => {

    const [ isTopic, id ] = getPrefixAndId();
    
    document.getElementById( "post-comment-btn" ).addEventListener( "click", () => {
        addComment( "Max", "account_circle", document.getElementById( "discussion-textarea" ).innerText, isTopic, id );
    } );

    getDiscussions( isTopic, id );
} );


///////Like Button////////

const addOrRemoveLike = ( e ) => {

    let goodElement;

    //making sure the element we are clicking is the one we're looking to use
    e.target.id ? 
        goodElement = e.target.childNodes[3] : 
        e.target.style ? 
            goodElement = e.target.parentElement.childNodes[3] : 
            goodElement = e.target;

    let parentEl = goodElement.parentElement.parentElement.parentElement;

    if ( parentEl.classList.contains( "liked" ) ) {
        parentEl.classList.remove( "liked" );
        goodElement.innerText = parseInt( goodElement.innerText, 10 ) - 1;
        goodElement.parentElement.childNodes[1].style.color = "black";
        goodElement.style.color = "black";
        goodElement.parentElement.style.outline = "2px solid gray";

        fetch( "api/v1/auth/discussions/rating/" +  parentEl.id, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { "rating": true } )
        } );

    } 
    else {
        parentEl.classList.add( "liked" );
        goodElement.innerText = parseInt( goodElement.innerText, 10 ) + 1;
        goodElement.parentElement.childNodes[1].style.color = "gray";
        goodElement.style.color = "gray";
        goodElement.parentElement.style.outline = "none";

        fetch( "api/v1/auth/discussions/rating/" +  parentEl.id, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify( { "rating": false } )
        } );
    }
};
