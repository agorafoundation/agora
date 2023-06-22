/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/*
 * Menu management for agora 
 */

window.addEventListener( "load", () => {
    
} );


let sideBarStatus = true;
let sideBarLocked = false;

function toggleSidebar() {
    if ( !sideBarStatus ) {
        document.getElementById( "agoraSideBar" ).style.width = "250px";
        document.body.style.marginLeft = "250px";
    }
    else {
        document.getElementById( "agoraSideBar" ).style.width = "85px";
        if( window.innerWidth > 992 ) {
            document.body.style.marginLeft = "85px";
        }
    }
    sideBarStatus = !sideBarStatus;
}

function lockSidebar() {
    if ( !sideBarLocked ) {
        document.body.style.marginLeft = "250px";

        document.getElementById( "agoraSideBar" ).removeEventListener( "mouseenter", toggleSidebar );
        document.getElementById( "agoraSideBar" ).removeEventListener( "mouseleave", toggleSidebar );

        document.getElementById( "agoraSideBar" ).style.width = "250px";

        document.getElementById( "tack-icon" ).style.rotate = "45deg";
    }
    else {
        document.getElementById( "agoraSideBar" ).addEventListener( "mouseenter", toggleSidebar );
        document.getElementById( "agoraSideBar" ).addEventListener( "mouseleave", toggleSidebar );
        
        document.getElementById( "tack-icon" ).style.rotate = "0deg";
    }

    sideBarLocked = !sideBarLocked;
}

// add events for toggle sidebar
if( document.getElementById( "agoraSideBar" ) ) {
    toggleSidebar();
    document.getElementById( "agoraSideBar" ).addEventListener( "mouseenter", toggleSidebar );
    document.getElementById( "agoraSideBar" ).addEventListener( "mouseleave", toggleSidebar );
}

if ( document.getElementById( "pin-menu" ) ) {
    document.getElementById( "pin-menu" ).addEventListener( "click", lockSidebar );
}



