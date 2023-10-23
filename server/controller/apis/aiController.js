/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
 */

// dependencies
const openAi = require( 'openai' ); 

// services
const resourceService = require( '../../service/resourceService' );

// min string length for resource content
const MIN_CONTENT_LENGTH = 650;

// Configuration for OpenAI API
const OPENAI_CONFIG = new openAi.Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );

exports.callOpenAI = async ( req, res ) => {
    let mode = req.body.mode; // TODO: use this for notes vs paper
    let resourceId = req.body.resourceId;

    let resourceContent = await resourceService.getResourceContentById( resourceId, false ); 
    let parsedResourceContent = parseResourceContentHtml( resourceContent );

    let prompt = createPaperPrompt( parsedResourceContent[0] ); // get the first 

    // Wrap in a try catch so that the server doesn't crash when an error occurs
    try {
        let openai = new openAi.OpenAIApi( OPENAI_CONFIG );
    
        const completion = await openai.createChatCompletion( {
            model: "gpt-3.5-turbo",
            temperature: 0, // variance in the response - play with this for different results
            messages: [ 
                { role: "system", content: "You are assisting me in finding peer reviewed and scholarly research that is relevant to the paper I am writing using the abstract, keywords and initial citations that I provide. Please return ONLY JSON object, no fluff." },
                { role: "user", content: prompt }
            ]
        } );
      
        let returnValue = completion.data.choices[0];
  
        let json = JSON.parse( returnValue.message.content );
  
        // TODO: call something to validate the results here
        
        res.set( "x-agora-message-title", "Success" );
        res.set( "x-agora-message-detail", "Returned response from OpenAI" );
        res.status( 200 ).json( json );
    } 
    catch {
        res.set( "x-agora-message-title", "Error" );
        res.set( "x-agora-message-detail", "Failed to return response from OpenAI" );
        res.status( 500 ).json( "" );

    }
};

// helper logic

function createPaperPrompt( abstract ) {
    return `I am writing a paper on assessing the use of generative large language models to provide assistance identifying supporting literature for research. Please return literature that supports my writing, but also any literature you find that might offer different perspectives on this problem. Organize the data returned in JSON format with the following fields: sourceTitle, sourceAuthors, sourcePublication, sourcePublicationDate, sourceLink, sourceSummary.

            Abstract of the paper I'm writing:
            '''
            ${abstract}
            '''
           `;
}


/**
 * Parses resource content for paragraphs longer than min length.
 * 
 * @param {string} content resourceContentHtml from resource.
 * @returns {string[]}
 */
const parseResourceContentHtml = ( content ) => {

    // getting all paragraphs by spliting by <p> tag
    let paragraphs = content.split( '<p>' );

    // removing all html tags in individual strings
    for ( var i = 0; i < paragraphs.length; i++ ) {
        paragraphs[i] = paragraphs[i].replace( /<[^>]*>/g, '' ).trim();
    }

    // shifting array to ignore first empty string
    paragraphs.shift();

    // filter out all paragraphs with length less than min
    return paragraphs.filter( ( paragraph ) => paragraph.length >= MIN_CONTENT_LENGTH );
};