// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/friends/add-friends";
};

var displayedUsers = new Set();
const userSearch = document.getElementById( 'user-search' );
const searchButton = document.getElementById( 'btn-search' );
const friendsDashboard = document.getElementById( 'friends-dashboard' );
const redCircle = document.getElementById( 'requestCount' );
var authUser = [ ];
var friends = [ ];
var requests = [ ];

// gets the authenticated user, their friends and sent friend requests
window.onload = getResources = () => {
    
    fetch( "/api/v1/auth/friends/getResources", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
        .then( ( response ) => {
            authUser.push( response[0]);
            friends.push( response[1] );
            requests.push( response[2] );
            let requestCount = response[3][0].count;
            if ( requestCount > 0){
                let span = document.createElement("span");
                span.textContent = requestCount;
                redCircle.appendChild(span);
                redCircle.style.display = "flex";
            }
        } );
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
                for( k = 0; k < requests[0].length; k++ ){
                    if( ( data.userId == requests[0][k].initiatedby_id ) ||
                        ( data.userId == requests[0][k].recipient_id ) ){
                        isSentRequest =  true;
                    }
                }
                if ( !( displayedUsers.has( data.username ) ) && 
                !( data.username == authUser[0].username ) && !( isFriend ) && !( isSentRequest ) ) {
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
    userProfile.width = 225;
    userProfile.src = "/assets/uploads/profile/" + userData.profileFilename;
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
                "username": userData.username,
                "userId": userData.userId
            } )
        } ); 
    } );
    
}
