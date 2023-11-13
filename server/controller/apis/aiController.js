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

    if ( resourceContent ) {
        let parsedResourceContent = parseResourceContentHtml( resourceContent );
        
        if ( parsedResourceContent.length > 0 ) {
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
        
                let rawJson = JSON.parse( returnValue.message.content ); // the raw JSON response from the AI
                
                let validatedCitations = await validateSources( rawJson );
        
                let newJsonObject = {
                    citations: validatedCitations
                };

                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned response from OpenAI" );
                res.status( 200 ).json( newJsonObject );
            } 
            catch ( e ) {
                console.log( e );
                res.set( "x-agora-message-title", "Error" );
                res.set( "x-agora-message-detail", "Failed to return response from OpenAI" );
                res.status( 500 ).json( {"error": "Failed to return response from OpenAI"} );
            }
        } 
        else {
            res.set( "x-agora-message-title", "Error" );
            res.set( "x-agora-message-detail", "Content not long enough" );
            res.status( 500 ).json( {"error": "You have not written enough to utilize Agnes. Please write a paragraph with a minimum of 650 characters."} );
        }
    } 
    else {
        res.set( "x-agora-message-title", "Error" );
        res.set( "x-agora-message-detail", "Failed to find document/resource." );
        res.status( 500 ).json( {"error": "Failed to find document/resource. Please create or select a document."}  );
    }
};

// helper logic

function createPaperPrompt( abstract ) {
    return `I am writing a paper. Please return literature that supports my writing, but also any literature you find that might offer different perspectives on this problem. Organize the data returned in a JSON object with an array titled citations, where each object in the array contains the following fields: title, authors, publication, publicationDate, link, summary.

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

/** 
 * Validate all the sources in the specified JSON.
 * 
 * @param {JSON} json The JSON from OpenAI.
 * @returns {JSON[]}
 */
const validateSources = async ( json ) => {
    let citations = json["citations"];

    let newCitations = [];
    let newIndex = 0;

    for ( let i = 0; i < citations.length; i++ ) {
        let citation = citations[i];

        let paper = await querySemanticScholar( citation.title );

        if ( paper ) {
            paper = paper[0];

            if ( citation.title.indexOf( paper.title ) >= 0 ) {
                let authors = paper.authors.map ( function ( a ) {
                    return a.name; 
                } );

                let newCitation = {
                    id: newIndex,
                    title: paper.title,
                    authors: ( paper.authors.length > 1 ) ? authors : [ paper.authors[0].name ],
                    publication: ( paper.publicationVenue != null ) ? paper.publicationVenue.name : citation.publication,
                    publicationDate: ( paper.year != null ) ? paper.year : citation.publicationDate,
                    link: paper.url,
                    summary: citation.summary,
                };
    
                newCitations.push( newCitation );

                newIndex++;
            }
        }
    }

    return newCitations;
};

/**
 * Queries a paper with an exact title from Semantic Scholar.
 * 
 * @param {string} title The title of the article from OpenAI.
 * @param {number} limit The number of results to pull from SemanticScholar.
 */
const querySemanticScholar = async ( title, limit = 1 ) => {
    try {
        // The quotes in the string make it so that we can match for a literal title
        let response = await fetch( `https://api.semanticscholar.org/graph/v1/paper/search?query=\"${title}\"&limit=${limit}&fields=title,authors,year,url,publicationVenue`, {
            headers: {
                'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        } );

        let json = await response.json();

        return json.data;
    }
    catch ( e ) {
        console.log( "There was an error in validating the title with Semantic Scholar: " + e );
    }
};