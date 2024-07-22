/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause
 */

// dependencies
const openAi = require( 'openai' ); 
const fetch = require( 'node-fetch' );
const spellchecker = require( 'simple-spellchecker' );

// services
const resourceService = require( '../../service/resourceService' );

// min string length for resource content
const MIN_CONTENT_LENGTH = 650;

// Configuration for OpenAI API
const OPENAI_CONFIG = new openAi.Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );

// Configuration for HuggingFace
const { HfInference } = require('@huggingface/inference');
const inference = new HfInference(process.env.HF_USER_TOKEN);
const granite7B = inference.endpoint('https://brdcvmgjhivmp6i6.us-east-1.aws.endpoints.huggingface.cloud');

exports.generateAvatar = async ( req, res ) => {

    if( process.env.OPENAI_TOGGLE === "true" ){
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
    }
    else {
        res.set( "x-agora-message-title", "OpenAI API Restricted" );
        res.set( "x-agora-message-detail", "API is not enabled see OPENAI_TOGGLE flag in .env file" );
        res.status( 403 ).json( {"error": "OpenAI API Restricted, Set the env variable OPENAI_TOGGLE to true"} );
    }
};

exports.callOpenAI = async ( req, res ) => {

    if( process.env.OPENAI_TOGGLE === "true" ){
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
                const systemMessage = mode == 'paper' ? `You are assisting me in finding peer reviewed and scholarly research that is relevant to the paper I am writing. Please return ONLY JSON object, do not make up responses.` : `You are a research expert. Your goal is to find additional resources that are related to the text that I provide. Please return resources that are related to my notes, but also items you find that might offer different perspectives on the subject. Organize the data returned in a JSON object with an array titled citations, where each object in the array contains the following fields: title, link, summary.`;
            
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

                    //console.log( "systemMessage: " + systemMessage );
                    //console.log( "prompt: " + prompt );

                    const completion = await openai.createChatCompletion( {
                        model: "gpt-4o",
                        temperature: 0, // variance in the response - play with this for different results
                        response_format: { "type": "json_object" },
                        max_tokens: 2000,
                        messages: [ 
                            { role: "system", content: systemMessage },
                            { role: "user", content: prompt }
                        ]
                        
                    } );
                    

                    let returnValue = completion.data.choices[0];

                    
            
                    let rawJson = JSON.parse( returnValue.message.content ); // the raw JSON response from the AI
                    //console.log( "json returned in content : \n" + JSON.stringify( returnValue.message ) + "\n\n" );
                    
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
    }
    else {
        res.set( "x-agora-message-title", "OpenAI API Restricted" );
        res.set( "x-agora-message-detail", "API is not enabled see OPENAI_TOGGLE flag in .env file" );
        res.status( 403 ).json( {"error": "OpenAI API Restricted, Set the env variable OPENAI_TOGGLE to true"} );
    }
};

exports.callToneAnalysis = async ( req, res ) => {

    // Other side of API endpoint - use hugging face as failsafe incase
    // watsonx doesn't work out
    console.log('Made it to server side code');
    if ( process.env.HF_TOGGLE === 'true' ) {

        console.log('env variable is fine');
        // Incoming body values
        let resourceID = req.body.resourceId;
        let textInput = req.body.resourceText;

        if ( textInput.length > 0 ) {

            try {

                // Get tone analysis for given input text
                console.log('calling granite');
                let graniteOutput = await granite7B.textGeneration({
                    inputs: createToneAnalysisPrompt(textInput)
                });
                console.log('Tone analysis returned.')

                // Get the keywords returned
                let toneAnalysisOutput = graniteOutput.generated_text;
                let returnedToneKeywords = toneAnalysisOutput.split(/\s+/);

                // Ensure keywords returned are real words and are correctly spelled
                let validatedKeywords = getSpellCheck(returnedToneKeywords);
                console.log('Tone analysis keywords validated.');

                // Create JSON object to return back to the user
                let newJSONObject = {
                    keywords: validatedKeywords
                };

                // Return to user
                res.set( "x-agora-message-title", "Success" );
                res.set( "x-agora-message-detail", "Returned response from HuggingFace" );
                res.status( 200 ).json( newJSONObject );


            } // try
            catch ( error ) {

                console.log(error);
                res.set( "x-agora-message-title", "Error" );
                res.set( "x-agora-message-detail", "Failed to return response from HuggingFace" );
                res.status( 500 ).json( {"error": "Failed to return response from HuggingFace"} );
                
            } // catch

        } // if
        else {

            res.set( "x-agora-message-title", "Error" );
            res.set( "x-agora-message-detail", "Content not long enough" );
            res.status( 500 ).json( {"error": "You have not written enough to analyze tone. Please write something to give the model to work with."} );

        } // else

    } // if
    else {

        res.set( "x-agora-message-title", "HuggingFace API Restricted" );
        res.set( "x-agora-message-detail", "API is not enabled see HF_TOGGLE flag in .env file" );
        res.status( 403 ).json( {"error": "HuggingFace API Restricted, Set the env variable HF_TOGGLE to true"} );

    } // else

}; // exports.callToneAnalysis()

