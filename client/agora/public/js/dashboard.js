/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

//creates a empty topic
const createNewTopic = async () => {
    console.log( "about to send topic!!!!!" );
    const temp = fetch( "api/v1/auth/topics", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( {
            "topicId": -1,
            "topicType": 1,
            "topicName": "Untitled",
            "topicDescription": "",
            "active": true,
            "topicVisibility": "private",
        } )
    } )
        .then( response => response.json() )
        .then( response => window.location.href = "/topic#t-" + response.topicId );
};

//creates a empty topic
const createNewWorkspace = async () => {
    fetch( "api/v1/auth/workspaces", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( {
            "workspaceId": -1,
            "workspaceName": "Untitled",
            "workspaceDescription": "",
            "workspaceImage": "myImage.png",
            "active": true,
            "completable": true,
            "visibility": "private",
        } )
    } )
        .then( response => response.json() )
        .then( response => window.location.href = "/topic#w-" + response.workspaceId );
};




//edit is a number if editing a resource, false if adding a resource
//prefix indicates whether card is workspace or topic
const duplicateOrEditResource = ( prefix, name, description, edit ) => {
    let id = -1;
    if ( edit ) {
        id = edit;
    }

    //if workspace
    if( prefix === "w-" ) {
        fetch( "api/v1/auth/workspaces", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "workspaceId": id,
                "workspaceName": name,
                "workspaceDescription": description,
                "workspaceImage": "myImage.png",
                "active": true,
                "completable": true,
                "visibility": "private",
            } )
        } )
            .then( response => response.json() )
            .then( response => {
                return response.workspaceId;
            } );
    //if topic
    } 
    else {
        fetch( "api/v1/auth/topics", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( {
                "topicId": id,
                "topicType": 1,
                "topicName": name,
                "topicDescription": description,
                "topicImage": "myImage.png",
                "topicHtml": "<div><img src=\"myImage.png\" width=\"500\" height=\"500\"></div>",
                "assessmentId": 1,
                "hasActivity": false,
                "hasAssessment": false,
                "activityId": 1,
                "active": true,
                "topicVisibility": "private",
            } )
        } )
            .then( response => response.json() )
            .then( response => {
                return response.topicId;
            } );
    }
};

const deleteResource = async ( resourceId, prefix ) => {
    if ( prefix === "w-" ) {
        const response = await fetch( "api/v1/auth/workspaces/" + resourceId, { method: "DELETE" } );
        if( response.ok ) {
            await response.json();
        }
    } 
    else {
        const response = await fetch( "api/v1/auth/topics/" + resourceId, { method: "DELETE" } );
        if( response.ok ) {
            await response.json();
        }
    }
};

/* note-gallery edit modal */
function viewModal( id, name, desc ) {
    let nameId = "card-title-" + id;
    let descId = "card-desc-" + id;
    document.getElementById( "viewModalLabel" ).textContent =
    document.getElementById( nameId ).textContent;
    document.getElementById( "note-modal-description" ).textContent =
    document.getElementById( descId ).textContent;
}

/*more options toggle*/
function toggleMoreOptionsOn( id ) {
    const dropId = id.substring( 0, 5 ) + "option-" + id.substring( 5 );

    document.getElementById( dropId ).style.visibility = "visible";
}

function toggleMoreOptionsOff( id ) {
    const dropId = id.substring( 0, 5 ) + "option-" + id.substring( 5 );

    document.getElementById( dropId ).style.visibility = "hidden";
}


const toggleWorkspaceView = () => {
    const cards = document.getElementsByClassName( "view-check" );
    for ( let i = 0; i < cards.length; i++ ) {
        if ( ( cards[i].classList ).contains( "a-workspace" ) ) {
            cards[i].classList.remove( "d-none" );
        }
        else {
            cards[i].classList.add( "d-none" );
        }
    }
};



// currently not used because the default view is workspace - URBG 20230123 - there used to be the ability to show topics
const toggleTopicView = () => {
    const cards = document.getElementsByClassName( "view-check" );
    for ( let i = 0; i < cards.length; i++ ) {
        if ( ( cards[i].classList ).contains( "a-workspace" ) ) {
            cards[i].classList.add( "d-none" );
        }
        else {
            cards[i].classList.remove( "d-none" );
        }
    }
};

