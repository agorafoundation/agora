// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/add-friends";
};

var displayedUsers = new Set();
const userSearch = document.getElementById( 'user-search' );
const searchButton = document.getElementById( 'btn-search' );
const friendsContainer = document.getElementById( 'friends-dashboard' );
const friendRequestsModal = document.getElementById( 'friendRequestsModal' );
const templateContainer = document.getElementById( 'user-container' );