// helper logic

function createPaperPrompt( abstract, ignoredArticles ) {
    //console.log( "abstract being used: " + abstract );
    let basePrompt = `I am writing a paper. Please return published literature that supports my writing, but also any literature you find that might offer different perspectives on this problem. Organize the data returned in a JSON object with an array titled citations, where each object in the array contains the following fields: title, authors, publication, publicationDate, link, summary. DO NOT RETURN ANYTHING THAT IS NOT A PUBLISHED LITERATURE.    

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
    let basePrompt = `Please return only real web links that I should consider for the following text:
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
    htmlString = htmlString.replace( /<|>/g, "" );

    // Optional: Clean up extra whitespaces/newlines
    //htmlString = htmlString.replace( /\n\s*\n/g, '\n\n' ); // Remove extra newlines

    return htmlString;
}

/**
 * Function that creates the prompt for the tone analysis model.
 * @param {*} input parsed text from the resource editor.
 * @returns returns the final built prompt to pass along to the API.
 */
function createToneAnalysisPrompt( input ) {

    let prompt = `Analyze the text for the tone of the entire text. Return 
    the tone as a list of different keywords that encapsulate the tone. The ONLY 
    output that should be returned is the keywords as a list, NOTHING ELSE. 
    DO NOT return more than 5 keywords.`;

    let example = `Example Text 1: Sorry for the last minute cancellation. I have 
    a department meeting at IBM that I thought would be done before our meeting, 
    but unfortunately, it won’t.  I talked to the Joint Study students earlier 
    about yesterday’s event and thanked them for all of their help and 
    participation, and got their feedback on the day as well.  If you have 
    additional items that need to be discussed, please stop and talk to me 
    tomorrow, slack me, or schedule a meeting.

    Example Output 1: apologetic, professional, informative, grateful, accommodating`;

    let fullPrompt = prompt + '\n\n' + example + '\n\n' + 'Text: ' + input + '\n\nOutput: ';

    return fullPrompt;

} // createToneAnalysisPrompt()

/**
 * Helper function that spellchecks returned keywords from Granite Model.
 * @param {*} words the keywords returned from the Granite mode.
 * @returns Returns the corrected list of words.
 */
function getSpellCheck( words ) {

    // Variables
    let i = 0;

    spellchecker.getDictionary('en-US', function(error, dictionary) {

        if( error ) {

            console.log("Could not load spellchecker dictionary: ", error);
            return;

        } // if

        // Check each returned word
        for(i; i < words.length; i++) {

            word = words[i];
            if( !dictionary.spellCheck(word) ){

                // Switch word to correct word
                const suggestion = dictionary.getSuggestions(word, limit=1);
                console.log(words[i] + " changed to " + suggestion[0] + ".");
                words[i] = suggestion[0];

            } // if

        } // for

    });

    return words;

} // getSpellCheck()