const toggleAllView = () => {
    const cards = document.getElementsByClassName( "view-check" );
    for ( let i = 0; i < cards.length; i++ ) {
        cards[i].classList.remove( "d-none" );
    
    }
};
// end currently not used


// default to workspace, option to change removed - URBG 20230123 - see https://github.com/briangormanly/agora/issues/357
toggleWorkspaceView();

//////More Options Helpers//////

//makes sure event pointer detects the proper element
const goodElement = ( e ) => {
    if ( e.target.id ) {
        return e.target;
    }
    else {
        return e.target.parentElement;
    }
};

//returns true if e points to grid view, false if list view
const isGrid = ( e ) => {
    e = goodElement( e );
    if ( e.parentElement.parentElement.classList[4] === "grid-options" ) {
        return true;
    }
    else {
        return false;
    }
};

//return true if topic, false if workspace
//e is pointer event
const isTopic = ( e ) => {
    let output = false;
    const GE = goodElement( e );
    if ( isGrid( e ) ) {
        if ( ( GE.parentElement.parentElement.id ).charAt( 0 ) === "t" ) {
            output = true;
        }
    }
    else {
        if ( ( GE.parentElement.parentElement.parentElement.id ).charAt( 0 ) === "t" ) {
            output = true;
        }
    }
    return output;
};

////returns the id of the element e is pointing to
const getId = ( e ) => {
    const GE = goodElement( e );
    let parent;
    if ( isGrid( e ) ) {
        parent = GE.parentElement.parentElement.parentElement.id; //the id of the grid element
    }
    else {
        parent = GE.parentElement.parentElement.parentElement.parentElement.id; //the id of the list element
    }

    return parent.substring( 5 ); //just the numeric id
};

////////Create a toast/////////
const createToast = ( text ) => {
    document.getElementById( 'toast-text' ).innerText = text;
    const thisToast = document.getElementById( 'liveToast' );
    // eslint-disable-next-line no-undef
    const toast = new bootstrap.Toast( thisToast );
    toast.show();
};

////////////Updating the rename modal//////////

//updating the input DOM of the rename-modal depending on the selected card
const fillNameandDescription = ( e ) => {
    let parentId = getId( e );
    let prefix;
    isTopic( e ) ? prefix = "t-" : prefix = "w-";

    let parentNameId = "card-title-" + parentId;
    let parentDescId = "card-desc-" + parentId;

    let parentName = document.getElementById( prefix + "lv-" + parentNameId ).innerText;
    let parentDesc = document.getElementById( prefix + "gv-" + parentDescId ).innerText;

    //setting the onclick event of the save button depenidng on the id of the clicked card
    document
        .getElementById( "save-name" )
        .setAttribute(
            "onclick",
            `updateSaveButton(${JSON.stringify( parentNameId )},${JSON.stringify(
                parentDescId )},${JSON.stringify( prefix )})`
        );

    //filling the input fields of the modal to the current values
    if ( parentName ) {
        document.getElementById( "note-modal-name" ).value = parentName;
    }
    if ( parentDesc ) {
        document.getElementById( "note-modal-description" ).value = parentDesc;
    }
    else {
        document.getElementById( "note-modal-description" ).value = "";
    }

    //showing the modal
    document.getElementById( "rename-modal" ).style.display = "block";
    document.getElementById( "backdrop" ).style.display = "block";
    document.getElementById( "rename-modal" ).classList.add( "show" );

    e.stopPropagation();
};

//A collection of all the rename buttons
var cards = document.querySelectorAll( "#rename-card" ).forEach( ( card ) => {
    card.addEventListener( "click", fillNameandDescription );
} );

//changing the properties of the save button of the rename-modal depending on the selected card
const updateSaveButton = ( nameId, descId, prefix ) => {
    let name = ( document.getElementById( "note-modal-name" ).value ).trim();
    let desc = ( document.getElementById( "note-modal-description" ).value ).trim();
    if ( name ) {
        document.getElementById( prefix + "gv-" + nameId ).innerText = name;
        document.getElementById( prefix + "lv-" + nameId ).innerText = name;
        document.getElementById( prefix + "gv-" + descId ).innerText = desc;    

        duplicateOrEditResource( prefix, name, desc, descId.substring( 10 ) );

        closeRenameModal();
    }
    else {
        window.alert( "All workspaces/topics must have a name" );
    }

  
};

