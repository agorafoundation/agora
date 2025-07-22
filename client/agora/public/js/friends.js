
// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/friends/add-friends";
};

const userSearch = document.getElementById( 'user-search' );
const friendsDashboard = document.getElementById( 'friends-dashboard' );
const friendsPendingDashboard = document.getElementById( 'friends-pending-dashboard' );
const redCircle = document.getElementById( 'requestCount' );
var authUser = [ ];
var friends = [ ];
var requests = [ ];
let requestedFriends = [ ];

// gets the authenticated user, their friends and sent friend requests, as well as the number of sent 
// friend requests
window.onload = () => {
    // 
    if( document.getElementById( "agoraSideBar" ) ) {
        fetch( "/api/v1/auth/friends/getResources", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } )
            .then( ( response ) => response.json() )
            .then( ( response ) => {
                authUser.push( response[0] );
                for( let i = 0; i < response[1].length; i++ ){
                    friends.push( response[1][i] );
                }
                for( let i = 0; i < response[2].length; i++ ){
                    requests.push( response[2][i] );
                }

                //add any pending friend requests to the dashboard
                if( response[3].length > 0 ){
                    for( let i = 0; i < response[3].length; i++ ){
                        if( response[3][i].initiatedby_id == authUser[0].userId ){
                        
                            createPendingUserCard( response[3][i], "Request Sent" );
                        }
                        else {
                            createPendingUserCard( response[3][i], "Pending Your Aproval" );
                        }
                    }
                }
                

                let requestCount = response[4][0].count;
                // let user know they have a friend request
                if ( requestCount > 0 ){
                    let span = document.createElement( "span" );
                    span.textContent = requestCount;
                    redCircle.appendChild( span );
                    redCircle.style.display = "flex";
                }
            } );
    }

    //
};


// queries the users by username
if ( userSearch ) {
    userSearch.addEventListener( 'keyup', delay( async () => {
        const response = await fetch( "/api/v1/auth/user/search/" + userSearch.value, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } );

        //clear the dashboard
        friendsDashboard.textContent = "";

        if( response.status == 200 ){
            //console.log( "response.status == 200" );

            const data = await response.json();
            
            // set the default flags
            let isSentRequest = false;
            let isFriend = false;

            // loop through the data
            for( let i = 0; i < data.length; i++ ){
                // check if the user is a friend
                for( let j = 0; j < friends.length; j++ ){
                    if ( data[i].username === friends[j].friend_username ){
                        isFriend = true;
                    }
                }
                // check if the user has a pending request
                for( let k = 0; k < requests.length; k++ ){
                    //console.log( "k: " + k + " userId: " + data[i].userId + " requests[k].recipient_id: " + requests[k].initiatedby_id );
                    if( ( data[i].userId === requests[k].recipient_id ) ){
                        isSentRequest =  true;
                    }
                }
                // if the user is not a friend and does not have a pending request
                if ( !( data[i].username == authUser[0].username ) && !isFriend && !isSentRequest ) {
                    await createUserCard( data[i] );
                }
                // reset the flags
                isSentRequest = false;
                isFriend = false;
            }

        }

    }, 500 ) );
}


