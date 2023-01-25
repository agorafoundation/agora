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

//Modal Popup Controller
function toggleModal( id ){
    var e = document.getElementById( id );

    if( e.style.display == 'block' ) {
        e.style.display = 'none';
    }
    else {
        e.style.display = 'block'; 
    }
}