//hides rename modal
const closeRenameModal = () => {
    document.getElementById( "rename-modal" ).style.display = "none";
    document.getElementById( "backdrop" ).style.display = "none";
    document.getElementById( "rename-modal" ).classList.remove( "show" );
};

//Triggers when the "x" on the rename-modal is clicked
const removeText = ( type ) => {
    if ( type === "name" ) {
        document.getElementById( "note-modal-name" ).value = "";
    }
    else if ( type === "desc" ) {
        document.getElementById( "note-modal-description" ).value = "";
    }
};

//////////*Updating the delete modal*/////////////

//updating the input DOM of the delete-modal depending on the selected card
const showDeleteModal = ( e ) => {
    let parentId = getId( e );
    
    let prefix;
    isTopic( e ) ? prefix = "t-" : prefix = "w-"; 
   
    let parentNameId;

    if ( isGrid( e ) ) {
        parentNameId = prefix + "gv-card-title-" + parentId;
    }
    else {
        parentNameId = prefix + "lv-card-title-" + parentId;
    }
   
    let parentName = document.getElementById( parentNameId ).innerText;

    //setting the text inside the delete modal to show user what they're deleting
    document.getElementById( "to-be-deleted-name" ).innerText = parentName.trim();

    //setting the properties of the confirm button to delete the correct card
    document
        .getElementById( "confirm-delete" )
        .setAttribute( "onclick", `updateDeleteConfirmButton(${JSON.stringify( parentId )}, ${JSON.stringify( prefix )})` );

    //showing the delete modal
    document.getElementById( "delete-modal" ).style.display = "block";
    document.getElementById( "backdrop2" ).style.display = "block";
    document.getElementById( "delete-modal" ).classList.add( "show" );

    e.stopPropagation();
};

//A collection of the delete buttons
var deleteCards = document
    .querySelectorAll( "#delete-card" )
    .forEach( ( deleteCard ) => {
        deleteCard.addEventListener( "click", showDeleteModal );
    } );

//changing the properties of the confirm button of the delete-modal depending on the selected card
const updateDeleteConfirmButton = ( id, prefix ) => {
    document.getElementById( prefix + "gv-" + id ).parentElement.remove();
    document.getElementById( prefix + "lv-" + id ).remove();

    deleteResource( id, prefix );

    getTopics();
    exitDeleteModal();
};

//close delete modal
function exitDeleteModal() {
    document.getElementById( "delete-modal" ).style.display = "none";
    document.getElementById( "backdrop2" ).style.display = "none";
    document.getElementById( "delete-modal" ).classList.remove( "show" );
}

//////onclick handling for topic rerouting//////////

const topicReroute = ( id, newTab, prefix ) => {
    let usedPrefix;
    if ( prefix ) {
        usedPrefix = prefix;
    }
    else {
        usedPrefix = id.substring( 0, 2 );
    }

    const title = document.getElementById( usedPrefix + "lv-card-title-" + id );
    const description = document.getElementById( usedPrefix + "gv-card-desc-" + id );

    //pass the title and description to backend
    if ( newTab ) {
        window.open( "/topic#" + usedPrefix + id, "_blank" );
    }
    else {
        /*if (usedPrefix === "-t") {
            window.location.href = "/topic#" + usedPrefix + id.substring( 5 );
        } else {
            window.location.href = "/workspace#" + usedPrefix + id.substring( 5 );
        }*/
        window.location.href = "/topic#" + usedPrefix + id.substring( 5 );
    }
};

///////////////Open in new tab button///////////////

const openInNewTab = ( e ) => {
    let parentId = getId( e );
    let prefix;
    isTopic( e ) ? prefix = "t-" : prefix = "w-";

    topicReroute( parentId, true, prefix );

    e.stopPropagation();
};

