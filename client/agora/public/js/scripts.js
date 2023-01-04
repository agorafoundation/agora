/*
 * Menu management for agora 
 */

window.addEventListener( "load", () => {
    
} );


let sideBarStatus = true;
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

// add events for toggle sidebar
if( document.getElementById( "agoraSideBar" ) ) {
    toggleSidebar();
    document.getElementById( "agoraSideBar" ).addEventListener( "mouseover", toggleSidebar );
    document.getElementById( "agoraSideBar" ).addEventListener( "mouseout", toggleSidebar );
}

