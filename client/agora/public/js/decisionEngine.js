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
import { cleanHtml } from "../../../../server/controller/apis/aiController.js";

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

        let parsedResourceText = cleanHtml(resource.resourceContentHtml);
        let resourceTextLength = parsedResourceText.length;

        // Paper References
        if ( resourceTextLength >= minWordsRef ) {

            await makeAPICall();
            apiCalled = true;

        } // if

        // Tone Analysis
        if ( apiCalled ) {

            setInterval(getToneAnalysis(parsedResourceText), 
                        120000); // every 2 minutes

        } // if

    } // if


} // getDecisionEngine

/**
 * Function that deals with the tone analysis component of the decision engine.
 * 
 * @param {*} resourceText text within the resource to be passed to API
 */
async function getToneAnalysis( resourceText ) {

    // Variables
    let paragraphs = []

    // Full text tone analysis
    callToneAnalysisAPI(resourceText);

    // Parsed text tone analysis
    if ( resourceText.length > minWordsTone ) {

        paragraphs = parseText(resourceText);
        for (i; i < paragraphs.length; i++)
            callToneAnalysisAPI(paragraphs[i]);

    } // if

} // getToneAnalysis()

// TODO: make parseText() & callToneAnalysisAPI()
// TODO: make API endpoint for tone analysis (going to need new file)

/**
 * Function similar to makeAPICall() that calls the endpoint for tone analysis
 */
async function callToneAnalysisAPI( text ) {

    // Variables

    // Put any visibily variables here
    // loadingSpinnerContainer.hidden = false;
    // citationsContainer.hidden = true;

    let requestData = {
        resourceId: ( lastEditedResourceId != null ) ? lastEditedResourceId : getCurrentActiveTopic().resources[0].resourceId, // get the first one if none are selected
        resourceText: text
    }

    try {

        // Make fetch call to "aiController.js" API
        const response = await fetch( 'API PATH', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(requestData)
        });

        // More visibily - might be changed/altered later
        //allCardsContainer.innerHTML = ""; // Clear the current cards.
        
        //selectedContent.classList.remove( 'hidden' );

    } // try
    catch ( error ) {

        // Handle network or other errors here
        loadingSpinnerContainer.hidden = true;
        citationsContainer.hidden = false;
        console.error( 'Fetch request failed: - Network or other errors', error );
    
    } // catch

} // callToneAnalysisAPI()

// Exports
export { getDecisionEngine }