//A collection of the new tab buttons
var newTabCards = document
    .querySelectorAll( "#new-tab-card" )
    .forEach( ( newTabCard ) => {
        newTabCard.addEventListener( "click", openInNewTab );
    } );

//////////////////Copy to clipboard//////////////////

const copyLink = ( e ) => {
    let parentId = getId( e );

    let prefix;
    isTopic( e ) ? prefix = "t-" : prefix = "w-";

    navigator.clipboard.writeText( "http://localhost:4200/topic#" + prefix + parentId );

    createToast( "Copied Link!" );

    e.stopPropagation();
};


var copyLinkCards = document
    .querySelectorAll( "#copy-link-card" )
    .forEach( ( copyLinkCard ) => {
        copyLinkCard.addEventListener( "click", copyLink );
    } );


////////*Handling Duplicate*/////////////

//handles cloning a card then updating it's id and properties
const duplicateWorkspace = async ( e ) => {
  
    let parentId = getId( e );
   
    let prefix;
    isTopic( e ) ? prefix = "t-" : prefix = "w-";

    let gridParent = document.getElementById( prefix + "gv-" + parentId ).parentElement;
    let listParent = document.getElementById( prefix + "lv-" + parentId );

    //creating separate, autonomous element that's a clone of the original
    let gridClone = gridParent.cloneNode( true );
    let listClone = listParent.cloneNode( true );
   
    //getting the next id to use

    let nameOfClone = gridParent.childNodes[1].childNodes[3].childNodes[1].innerText + " (copy)";
    
    //fetch call to update backend
    const newId = await duplicateOrEditResource( prefix, nameOfClone, gridParent.childNodes[1].childNodes[3].childNodes[3].innerText, null );

    //changing the ids in the cloned element
    gridClone = replaceIds( gridClone, newId, true, prefix );
    listClone = replaceIds( listClone, newId, false, prefix );
    
    //calculating new id then setting the elements ids to the new one

    //updating the more options of the grid clone
    gridClone.childNodes[1].childNodes[1].childNodes[3].childNodes[1].addEventListener(
        "click",
        showDeleteModal
    ); //delete
    gridClone.childNodes[1].childNodes[1].childNodes[3].childNodes[3].addEventListener(
        "click",
        duplicateWorkspace
    ); //duplicate
    gridClone.childNodes[1].childNodes[1].childNodes[3].childNodes[5].addEventListener(
        "click",
        copyLink
    ); //open in new tab
    gridClone.childNodes[1].childNodes[1].childNodes[3].childNodes[7].addEventListener(
        "click",
        openInNewTab
    ); //open in new tab
    gridClone.childNodes[1].childNodes[1].childNodes[3].childNodes[9].addEventListener(
        "click",
        fillNameandDescription
    ); //rename

    ///////////////////////
    //updating the more options of the list clone

    listClone.childNodes[7].childNodes[3].childNodes[1].childNodes[1].addEventListener(
        "click",
        showDeleteModal
    );
    listClone.childNodes[7].childNodes[3].childNodes[1].childNodes[3].addEventListener(
        "click",
        duplicateWorkspace
    );
    listClone.childNodes[7].childNodes[3].childNodes[1].childNodes[5].addEventListener(
        "click",
        copyLink
    );
    listClone.childNodes[7].childNodes[3].childNodes[1].childNodes[7].addEventListener(
        "click",
        openInNewTab
    );
    listClone.childNodes[7].childNodes[3].childNodes[1].childNodes[9].addEventListener(
        "click",
        fillNameandDescription
    );


    //makes the ellipsis of the clone hidden on initialization
    gridClone.childNodes[1].childNodes[1].style.visibility = "hidden";

    //adding element to dom
    const gridContainer = document.getElementById( "gallery-row" );
    const listContainer = document.getElementById( "list-column" );
    placeElement( gridClone, listClone, gridContainer, listContainer, prefix );

    getTopics();

    createToast( "Duplicated " + nameOfClone.trim() );

    e.stopPropagation();
        
};

//A collection of the duplicate buttons
var duplicateCards = document
    .querySelectorAll( "#duplicate-card" )
    .forEach( ( duplicateCard ) => {
        duplicateCard.addEventListener( "click", duplicateWorkspace );
    } );


