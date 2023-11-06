
// Citations logic

// citation dropdown functionality
const citationsDropdown = document.getElementById( 'citations-dropdown' );

citationsDropdown.addEventListener( 'change', ( event ) => {
    const citationType = event.target.value;
    const articleInfoObj = JSON.parse( localStorage.getItem( 'last-retrieved' ) ?? 'null' );
  
    // return here if there is no article info in localstorage
    if ( !articleInfoObj ) return;
  
    // get all card text elements
    const allCitationCards = document.querySelectorAll( 'span.card-citation-text' );
    
    const allCitations = articleInfoObj.citations;
    allCitationCards.forEach( ( cardTextElement, index ) => {
        cardTextElement.textContent = formatCitationByType( allCitations[index], citationType );
    } );

} );

function formatCitationByType( articleObj, citationFormat ) {
    const {title, authors, publication, publicationDate } = articleObj;

    switch ( citationFormat ) { // formatting here is weird!

    case 'apa': 
        return `${authors}. ${publicationDate}. ${title}. ${publication}`;

    case 'mla': 
        return `${authors}. ${title}. ${publication}, ${publicationDate}`;

    case 'harvard': 
        return `${authors}, ${publicationDate}. ${title}. ${publication}`;

    case 'chicago': 
        return `${authors}. ${title}. ${publication}. ${publicationDate}`;

    }

}