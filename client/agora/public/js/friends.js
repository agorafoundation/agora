// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/add-friends";
};

var displayedUsers = new Set();
const userSearch = document.getElementById( 'user-search' );
const searchButton = document.getElementById( 'btn-search' );
const userContainer = document.getElementById('grid-container');

searchButton.addEventListener( 'click', queryUsers = () => {
    fetch( "api/v1/auth//user/username/" + userSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) =>  response.json() )
        .then( ( response ) => {

            for (i = 0; i < response.length; i++)
            {
                var data = response[i];
                if (!(displayedUsers.has(data.username)))
                {
                    var div = document.createElement('div');
                    div.textContent = response[i];
                    userContainer.appendChild(div);
                    displayedUsers.add(data.username);
                }
            }
        });
} );