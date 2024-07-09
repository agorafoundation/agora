/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 * 
 * Description: Decision Engine for dynamic input. This file deals with what should be
 * happening every so often such as paper references, tone analysis, and
 * paper structure
 * 
 * Authors: Christian Sarmiento, Luke Pecovic
 * 
 * Date Created: 7/8/2024
 * 
 * Last Updated: 7/8/2024
 */

// Imports
import { getCurrentActiveTopic } from "./state/stateManager.js";
import { lastEditedResourceId } from "./editorManager.js";
import { makeAPICall } from "./agnesAI.js"


// Variables
const minWordsRef = 50  // arbitrary value for paper references, can be changed
const minWordsTone = 250  // arbitrary value for parsed tone analysis

/**
 * Main function that directs input to different events such as paper references
 * and tone analysis
 * 
 * @param {*} resource current resource to send content to AI API
 */
async function getDecisionEngine( resource ) {

    // Variables
    let apiCalled = false;

    if ( resource ) {

        let resourceID = resource.resourceId
        let parsedResourceText = extractText(resource.resourceContentHtml);
        let resourceTextLength = parsedResourceText.length;

        // Paper References
        if ( resourceTextLength >= minWordsRef ) {

            await makeAPICall();
            apiCalled = true;

        } // if

        // Tone Analysis
        if ( apiCalled ) {

            setInterval(getToneAnalysis(parsedResourceText, resourceID), 
                        120000); // every 2 minutes

        } // if

    } // if


} 





// getDecisionEngine

/**
 * Function that deals with the tone analysis component of the decision engine.
 * 
 * @param {*} resourceText text within the resource to be passed to API
 */
async function getToneAnalysis( resourceText, id ) {

    // Variables
    let paragraphs = []

    // Full text tone analysis
    callToneAnalysisAPI(resourceText, id);

    // Parsed text tone analysis
    if ( resourceText.length > minWordsTone ) {

        paragraphs = parseText(resourceText);
        for (i; i < paragraphs.length; i++)
            callToneAnalysisAPI(paragraphs[i], id);

    } // if

}
// parseText()
// Takes in whole reosurce text and breaks it down into paragraphs or tone analysis of each paragraph
function parseText(text) {
    // Split the text by two or more consecutive line breaks to get paragraphs
    let paragraphs = []
    paragraphs = text.split(/\n\s*\n/);
    
    // Trim leading and trailing whitespace from each paragraph
    paragraphs = paragraphs.map(paragraph => paragraph.trim());

    return paragraphs;
}






// getToneAnalysis()

// TODO: make parseText() & callToneAnalysisAPI()
// TODO: make API endpoint for tone analysis (going to need new file)

/**
 * Function similar to makeAPICall() that calls the endpoint for tone analysis
 * @param {*} text raw text from resource to be given to tone analysis
 */
async function callToneAnalysisAPI( text, identifier ) {

    // Variables

    // Put any visibily variables here
    // loadingSpinnerContainer.hidden = false;
    // citationsContainer.hidden = true;

    let requestData = {
        resourceId: identifier,
        resourceText: text
    }

    try {

        // Make fetch call to "aiController.js" API
        const response = await fetch( 'api/v1/auth/ai/tone-analysis', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(requestData)
        });

        // More visibily - might be changed/altered later
        //allCardsContainer.innerHTML = ""; // Clear the current cards.
        //selectedContent.classList.remove( 'hidden' );

        if ( response.ok ) {

            // logic to deal with API response
            // build other side of endpoint first and see how data comes back

            // Visibility
            //loadingSpinnerContainer.hidden = true;
            //citationsContainer.hidden = false;

        } // if

    } // try
    catch ( error ) {

        // Handle network or other errors here
        loadingSpinnerContainer.hidden = true;
        citationsContainer.hidden = false;
        console.error( 'Fetch request failed: - Network or other errors', error );
    
    } // catch

} // callToneAnalysisAPI()

// Helper Functions

/**
 * Function that takes raw HTML to get the raw text within
 * 
 * @param {*} htmlString raw HTML from resource
 * @returns raw text from resource
 */
function extractText( htmlString ) {
    // Replace <br> and <br /> with \n
    htmlString = htmlString.replace( /<br\s*\/?>/gi, '\n' );

    // Replace <p> with \n\n
    htmlString = htmlString.replace( /<p>/gi, '\n\n' );

    // Remove all other HTML tags
    htmlString = htmlString.replace( /<|>/g, "" );

    // Optional: Clean up extra whitespaces/newlines
    //htmlString = htmlString.replace( /\n\s*\n/g, '\n\n' ); // Remove extra newlines

    return htmlString;

} // extractText()

// Exports
export { getDecisionEngine }


