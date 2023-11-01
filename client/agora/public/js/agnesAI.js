
// Citations logic
const citationsDropdown = document.getElementById( 'citations-dropdown' );

citationsDropdown.addEventListener( 'change', ( event ) => {
    // temp behavior, logging selected type
    console.log( `Citation type: ${event.target.value}` );

    // TODO: format article information based on selected type
} );