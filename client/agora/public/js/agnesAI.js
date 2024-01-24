/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// Imports
import { getCurrentActiveTopic } from "./state/stateManager.js";
import { lastEditedResourceId } from "./editorManager.js";

// citation dropdown functionality
const citationsDropdown = document.getElementById( 'citations-dropdown' );
const allCardsContainer = document.querySelector( '.all-cards' );
const loadingSpinnerContainer = document.getElementById( 'loadingSpinnerContainer' );
const citationsContainer = document.getElementById( 'citations-cont' );

document.getElementById( 'drawer-header' ).addEventListener( 'click', function() {
    console.log( 'agnes button clicked' );
    var drawer = document.getElementById( 'drawer' );
    drawer.classList.toggle( 'open' );
    var resourcesZone = document.querySelector('.resources-zone');
    // Check the current width and toggle between 70% and 100%
    if (resourcesZone.style.width === '65%') {
        resourcesZone.style.width = '95%';
    } else {
        resourcesZone.style.width = '65%';
    }
    
} );

document.querySelector('.toggle-button').addEventListener('click', function() {
    console.log('toggle button clicked');
    this.classList.toggle('active');
    var toggleText = this.querySelector('.toggle-button-text');
    if (this.classList.contains('active')) {
        toggleText.style.transform = "translateX(100%)";
        toggleText.textContent = "Suggestions";
    } else {
        toggleText.style.transform = "translateX(0)";
        toggleText.textContent = "Articles";
    }
});

if( document.getElementById( "agnesModal" ) ) {
    document.getElementById( "agnesModal" ).addEventListener( "shown.bs.modal", ( e ) => {
        let modal = document.querySelector( ".agnes-modal-pos" );
        let agnesButton = document.querySelector( ".agnes-btn-container" );

        let rect = agnesButton.getBoundingClientRect();
        let top = ( window.innerHeight - window.scrollY ) - rect.top; // get the entire page height, subtract the top value of the button from it to get the spot right above the button.

        // Set the 'top' value, only if it is currently unset.
        if ( !modal.style.top ) {
            document.querySelector( ".agnes-modal-pos" ).style.top = ( top - 40 ) + "px";
        }
    } );
}

if( citationsDropdown ) {
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
}

if( document.getElementById( "regenerate-button" ) ) {
    document.getElementById( "regenerate-button" ).addEventListener( "click", async function () {
        allCardsContainer.innerHTML = ""; // Clear the current cards.
        await makeAPICall();
    } );
}

// Copy Button Logic
function enableCiteButtons() {
    // get all the copy button text and add the click event listener
    document.querySelectorAll( 'button.card-cite-btn' ).forEach( ( copyButton ) => {
        copyButton.addEventListener( 'click', function () {

            // the x-button is nested in two divs, so parent div is three levels up
            const cardDiv = this.parentElement.parentElement.parentElement;
            //const cardID = cardDiv.getAttribute( 'data-card-index' );

            const cardText = cardDiv.querySelector( 'span.card-citation-text' );
            //const cardTextID = cardTextDiv.getAttribute( 'data-card-index' );
            //console.log( cardText );
            //console.log( cardTextID );

            copyContentText( cardText.textContent, cardDiv );
            //copyContent();
            
        } );
    } );
}

const createToastNotification = ( text ) => {
    document.getElementById( 'toast-text' ).innerText = text;
    const thisToast = document.getElementById( 'liveToast' );
    // eslint-disable-next-line no-undef
    const toast = new bootstrap.Toast( thisToast );
    toast.show();
};