const placeElement = ( gridElement, listElement, gridContainer, listContainer, prefix ) => {
    if ( prefix === "w-" ) {
        gridContainer.insertBefore( gridElement, gridContainer.childNodes[2] );

        listContainer.insertBefore( listElement, listContainer.childNodes[2] );
    } 
    else {
        gridContainer.insertBefore( gridElement, gridContainer.querySelector( ".a-topic" ) );

        listContainer.insertBefore( listElement, listContainer.querySelector( ".a-topic" ) );
    }
};

//handles updating an element's various ids
const replaceIds = ( element, newId, grid, prefix ) => {
    if ( grid ) {   //if element is in grid view
        element.childNodes[1].id = prefix + "gv-" + newId; //main id

        element.childNodes[1].childNodes[1].id = prefix + "gv-option-" + newId; //option id
    
        element.childNodes[1].childNodes[3].childNodes[1].id = prefix + "gv-card-title-" + newId; //card title id
    
        element.childNodes[1].childNodes[3].childNodes[3].id = prefix + "gv-card-desc-" + newId; //card description id
    }
    else {  //if element is in list view
        element.id = prefix + "lv-" + newId; //main id

        element.childNodes[1].id = prefix + "lv-card-title-" + newId;  //card title id

        element.childNodes[5].id = prefix + "lv-option-" + newId;  //option id
    }
    return element;
};

////////search functions////////////

//contains all topic/workspace cards
var topicArr = [];

//dynamically updates depending on search input
var removedTopics = [];

//this needs to be called whenever the topics are added or removed
const getTopics = () => {
    topicArr = document.querySelectorAll( '.query-countable' );
};

window.addEventListener( 'load', () => {
    getTopics();
    toggleGrid();
} );

//what changes the DOM and modifies removed topics depending on search
//newVal is the input value
//arr is the topicArray
const queryTopics = ( newVal, arr ) => {
    let elemName, idToRemove, badListElement, badGridElement, addedElements, prefix;
    const len = arr.length;
    newVal = newVal.toLowerCase();

    for ( let i = 0; i < len; i++ ) {
        elemName = arr[i].childNodes[1].childNodes[3].childNodes[1].innerText.toLowerCase();  //name of arr[i] element to be tested
    
        idToRemove = ( arr[i].childNodes[1].id ).substring( 5 ); //id of the element being checked

        prefix = ( arr[i].childNodes[1].id ).substring( 0, 2 );  //indicates whether is workspace or topic

        if ( !elemName.includes( newVal ) ) {   //checking query
  
            if ( !hasElement( idToRemove, prefix, removedTopics ) ) {  //has this element not yet already been removed?

                badListElement = document.getElementById( prefix + "lv-" + idToRemove ); //element in list view to be removed

                badGridElement = document.getElementById( prefix + "gv-" + idToRemove ).parentNode;   //element in grid view to be removed

                removedTopics.push( { gridElement: badGridElement, listElement: badListElement, id: idToRemove, prefix: prefix } );   //add element to removedTopics

                badListElement.style.display = "none";
                badGridElement.style.display = "none";
            }
        }
        else if ( hasElement( idToRemove, prefix, removedTopics ) ) {  //does the query name exist in removedTopics?

            addedElements = getElement( idToRemove, prefix, removedTopics );

            addedElements.gridEl.style.display = "block";
            addedElements.listEl.style.display = "block";

            removedTopics = removeElement( idToRemove, prefix, removedTopics );  //remove element from removedTopics
        }
    }
};

//checks if removedTopics contains a certain id
const hasElement = ( id, prefix, removed ) => {
    let done = false, index = 0;
    const removedLength = removed.length;
    while ( !done && index < removedLength ) {
        if ( removed[index].id === id && removed[index].prefix === prefix ) {
            done = true;
        }
        index++;
    }
    return done;
};

//returns an element from removedTopics depending on id
const getElement = ( id, prefix, removed ) => {
    let done = false, index = 0, output = null;
    const removedLength = removed.length;
    while ( !done && index < removedLength ) {
        if ( removed[index].id === id && removed[index].prefix === prefix ) {
            output = {gridEl: removed[index].gridElement, listEl: removed[index].listElement};
            done = true;
        }
        index++;
    }
    return output;
};

