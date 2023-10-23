// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/add-friends";
};

var displayedUsers = new Set();
const userSearch = document.getElementById( 'user-search' );
const searchButton = document.getElementById( 'btn-search' );
const userContainer = document.getElementById( 'friends-dashboard' );
const friendRequestsModal = document.getElementById( 'friendRequestsModal' );
const templateContainer = document.getElementById( 'user-container' );



searchButton.addEventListener( 'click', queryUsers = () => {
    fetch( "api/v1/auth//user/username/" + userSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) =>  response.json() )
        .then( ( response ) => {

            for ( i = 0; i < response.length; i++ ) {
                var data = response[i];
                if (!(displayedUsers.has(data.username)))
                {
                    var newContainer = templateContainer.cloneNode(true);
                    newContainer.style.display = "flex";
                    userContainer.appendChild(newContainer);
                    displayedUsers.add(data.username);
                }
            }
        } );
} );

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