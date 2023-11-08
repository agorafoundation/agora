
// Citations logic
const citationsDropdown = document.getElementById( 'citations-dropdown' );

citationsDropdown.addEventListener( 'change', ( event ) => {
    // temp behavior, logging selected type
    console.log( `Citation type: ${event.target.value}` );

    // TODO: format article information based on selected type
} );


// Dropdown logic
document.getElementById( 'doc-type' ).addEventListener( 'change', function () {
    var selectedValue = this.value;
    var selectedContent = document.getElementById( 'selectedContent' );
    if ( selectedValue === 'notes' || selectedValue === 'paper' ) {
        selectedContent.classList.remove( 'hidden' );
    }
    else {
        selectedContent.classList.add( 'hidden' );
    }
} );

// Popover logic
var myPopover = new bootstrap.Popover( document.getElementById( 'myPopover' ), {
    trigger: 'manual'
} );
document.getElementById( 'myPopover' ).addEventListener( 'mouseenter', function () {
    myPopover.show();
} );
document.getElementById( 'myPopover' ).addEventListener( 'mouseleave', function () {
    myPopover.hide();
} );