//Removes an element from removedTopics then returns the updated array
const removeElement = ( id, prefix, removed ) => {
    let done = false, index = 0;
    const removedLength = removed.length;
    while ( !done && index < removedLength ) {
        if ( removed[index].id === id && removed[index].prefix === prefix ) {
            done = true;
            removed.splice( index, 1 );
        }
        index++;
    }
    return removed;
};

//////View Toggle////////////

const toggleGrid = () => {
    if( document.getElementById( "list-container" ) ) {
        document.getElementById( "list-container" ).style.display = "none";
    }
    if( document.getElementById( "main-container" ) ) {
        document.getElementById( "main-container" ).appendChild( document.getElementById( "grid-container" ) );
    }
    if( document.getElementById( "grid-container" ) ) {
        document.getElementById( "grid-container" ).style.display = "block";
    }

    if ( document.getElementById( "controlbar-buttons-group-2" ) ) {
        document.getElementById( "select-list" ).classList.remove( "active" );
        document.getElementById( "select-grid" ).classList.add( "active" );
    }
};

const toggleList = () => {
    document.getElementById( "grid-container" ).style.display = "none";
    document.getElementById( "main-container" ).appendChild( document.getElementById( "list-container" ) );
    document.getElementById( "list-container" ).style.display = "block";
    
    if ( document.getElementById( "controlbar-buttons-group-2" ) ) {
        document.getElementById( "select-grid" ).classList.remove( "active" );
        document.getElementById( "select-list" ).classList.add( "active" );
    }
};

const logout = () => {
    if( confirm( "Are you sure you want to logout?" ) === true ){
        window.location.href = "/signout";
    }
};

// set the initial selections in the control bar
window.addEventListener( 'load', () => {
    if( document.getElementById( "controlbar-buttons-group-1" ) ) {
        document.getElementById( "all-initial-selection" ).classList.add( "active" );
    }

    if( document.getElementById( "controlbar-buttons-group-2" ) ) {
        document.getElementById( "select-grid" ).classList.add( "active" );

        showTooltip( "select-grid", "Grid View" );
        hideTooltip( "select-grid" );

        showTooltip( "select-list", "List View" );
        hideTooltip( "select-list" );

        showTooltip( "btn-logout", "Logout" );
        hideTooltip( "btn-logout" );
    }
} );

function showTooltip( id, text ) {
    document.getElementById( id ).addEventListener( "mouseenter", ( e ) => {
        let tooltip = document.getElementById( "control-bar-tooltip" );
        let offset = getOffset( document.getElementById( id ) );
        
        tooltip.innerText = text;

        tooltip.style.top = ( offset.top + 45 ) + "px";
        tooltip.style.left = ( offset.left - 13 )  + "px";

        tooltip.style.visibility = "visible";
    } );
}

function hideTooltip( id ) {
    document.getElementById( id ).addEventListener( "mouseleave", () => {
        let tooltip =  document.getElementById( "control-bar-tooltip" );
        tooltip.style.visibility = "hidden";
    } );
}

function getOffset( el ) {
    const rect = el.getBoundingClientRect();

    return {
        left: rect.left + window.scrollX,
        top: rect.top + window.scrollY
    };
}


// manage highlighting of control bar buttons
if( document.getElementById( "controlbar-buttons-group-1" ) ) {
    document.getElementById( "controlbar-buttons-group-1" ).addEventListener( 'click', ( e ) => {
        const target = e.target;
        if( document.getElementById( "all-initial-selection" ).classList.contains( "active" ) ) {
            document.getElementById( "all-initial-selection" ).classList.remove( "active" );
        }
        // if( target.classList.contains( "controlbar-buttons-group-1" ) ) {
        //     const buttons = target.querySelectorAll( ".controlbar-buttons-group-1" );
        //     console.log( "length 1 : " + buttons.length ); 
        //     for( let i = 0; i < buttons.length; i++ ) {
        //         buttons[i].classList.remove( "active" );
        //     }
        //     target.classList.add( "active" );
        // }
    } );
}

//window.onload( toggleGrid() );