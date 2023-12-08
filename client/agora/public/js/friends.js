// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/friends/add-friends";
};

const userSearch = document.getElementById( 'user-search' );
const friendsDashboard = document.getElementById( 'friends-dashboard' );
const redCircle = document.getElementById( 'requestCount' );
var authUser = [ ];
var friends = [ ];
var requests = [ ];

// gets the authenticated user, their friends and sent friend requests, as well as the number of sent 
// friend requests
window.onload = () => {
    // URBG - this is being called (and failing) when the user is not logged in, for now to avoid the 
    // call for unauthenticated users, I am wrapping it in an if statement looking for the menu
    if( document.getElementById( "agoraSideBar" ) ) {
        fetch( "/api/v1/auth/friends/getResources", {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } )
            .then( ( response ) => response.json() )
            .then( ( response ) => {
                authUser.push( response[0] );
                friends.push( response[1] );
                requests.push( response[2] );
                let requestCount = response[3][0].count;
                // let user know they have a friend request
                if ( requestCount > 0 ){
                    let span = document.createElement( "span" );
                    span.textContent = requestCount;
                    redCircle.appendChild( span );
                    redCircle.style.display = "flex";
                }
            } );
    }
};


// queries the users by username
if ( userSearch ) {
    userSearch.addEventListener( 'keyup', delay( () => {
        console.log( "userSearch.value: " + userSearch.value );
        fetch( "/api/v1/auth/user/search/" + userSearch.value, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
        } )
            .then( ( response ) => ( response ) ? response.json(): null )
            .then( async ( response ) => {
                // clear the dashboard
                friendsDashboard.innerHTML = "";
                // prevent cards from appearing for users
                // that are friends or have requests sent to
                let isSentRequest = false;
                for ( let i = 0; i < response.length; i++ ) {
                    var data = response[i];
                    var isFriend = false;
                    for( let j = 0; j < friends[0].length; j++ ){
                        if ( ( data.username == friends[0][j].friend_username ) ){
                            isFriend = true;
                        }
                    }
                    for( let k = 0; k < requests[0].length; k++ ){
                        if( ( data.userId == requests[0][k].initiatedby_id ) ||
                            ( data.userId == requests[0][k].recipient_id ) ){
                            isSentRequest =  true;
                        }
                    }
                    
                    if ( !( data.username == authUser[0].username ) && !isFriend && !isSentRequest ) {
                        await createUserCard( data );

                    }
                }
                
            } ).catch( ( error ) => friendsDashboard.innerHTML = "" );
    }, 500 ) );
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
    console.log( "userContainer: " + userContainer );
    friendsDashboard.appendChild( userContainer );
    
    // sends the request to the user
    userContainer.addEventListener( 'click', () => {
        if( confirm( "Are you sure you want to send a friend request to " + userData.username + "?" ) == true ){
            userContainer.style.display = "none";
            fetch( "/api/v1/auth/friends/sendFriendRequest", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify ( {
                    "username": userData.username,
                    "userId": userData.userId
                } )
            } ); 
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
