// Takes you to the adding friends page
const addFriendPage = () => {
    window.location.href = "/add-friends";
};


const userSearch = document.getElementById('user-search');
const searchButton = document.getElementById('btn-search');

searchButton.addEventListener('click', queryUser = () => {
    const response = fetch( "api/v1/auth//user/username/" + userSearch.value, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } )
        .then( ( response ) => response.json() )
    console.log(response);
})