/** 
 * Validate all the sources in the specified JSON.
 * 
 * @param {JSON} json The JSON from OpenAI.
 * @returns {JSON[]}
 */
const validateSources = async ( json, mode ) => {
    //console.log( "starting validateSources: " + JSON.stringify( json ) + "\n\n" );
    let citations = json["citations"];

    let newCitations = [];
    let newIndex = 0;

    for ( let i = 0; i < citations.length; i++ ) {
        let citation = citations[i];

        let paper = citation.title;
        if ( mode == 'paper' ) {
            paper = await querySemanticScholar( citation.title );

            if ( paper ) {
                //console.log( "returned a paper for the following citation: " + JSON.stringify( citation ) + "\n\n" );
                paper = paper[0];
                //console.log( "paper: " + JSON.stringify( paper ) + "\n\n" );

                let authors = [];
    
                if ( paper.authors.length >= 0 ) {
                    authors = paper.authors.map ( function ( a ) {
                        return a.name; 
                    } );
                }
                
                let newCitation = {
                    id: newIndex,
                    title: paper.title,
                    authors: ( paper.authors.length > 1 ) ? authors : [ paper.authors[0].name ],
                    publication: ( paper.publicationVenue != null ) ? paper.publicationVenue.name : citation.publication,
                    publicationDate: ( paper.year != null ) ? paper.year : citation.publicationDate,
                    link: paper.url,
                    summary: citation.summary,
                };
                //console.log( "newCitation: " + JSON.stringify( newCitation ) + "\n\n" );    
                
    
                newCitations.push( newCitation );
                //console.log( "newCitations at i: " + i + " : " + JSON.stringify( newCitations ) + "\n\n" );

                newIndex++;
            }
        } 
        else {
            /* 
             * to validate a paper url we neet to query it and parse the html for the title, if it is containted we will consider it valid.
             */
            
            let siteHtml = await fetch( citation.link, {'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:80.0) Gecko/20100101 Firefox/80.0'} );
            let siteText = await siteHtml.text();

            // remove all the tags from the html but leave the text
            //siteText = cleanHtml( siteText );

            // get the first word of the title
            let firstWord = citation.title.split( " " )[0];

            // get the first 3 words of the title
            let firstThreeWords = citation.title.split( " " ).slice( 0, 3 ).join( " " );

            // console.log( "run : " + i + " body check: " + siteText.includes( firstThreeWords ) );
            // console.log( "run : " + i + " url check: " + citation.link.includes( firstWord ) );
            
            // Search for the specific string
            if( siteText.includes( firstThreeWords ) ) {
                //console.log( "found a valid citation in the body: \n" );
                let newCitation = {
                    id: newIndex,
                    title: citation.title,
                    link: citation.link,
                    summary: citation.summary,
                };
    
                newCitations.push( newCitation );
        
                newIndex++;
            }
            else if( citation.link.includes( firstWord ) ) {
                //console.log( "found a valid citation in the url: \n" );
                let newCitation = {
                    id: newIndex,
                    title: citation.title,
                    link: citation.link,
                    summary: citation.summary,
                };
    
                newCitations.push( newCitation );
        
                newIndex++;
            }
        }
    }
    //console.log( "newCitations: " + JSON.stringify( newCitations ) );

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
        let url = "https://api.semanticscholar.org/graph/v1/paper/search?query=" + title + "&limit=" + limit + "&fields=title,authors,year,url,publicationVenue";
        // console.log( `semantic scholar url 1: https://api.semanticscholar.org/graph/v1/paper/search?query=${title}&limit=${limit}&fields=title,authors,year,url,publicationVenue` );
        // console.log( "semantic scholar url 2: " + url );
        let response = await fetch( url, {
            headers: {
                'x-api-key': process.env.SEMANTIC_SCHOLAR_API_KEY
            }
        } );

        let json = await response.json();
        console.log( "semantic scholar json.data: " + JSON.stringify( json.data ) + "\n\n" );

        return json.data;
    }
    catch ( e ) {
        console.log( "There was an error in validating the title with Semantic Scholar: " + e );
    }
};