// create a user card for each pending friend request
async function createPendingUserCard( userData, friendshipStatus ){
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
    username.innerHTML = "";
    const statusHeader = document.createElement( 'h5' );
    statusHeader.textContent = friendshipStatus;
    username.appendChild( statusHeader );
    const nameText = document.createTextNode( userData.friend_first_name + " " + userData.friend_last_name + " (" + userData.friend_username + ") " );
    username.appendChild( nameText );
    let personname = document.createElement( "p" );
    personname.innerText = userData.friend_first_name + " " + userData.friend_last_name;
    let bioParagraph = document.createElement( "p" );
    bioParagraph.innerText = userData.friend_bio;

    var userProfile = document.createElement( "div" );
    userProfile.className = "card-background-image";
    userProfile.width = 180;
    userProfile.style = "margin: auto";

    // 
    if ( userData.friend_profile_filename.toString().substring( 0, 7 )=="http://" || userData.friend_profile_filename.toString().substring( 0, 8 )=="https://" ) {
        userProfile.style = "background-image: url('" + userData.friend_profile_filename + "'); ";
    }
    else {
        userProfile.style = "background-image: url('" + "/assets/uploads/profile/" + userData.friend_profile_filename + "'); ";
    }
    
    userProfile.alt = "user's profile";
    userProfile.setAttribute( "referrerpolicy", "no-referrer" );
    var userContainer = document.createElement( "div" );
    userContainer.id = "user-container-" + userData.userId;
    userContainer.style.display = "flex";
    userContainer.style.marginRight = "5px";

    cardBodyDiv.appendChild( username );
    cardBodyDiv.appendChild( personname );
    cardBodyDiv.appendChild( bioParagraph );
    cardBodyDiv.appendChild( userProfile );
    cardDiv.appendChild( cardBodyDiv );
    columnDiv.appendChild( cardDiv );
    rowDiv.append( columnDiv );
    userContainer.appendChild( rowDiv );
    if( friendsPendingDashboard )  {
        friendsPendingDashboard.appendChild( userContainer );
    }

    // click event to to cancel friend request
    userContainer.addEventListener( 'click', async () => {
        if( confirm( "Are you sure you want to cancel the friend request to " +userData.friend_first_name + " " + userData.friend_last_name + " (" + userData.friend_username + ") ?" ) == true ){
            fetch( "/api/v1/auth/friends/deleteFriend", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify( {
                    "friendshipId": userData.friendship_id,
                } )
            } )
                .then( ( response ) => {
                    if ( response.status == 200 ) {
                        const message = 'Friend deleted successfully';
                        console.log( message );
                        location.reload();
                    }
                    else{
                        const errorMessage = 'Failed to delete friend.';
                        console.error( errorMessage );
                    }
                } )
                .catch( ( error ) => {
                    console.error( 'Error deleting friend:', error );
                    alert( 'Error deleting friend: ' + error );
                } );

            // reload the page
            window.location.reload();

        }
    } );
    
}

// creates a user card for each user
async function createUserCard( userData ){
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
    let personname = document.createElement( "p" );
    personname.innerText = userData.firstName + " " + userData.lastName;
    let bioParagraph = document.createElement( "p" );
    bioParagraph.innerText = userData.bio;

    var userProfile = document.createElement( "div" );
    userProfile.className = "card-background-image";
    userProfile.width = 180;
    userProfile.style = "margin: auto";

    // 
    if ( userData.profileFilename.toString().substring( 0, 7 )=="http://" || userData.profileFilename.toString().substring( 0, 8 )=="https://" ) {
        userProfile.style = "background-image: url('" + userData.profileFilename + "'); ";
    }
    else {
        userProfile.style = "background-image: url('" + "/assets/uploads/profile/" + userData.profileFilename + "'); ";
    }
    
    userProfile.alt = "user's profile";
    userProfile.setAttribute( "referrerpolicy", "no-referrer" );
    var userContainer = document.createElement( "div" );
    userContainer.id = "user-container-" + userData.userId;
    userContainer.style.display = "flex";
    userContainer.style.marginRight = "5px";

    cardBodyDiv.appendChild( username );
    cardBodyDiv.appendChild( personname );
    cardBodyDiv.appendChild( bioParagraph );
    cardBodyDiv.appendChild( userProfile );
    cardDiv.appendChild( cardBodyDiv );
    columnDiv.appendChild( cardDiv );
    rowDiv.append( columnDiv );
    userContainer.appendChild( rowDiv );
    friendsDashboard.appendChild( userContainer );
    
    // sends the request to the user
    userContainer.addEventListener( 'click', async () => {
        if( confirm( "Are you sure you want to send a friend request to " + userData.username + "?" ) == true ){
            userContainer.style.display = "none";
            await fetch( "/api/v1/auth/friends/sendFriendRequest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify ( {
                    "username": userData.username,
                    "userId": userData.userId
                } )
            } ); 

            // reload the page
            window.location.reload();

        }
    } );
    
}

/**
 * Delay function for debouncing the friends query
 * source: https://stackoverflow.com/questions/1909441/how-to-delay-the-keyup-handler-until-the-user-stops-typing
 * @param {Function} fn 
 * @param {*} ms 
 * @returns 
 */
function delay( fn, ms ) {
    let timer = 0;
    return function( ...args ) {
        clearTimeout( timer );
        timer = setTimeout( fn.bind( this, ...args ), ms || 0 );
    };
}
