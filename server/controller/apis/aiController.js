/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
 */

// dependencies
const openAi = require( 'openai' ); 
const fetch = require( 'node-fetch' );

// services
const resourceService = require( '../../service/resourceService' );

// min string length for resource content
const MIN_CONTENT_LENGTH = 650;

// Configuration for OpenAI API
const OPENAI_CONFIG = new openAi.Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );

exports.generateAvatar = async ( req, res ) => {

    let prompt = req.body.prompt;

    console.log( "prompt: " + prompt );
    let openai = new openAi.OpenAIApi( OPENAI_CONFIG );
    console.log( "openai:" );
    
    const response = await openai.createImage( {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
    } );
    let image_url = response.data.data[0].url;

    return image_url;
};

exports.callOpenAI = async ( req, res ) => {

    let mode = req.body.mode; // TODO: use this for notes vs paper
    let resourceId = req.body.resourceId;
    let removedArticles = req.body.removedArticles;

    console.log( "removed Articles: " + removedArticles );

    let resourceContent = await resourceService.getResourceContentById( resourceId, false ); 

    //console.log( "resourceContent: " + resourceContent );

    if ( resourceContent ) {
        let parsedResourceContent = cleanHtml( resourceContent );

        //console.log( "\n\nmodified resourceContent: " + parsedResourceContent );
        
        if ( parsedResourceContent.length > 0 ) {
            let prompt = mode == 'paper' ? createPaperPrompt( parsedResourceContent, removedArticles ) : createNotesPrompt( parsedResourceContent, removedArticles );
            const systemMessage = mode == 'paper' ? `You are assisting me in finding peer reviewed and scholarly research that is relevant to the paper I am writing. Please return ONLY JSON object, no fluff.` : `You are assisting me in finding relevant resources related to my writing, these could be blog posts, news articles, papers, or other reputable works. Please return ONLY JSON object, no fluff.`;
        
            // Wrap in a try catch so that the server doesn't crash when an error occurs
            try {
                let openai = new openAi.OpenAIApi( OPENAI_CONFIG );
            
                // const completion = await openai.createChatCompletion( {
                //     model: "gpt-4-1106-preview",
                //     temperature: 0, // variance in the response - play with this for different results
                //     response_format: { "type": "json_object" },
                //     messages: [ 
                //         { role: "system", content: `You are assisting me in finding peer reviewed and scholarly research that is relevant to the ${mode} I am writing using the abstract, keywords and initial citations that I provide. Please return ONLY JSON object, no fluff.` },
                //         { role: "user", content: prompt }
                //     ]
                    
                // } );

                console.log( "systemMessage: " + systemMessage );
                console.log( "prompt: " + prompt );

                const completion = await openai.createChatCompletion( {
                    model: "gpt-4-1106-preview",
                    temperature: 0, // variance in the response - play with this for different results
                    response_format: { "type": "json_object" },
                    max_tokens: 2000,
                    messages: [ 
                        { role: "system", content: systemMessage },
                        { role: "user", content: prompt }
                    ]
                    
                } );
                

                let returnValue = completion.data.choices[0];

                console.log( "return value raw: " + JSON.stringify( returnValue.message ) );
        
                let rawJson = JSON.parse( returnValue.message.content ); // the raw JSON response from the AI
                
                let validatedCitations = await validateSources( rawJson, mode );
                //console.log( "validatedCitations: " + validatedCitations );
        
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

function createPaperPrompt( abstract, ignoredArticles ) {
    //console.log( "abstract being used: " + abstract );
    let basePrompt = `I am writing a paper. Please return literature that supports my writing, but also any literature you find that might offer different perspectives on this problem. Organize the data returned in a JSON object with an array titled citations, where each object in the array contains the following fields: title, authors, publication, publicationDate, link, summary.

            Content of the paper I'm writing:
            '''
            ${abstract}
            '''
           `;

    if ( ignoredArticles.length > 0 ) {
        let removedArticles = `Please don't return any articles that match the following, and find ${ignoredArticles.length} articles to replace them:\n`;

        ignoredArticles.forEach( article => {
            removedArticles +=  article.title + " by " + article.authors[0];
        } );

        basePrompt += removedArticles;
    }

    return basePrompt;
}

function createNotesPrompt( notes, ignoredArticles ) {
    let basePrompt = `I am writing notes. Please return resources that are related to my notes, but also items you find that might offer different perspectives on the subject. Organize the data returned in a JSON object with an array titled citations, where each object in the array contains the following fields: title, link, summary.

            Here are my notes:
            '''
            ${notes}
            '''
            `;
    

    if ( ignoredArticles ) {
        let removedArticles = "Please don't return the articles that match the following:\n";

        ignoredArticles.forEach( article => {
            removedArticles +=  article.title + " by " + article.authors[0];
        } );

        basePrompt += removedArticles;
    }

    return basePrompt;
}


function cleanHtml( htmlString ) {
    // Replace <br> and <br /> with \n
    htmlString = htmlString.replace( /<br\s*\/?>/gi, '\n' );

    // Replace <p> with \n\n
    htmlString = htmlString.replace( /<p>/gi, '\n\n' );

    // Remove all other HTML tags
    htmlString = htmlString.replace( /<[^>]+>/gi, '' );

    // Optional: Clean up extra whitespaces/newlines
    //htmlString = htmlString.replace( /\n\s*\n/g, '\n\n' ); // Remove extra newlines

    return htmlString;
}


/** 
 * Validate all the sources in the specified JSON.
 * 
 * @param {JSON} json The JSON from OpenAI.
 * @returns {JSON[]}
 */
const validateSources = async ( json, mode ) => {
    let citations = json["citations"];

    let newCitations = [];
    let newIndex = 0;

    for ( let i = 0; i < citations.length; i++ ) {
        let citation = citations[i];

        let paper = citation.title;
        if ( mode == 'paper' ) {
            paper = await querySemanticScholar( citation.title );
        } 

        if ( paper ) {
            paper = paper[0];

            if ( citation.title.indexOf( paper.title ) >= 0 ) {
                let authors = paper.authors.map ( function ( a ) {
                    return a.name; 
                } );

                let newCitation = {
                    id: newIndex,
                    title: paper.title,
                    link: paper.url,
                    summary: citation.summary,
                };

                if( mode == 'paper' ) {
                    newCitation = {
                        id: newIndex,
                        title: paper.title,
                        authors: ( paper.authors.length > 1 ) ? authors : [ paper.authors[0].name ],
                        publication: ( paper.publicationVenue != null ) ? paper.publicationVenue.name : citation.publication,
                        publicationDate: ( paper.year != null ) ? paper.year : citation.publicationDate,
                        link: paper.url,
                        summary: citation.summary,
                    };
                }
    
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
        let response = await fetch( `https://api.semanticscholar.org/graph/v1/paper/search?query=${title}&limit=${limit}&fields=title,authors,year,url,publicationVenue`, {
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