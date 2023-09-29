/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/*
 * Menu management for agora 
 */

let clientSettings = {
    sideBarLocked: false
};

let sideBarStatus = true;

/**
 * Triggered when the page is loaded.
 */
window.addEventListener( "load", () => {
    // Determines whether the user is on a page that contains the sidebar
    if ( document.querySelector( "#agoraSideBar" ) ) {
        loadClientSettings();

        // Only add the hover events if the sidebar is not in the docked position
        if ( !clientSettings.sideBarLocked ) {
            // add events for toggle sidebar
            if( document.getElementById( "agoraSideBar" ) ) {
                toggleSidebar();
                document.getElementById( "agoraSideBar" ).addEventListener( "mouseenter", toggleSidebar );
                document.getElementById( "agoraSideBar" ).addEventListener( "mouseleave", toggleSidebar );
            }
        }
        
        if ( document.getElementById( "pin-menu" ) ) {
            document.getElementById( "pin-menu" ).addEventListener( "click", lockSidebar );
        }
    }
} );

/**
 * Toggles the sidebar.
 */
function toggleSidebar() {
    if ( !sideBarStatus ) {
        document.getElementById( "agoraSideBar" ).style.width = "250px";
        document.querySelector( ".dashboard-content" ).style.marginLeft = "250px";
    }
    else {
        document.getElementById( "agoraSideBar" ).style.width = "85px";
        if( window.innerWidth > 992 ) {
            document.querySelector( ".dashboard-content" ).style.marginLeft = "85px";
        }
    }
    sideBarStatus = !sideBarStatus;
}

/**
 * Locks the sidebar into position.
 */
function lockSidebar() {
    if ( !clientSettings.sideBarLocked ) {
        document.querySelector( ".dashboard-content" ).style.marginLeft = "250px";

        document.getElementById( "agoraSideBar" ).removeEventListener( "mouseenter", toggleSidebar );
        document.getElementById( "agoraSideBar" ).removeEventListener( "mouseleave", toggleSidebar );

        document.getElementById( "agoraSideBar" ).style.width = "250px";

        document.getElementById( "tack-icon" ).style.rotate = "45deg";

        sideBarStatus = true; // important to prevent glitching when enabling/disabling the menu
    }
    else {
        document.getElementById( "tack-icon" ).style.rotate = "0deg";

        document.getElementById( "agoraSideBar" ).addEventListener( "mouseenter", toggleSidebar );
        document.getElementById( "agoraSideBar" ).addEventListener( "mouseleave", toggleSidebar );
    }

    clientSettings.sideBarLocked = !clientSettings.sideBarLocked;

    saveClientSettings();
}

/**
 * Loads the client settings from local storage and sets the properties associated with them.
 */
function loadClientSettings() {
    if ( !localStorage.getItem( 'client-settings' ) ) {
        saveClientSettings();
    }
    else {
        clientSettings = JSON.parse( localStorage.getItem( 'client-settings' ) );

        if ( clientSettings.sideBarLocked ) {
            document.querySelector( ".dashboard-content" ).style.marginLeft = "250px";

            document.getElementById( "agoraSideBar" ).removeEventListener( "mouseenter", toggleSidebar );
            document.getElementById( "agoraSideBar" ).removeEventListener( "mouseleave", toggleSidebar );

            document.getElementById( "agoraSideBar" ).style.width = "250px";

            document.getElementById( "tack-icon" ).style.rotate = "45deg";

            sideBarStatus = true; // important to prevent glitching when enabling/disabling the menu
        }
    }
}

/**
 * Saves the client settings to local storage.
 */
function saveClientSettings() {
    localStorage.setItem( 'client-settings', JSON.stringify( clientSettings ) );
}
