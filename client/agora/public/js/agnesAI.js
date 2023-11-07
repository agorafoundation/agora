
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

/**
 * Formats an article object based on citation format.
 * 
 * @param {{title: string, authors: string[], publication: string, publicationDate: string}} articleObj 
 * @param {'apa' | 'mla' | 'harvard' | 'chicago'} citationFormat 
 * @returns {string} a formatted citation string for the article
 */
function formatCitationByType( articleObj, citationFormat ) {
    const {title, authors, publication, publicationDate } = articleObj;

    switch ( citationFormat ) { // formatting here is weird!

    case 'apa': 
        return `${formatAuthorsByCitationType( authors, 'apa' )}. ${publicationDate}. ${title}. ${publication}`;

    case 'mla': 
        return `${formatAuthorsByCitationType( authors, 'mla' )}. ${title}. ${publication}, ${publicationDate}`;

    case 'harvard': 
        return `${formatAuthorsByCitationType( authors, 'harvard' )}, ${publicationDate}. ${title}. ${publication}`;

    case 'chicago': 
        return `${formatAuthorsByCitationType( authors, 'chicago' )}. ${title}. ${publication}. ${publicationDate}`;

    }

}

/**
 * Formats author names based on citation format
 * 
 * @param {string[]} authors 
 * @param {'apa' | 'mla' | 'harvard' | 'chicago'} citationFormat 
 * @returns {string} a formatted string of authors name based on citation format
 */
function formatAuthorsByCitationType( authors, citationFormat ) {
    let needsEtAl = false; // flag to include et al at the end of the authors names 
    let reducedAuthors = [];

    if ( authors.length > 2 ) { // have to reduce for 3 or more
        needsEtAl = true;

        reducedAuthors = getFirstNameLastNames( [ authors[0], authors[1], authors[2] ] );
    }
    else {
        reducedAuthors = getFirstNameLastNames( authors );
    }
    
    const finalAuthorStrings = [];

    switch ( citationFormat ) {

    case 'apa':
        reducedAuthors.forEach( ( name ) => {
            const [ lastName, firstName ] = name;

            // APA is lastName, firstInitial 
            finalAuthorStrings.push( `${lastName}, ${firstName.substring( 0, 1 )}.` );
        } );
        break;
    case 'mla':
        reducedAuthors.forEach( ( name ) => {
            const [ lastName, firstName ] = name;

            // MLA is lastName, firstName
            finalAuthorStrings.push( `${lastName}, ${firstName}` );
        } );
        break;

    case 'harvard': 
        reducedAuthors.forEach( ( name ) => {
            const [ lastName, firstName ] = name;

            // Harvard is lastName, firstInitial 
            finalAuthorStrings.push( `${lastName}, ${firstName.substring( 0, 1 )}.` );
        } );
        break;

    case 'chicago': 
        reducedAuthors.forEach( ( name ) => {
            const [ lastName, firstName ] = name;

            // Chicago is lastName, firstName
            finalAuthorStrings.push( `${lastName}, ${firstName.substring( 0, 1 )}.` );
        } );
        break;
    }

    // add et al if necessary
    if ( needsEtAl ) {
        return finalAuthorStrings.join( '; ' ) + ' et al';
    }
    else {
        return finalAuthorStrings.join( '; ' );
    }
}

/**
 * Splits an array of author name strings to tuples of [lastName, firstName]
 * 
 * @param {string[]} authors 
 * @returns {string[][]} list of author name tuples
 */
function getFirstNameLastNames( authors ) {
    let names = [];

    authors.forEach( ( authorName ) => {
        let authorNames = authorName.split( ' ' );

        // last name is at index 1 if there is no middle inital, 2 otherwise
        let lastName = authorNames.length > 2 ? authorNames[2] : authorNames[1];
        let firstName = authorNames[0];

        names.push( [ lastName, firstName ] );
    } );


    return names;
}