function copyContentText ( cardText, cardDiv ) {
    //let text = document.getElementById( cardTextID ).innerHTML;
    //let buttonText = document.getElementById( cardTextID );

    let buttonText = cardDiv.querySelector( 'button.card-cite-btn' );

    const copyContent = async () => {
        try {
            await navigator.clipboard.writeText( cardText );
          
            buttonText.innerHTML = 'Copied';
          
            console.log( 'Content copied to clipboard' );

            buttonText.innerHTML = 'Copied!';

            setTimeout( () => {
                buttonText.innerHTML = 'Copy';
            }, 2000 );
            
            createToastNotification( "Copied Link! Paste citation into document where needed." );
        } 
        catch ( err ) {
            console.error ( 'Failed to copy: ', err );
        }
    };
    copyContent();
}


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
        return `${formatAuthorsByCitationType( authors, 'apa' )} (${publicationDate}). ${title}. ${publication}.`;

    case 'mla': 
        return `${formatAuthorsByCitationType( authors, 'mla' )} "${title}". ${publication}, ${publicationDate}.`;

    case 'harvard': 
        return `${formatAuthorsByCitationType( authors, 'harvard' )} (${publicationDate}) '${title}', ${publication}.`;

    case 'chicago': 
        return `${formatAuthorsByCitationType( authors, 'chicago' )} "${title}." ${publication}, (${publicationDate}).`;

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

    console.log( "authors: " + authors );
    if( authors && authors.length > 0 ) {
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
    else {
        return "No Author";
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

// Dropdown logic + Fetching data
if( document.getElementById( 'doc-type' ) ) {
    document.getElementById( 'doc-type' ).addEventListener( 'change', async function () {
        await makeAPICall();
        
    } );
}


async function makeAPICall() {
    loadingSpinnerContainer.hidden = false;
    citationsContainer.hidden = true;
    
    
    var selectedValue = document.getElementById( 'doc-type' ).value;
    var selectedContent = document.getElementById( 'selectedContent' );

    if ( selectedValue != 'notes' && selectedValue != 'paper' ) return;

    // Define the data you want to send in the request body
    let requestData = {
        mode: selectedValue, // Use the selected mode
        resourceId: ( lastEditedResourceId != null ) ? lastEditedResourceId : getCurrentActiveTopic().resources[0].resourceId, // get the first one if none are selected
        removedArticles: JSON.parse( localStorage.getItem( 'removed' ) ) ?? []
    };

    try {
        // Make the fetch call to the "aiController.js" API
        const response = await fetch( 'api/v1/auth/ai/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify( requestData ), // Send the mode in the request body
        } );

        allCardsContainer.innerHTML = ""; // Clear the current cards.
        
        selectedContent.classList.remove( 'hidden' );

        if ( response.ok ) {
            // If the response is successful, parse the JSON data
            let articles = await response.json();

            console.log( "articles returned: " + articles );

            if ( articles['citations'].length > 0 ) {
                console.log( '0' );
                localStorage.setItem( 'last-retrieved', JSON.stringify( articles ) );
                console.log( '1' );
                processJsonData( articles['citations'] );
                console.log( '2' );

                enableXButtons();
                console.log( '3' );
                enableCiteButtons();
                console.log( '4' );

                loadingSpinnerContainer.hidden = true;
                citationsContainer.hidden = false;

            }
            else {
                // Create a card to display the error of not finding any articles

                loadingSpinnerContainer.hidden = true;
                citationsContainer.hidden = false;

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
            selectedContent.classList.remove( 'hidden' );
            loadingSpinnerContainer.hidden = true;
            citationsContainer.hidden = false;

            

            let responseJson = await response.json();


            // Create a card to display the error of not finding any articles
            const card = document.createElement( 'div' );
            card.classList.add( 'container', 'citation-card' );
            
            card.innerHTML = `
                <div class="row card-row-body">
                    <div class="col text-center">
                        <span class="card-citation-text">${responseJson['error']}</span>
                    </div>
                </div>
            `;
            
            // Append the card to the container
            allCardsContainer.appendChild( card );
        }
    }
    catch ( error ) {
        // Handle network or other errors here
        loadingSpinnerContainer.hidden = true;
        citationsContainer.hidden = false;
        console.error( 'Fetch request failed: - Network or other errors', error );
    }
}

// Preparing Articles for formatting
function processJsonData( articlesObj ) {
    articlesObj.forEach( ( article ) => {
        const formattedString = formatCitationByType( article, 'apa' ); // by default it is apa format
        
        
        // Create a new card element
        const card = document.createElement( 'div' );
        card.classList.add( 'container', 'citation-card' );
        card.setAttribute( 'data-card-index', article.id );
        
        // Create the card template
        card.innerHTML = `
               <div class="row card-row-header">
                   <div class="col text-end">
                       <button class="btn btn-danger btn-sm card-close-btn">X</button>
                   </div>
               </div>
               <div class="row card-row-body">
                   <div class="col text-center">
                       <a href="${article.link}" target="_blank" style="text-decoration: underline;">
                           <span class="card-citation-text"></span>
                       </a>
                   </div>
               </div>
               <div class="row">
                   <div class="col text-end">
                       <button class="btn btn-sm card-cite-btn">Copy</button>
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
if( document.getElementById( 'myPopover' ) ) {
    
    // eslint-disable-next-line no-undef
    var myPopover = new bootstrap.Popover( document.getElementById( 'myPopover' ), {
        trigger: 'manual'
    } );
    document.getElementById( 'myPopover' ).addEventListener( 'mouseenter', function () {
        myPopover.show();
    } );
    document.getElementById( 'myPopover' ).addEventListener( 'mouseleave', function () {
        myPopover.hide();
    } );
}



// X button logic
function enableXButtons() {
    // get all the x buttons and add the click event listener
    document.querySelectorAll( 'button.card-close-btn' ).forEach( ( xButton ) => {
        xButton.addEventListener( 'click', function () {
            // the x-button is nested in two divs, so parent div is three levels up
            const cardDiv = this.parentElement.parentElement.parentElement;
            const cardID = cardDiv.getAttribute( 'data-card-index' );
            
            deleteCardFromLocalStorage( cardID );
            cardDiv.remove();
        } );
    } );
}

// deletes card from local storage and places it in seperate "removed" field (name can change!)
function deleteCardFromLocalStorage( cardID ) {
    const localStorageArticleJSON = JSON.parse( localStorage.getItem( 'last-retrieved' ) ?? 'null' );

    // exit here if there is no local storage json
    if ( !localStorageArticleJSON ) return;

    const articleObjs = localStorageArticleJSON.citations;

    // find article with matching index and remove
    articleObjs.forEach( ( articleObj, index ) => {
        if ( articleObj.id == cardID ) {
            // remove article from citations array
            const deletedArticleObj = articleObjs.splice( index, 1 )[0];

            // put deleted article in separate local storage field
            writeDeletedToLocalStorage( deletedArticleObj );
        }
    } );

    // update localStorageArticleJSON after removal
    localStorage.setItem( 'last-retrieved', JSON.stringify( localStorageArticleJSON ) );
}

// add deleted article to local storage
function writeDeletedToLocalStorage( articleObj ) {
    // get local array if it exists, else create new empty array
    const localRemovedArticlesArray = JSON.parse( localStorage.getItem( 'removed' ) ?? '[]' );

    localRemovedArticlesArray.push( articleObj );

    localStorage.setItem( 'removed', JSON.stringify( localRemovedArticlesArray ) );
}

