// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/friends/add-friends";
};

var displayedUsers = new Set();
const userSearch = document.getElementById( 'user-search' );
const searchButton = document.getElementById( 'btn-search' );
const friendsDashboard = document.getElementById( 'friends-dashboard' );
const friendRequestsModal = document.getElementById( 'friendRequestsModal' );
var friends = new Set();
var authUser = [ ];


/*
addFriendsPage.addEventListener( 'load', getFriends = () => {
    fetch( "api/v1/auth/friends/allFriends", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            for( i = 0; i < response.length; i++ ) {
                if ()
            }
        })
} );
*/

window.onload = getAuthUser = () => {
    fetch( "api/v1/auth/user/getAuthUser", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            authUser.push( response );
        } );
};

searchButton.addEventListener( 'click', queryUsers = () => {
    fetch( "api/v1/auth/user/username/" + userSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) =>  response.json() )
        .then( ( response ) => {

            for ( i = 0; i < response.length; i++ ) {
                var data = response[i];
                if ( !( displayedUsers.has( data.username ) ) && !( data.username == authUser[0].username ) ) {
                    createUserCard( data );
                    displayedUsers.add( data.username );
                }
            }
        } );
} );

function createUserCard( userData ){
    var rowDiv = document.createElement( "div" );
    rowDiv.className = "row row-cols-1 row-cols-md-3 g-4";
    var columnDiv = document.createElement( "div" );
    columnDiv.className = "col mb-3 gallery-col align-items-stretch gallery-col";
    var cardDiv = document.createElement( "div" );
    cardDiv.className = "card h-100";
    var cardBodyDiv = document.createElement( "div" );
    cardBodyDiv.className = "card-body d-flex flex-column";
    var username = document.createElement( "h5" );
    username.id = userData.userId;
    username.innerText = userData.username;
    var userProfile = document.createElement( "img" );
    userProfile.src = userData.profile_filename;
    userProfile.alt = "user's profile";
    var userContainer = document.createElement( "div" );
    userContainer.id = "user-container-" + userData.userId;
    userContainer.style.display = "flex";
    userContainer.style.marginRight = "5px";

    cardBodyDiv.appendChild( username );
    cardBodyDiv.appendChild( userProfile );
    cardDiv.appendChild( cardBodyDiv );
    columnDiv.appendChild( cardDiv );
    rowDiv.append( columnDiv );
    userContainer.appendChild( rowDiv );
    friendsDashboard.appendChild( userContainer );
    
    
    userContainer.addEventListener( 'click', sendFriendRequest = () => {
        fetch( "api/v1/auth/friends/sendFriendRequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify ( {
                "recipient_id": userData.userId,
            } )
        } ); 
    } );
    
}



/*
// Event listener for "Accept" and "Deny" buttons within the modal
friendRequestsModal.addEventListener( 'click', ( event ) => {
    if ( event.target.classList.contains( 'accept-friend-request' ) ) {
        const requestId = event.target.getAttribute( 'data-id' );
        fetch( `/api/acceptFriendRequest/${requestId}`, {
            method: 'POST',
        } )
            .then( ( response ) => {
                if ( response.ok ) {
                // Update the UI as needed (e.g., remove the request item)
                    event.target.closest( '.friend-request-item' ).remove();
                }
            } )
            .catch( ( error ) => {
                console.error( 'Error accepting friend request:', error );
            } );
    }
    else if ( event.target.classList.contains( 'deny-friend-request' ) ) {
        const requestId = event.target.getAttribute( 'data-id' );
        // Handle the "Deny" action here (e.g., send a request to deny the friend request).
        // You can use AJAX to communicate with the server.
        fetch( `/api/rejectFriendRequest/${requestId}`, {
            method: 'POST',
        } )
            .then( ( response ) => {
                if ( response.ok ) {
                // Update the UI as needed (e.g., remove the request item)
                    event.target.closest( '.friend-request-item' ).remove();
                }
            } )
            .catch( ( error ) => {
                console.error( 'Error denying friend request:', error );
            } );
    }
} );
*/