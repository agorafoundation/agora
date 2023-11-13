
// Citations logic

// citation dropdown functionality
const citationsDropdown = document.getElementById( 'citations-dropdown' );
const allCardsContainer = document.querySelector( '.all-cards' );

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

    switch ( citationFormat ) {

    case 'apa': 
        return `${formatAuthorsByCitationType( authors, 'apa' )} ${publicationDate}. ${title}. ${publication}`;

    case 'mla': 
        return `${formatAuthorsByCitationType( authors, 'mla' )} ${title}. ${publication}, ${publicationDate}`;

    case 'harvard': 
        return `${formatAuthorsByCitationType( authors, 'harvard' )}, ${publicationDate}. ${title}. ${publication}`;

    case 'chicago': 
        return `${formatAuthorsByCitationType( authors, 'chicago' )} ${title}. ${publication}. ${publicationDate}`;

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
            finalAuthorStrings.push( `${lastName}, ${firstName}.` );
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
        return finalAuthorStrings.join( '; ' ) + ' et al.';
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

    // TODO: format article information based on selected typ
    return names;

}

// const apiEndpoint = '/server/controller/apis/aiController.js'; // Relative path

var lastEditedResource; // This is set in the topic-view.js

// Dropdown logic + Fetching data
document.getElementById( 'doc-type' ).addEventListener( 'change', async function () {
    var selectedValue = this.value; // This is either set to "notes" or "paper"
    var selectedContent = document.getElementById( 'selectedContent' );

    // Define the data you want to send in the request body
    let requestData = {
        mode: selectedValue, // Use the selected mode
        resourceId: ( lastEditedResource != null ) ? lastEditedResource : getResources()[0] // get the first one if none are selected
    };

    try {
        // Make the fetch call to the "aiController.js" API
        const response = await fetch( 'api/v1/auth/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify( requestData ), // Send the mode in the request body
        } );

        if ( response.ok ) {
            selectedContent.classList.remove( 'hidden' );

            // If the response is successful, parse the JSON data
            let articles = await response.json();

            if ( articles['citations'].length > 0 ) {
                processJsonData( articles['citations'] );
            }
            else {
                // Create a card to display the error of not finding any articles
                const card = document.createElement( 'div' );
                card.classList.add( 'container', 'citation-card' );
                
                card.innerHTML = `
                    <div class="row card-row-body">
                        <div class="col text-center">
                            <span class="card-citation-text">No articles found. Please keep writing and try again.</span>
                        </div>
                    </div>
                `;
                
                // Append the card to the container
                allCardsContainer.appendChild( card );
            }
        }
        else {
            // Handle error cases here
        }
    }
    catch ( error ) {
        // Handle network or other errors here
        console.error( 'Fetch request failed: - Network or other errors', error );
    }
} );

// Preparing Articles for formatting
function processJsonData( articlesObj ) {
    articlesObj.forEach( ( article ) => {
        const formattedString = formatCitationByType( article, 'apa' ); // by default it is apa format
        
        
        // Create a new card element
        const card = document.createElement( 'div' );
        card.classList.add( 'container', 'citation-card' );
        
        // Create the card template
        card.innerHTML = `
               <div class="row card-row-header">
                   <div class="col text-end">
                       <button class="btn btn-danger btn-sm card-close-btn">X</button>
                   </div>
               </div>
               <div class="row card-row-body">
                   <div class="col text-center">
                       <a href="${article.link}" target="_blank">
                           <span class="card-citation-text"></span>
                       </a>
                   </div>
               </div>
               <div class="row">
                   <div class="col text-end">
                       <button class="btn btn-sm card-cite-btn">Cite</button>
                   </div>
               </div>
           `;
        
        // Set the citation text in the card
        const cardCitationText = card.querySelector( '.card-citation-text' );
        cardCitationText.textContent = formattedString;
        // Append the card to the container
        allCardsContainer.appendChild( card );

    } );
}

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
