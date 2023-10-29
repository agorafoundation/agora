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
var friends = [ ];
var requests = [ ];


// gets the authenticated user, their friends and sent friend requests
window.onload = getResources = () => {
    
    fetch( "/api/v1/auth/friends/allFriends", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            for( i = 0; i < response.length; i++)
            {
                friends.push( response[i] );
            }
        });
    
    fetch( "/api/v1/auth/user/getAuthUser", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            authUser.push( response );
        } );
    
    fetch( "/api/v1/auth/friends/request", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    })
    .then( ( response ) => response.json() )
    .then( ( response ) => {
        for( j = 0; j < response.length; j++)
        {
            requests.push( response[j] );
        }
    })
};

// queries the users by username
searchButton.addEventListener( 'click', queryUsers = () => {
    fetch( "/api/v1/auth/user/username/" + userSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) =>  response.json() )
        .then( ( response ) => {

            for ( i = 0; i < response.length; i++ ) {
                var data = response[i];
                var isFriend = false;
                var isSentRequest = false;
                for( j = 0; j < friends.length; j++ ){
                    if ( data.username == friends[j].friend_username ){
                        isFriend = true;
                    }
                }
                for( k = 0; k < requests.length; k++ ){
                    if( (data.userId == requests[k].recipient_id) ||
                        ( data.userId == requests[k].requester_id ) ){
                        isSentRequest =  true;
                    }
                }
                if ( !( displayedUsers.has( data.username ) ) && 
                !( data.username == authUser[0].username ) && !( isFriend ) && !( isSentRequest )) {
                    createUserCard( data );
                    displayedUsers.add( data.username );
                }
            }
        } );
} );

// creates a user card for each user
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
        userContainer.style.display = "none";
        fetch( "/api/v1/auth/friends/sendFriendRequest", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify ( {
                "username": userData.username
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