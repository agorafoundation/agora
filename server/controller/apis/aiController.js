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
const { HfInference } = require('@huggingface/inference');

// services
const resourceService = require( '../../service/resourceService' );

// min string length for resource content
const MIN_CONTENT_LENGTH = 650;

// Configuration for OpenAI API
const OPENAI_CONFIG = new openAi.Configuration( {
    apiKey: process.env.OPENAI_API_KEY,
} );


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

// Server side API endpoint for tone analysis & explanation using IBM Granite-7B through Hugging Face
exports.callToneAnalysis = async ( req, res ) => {

    if ( process.env.HF_TOGGLE === 'true' ) {

        // Variables
        let resourceID = req.body.resourceId;
        let textInput = req.body.resourceText;
        let validatedKeywords = '';
        let newJSONObject = {};

        // Full tone analysis & explanation process
        try {

            // Define initial tone analysis variables
            let initialToneParameters = {
                "return_full_text": false, 
                "max_new_tokens": 35
            };
            let initialTonePrompt = createToneAnalysisPrompt('initial-tone', textInput);

            // Get tone analysis for given input text
            console.log('Calling Granite for Tone Analysis');
            queryGranite({"inputs": initialTonePrompt, "parameters": initialToneParameters})
                .then((response) => {
                    
                // Get the keywords returned 
                console.log('Tone analysis returned.');
                let toneAnalysisOutput = response[0].generated_text;
                let returnedToneKeywords = toneAnalysisOutput.split(',');

                // Clean up output from model to just be the correct words
                validatedKeywords = validateToneKeywords(returnedToneKeywords);
                console.log('Tone analysis keywords validated.');

                // Append to JSON object
                newJSONObject["keywords"] = validatedKeywords;
                console.log("Keywords appended to object.");

                // Define keyword explanation variables
                let explanationParameters = {
                    "return_full_text": false, 
                    "max_new_tokens": 260
                };
                let explantionPrompt = createToneAnalysisPrompt('keyword-explanation', textInput, validatedKeywords);

                // Call Granite for keyword explanation
                console.log('Calling Granite for Keyword Explanation');
                queryGranite({"inputs": explantionPrompt, "parameters": explanationParameters})
                    .then((response) => {
                         
                        // Get output
                        console.log('Keyword Explanation returned.');
                        let explanationOutput = response[0].generated_text;
        
                        // Make sure there is no trailing text besides JSON object
                        const jsonString = explanationOutput.match(/\{[\s\S]*\}/)[0];

                        // Parse string for JSON object
                        const explantionObject = JSON.parse(jsonString);

                        // Add to JSON object
                        newJSONObject["keywordExplanations"] = explantionObject;
                        console.log("Explanations appended to object.");

                        // Define tone highlight parameters
                        let highlightsParameters = {
                            "return_full_text": false, 
                            "max_new_tokens": 260
                        };
                        let highlightsPrompt = createToneAnalysisPrompt('tone-highlights', textInput, validatedKeywords);

                        // Call Granite for keyword tone highlights
                        console.log('Calling Granite for Keyword Tone Highlights');
                        queryGranite({"inputs": highlightsPrompt, "parameters": highlightsParameters})
                            .then((response) => {
                                
                                // Get output
                                console.log('Tone Highlights returned.');
                                let highlightOutput = response[0].generated_text;
                
                                // Make sure there is no trailing text besides JSON object
                                const jsonString = highlightOutput.match(/\{[\s\S]*\}/)[0];

                                // Parse string for JSON object
                                const highlightsObject = JSON.parse(jsonString);

                                // Add to JSON object
                                newJSONObject["toneHighlights"] = highlightsObject;
                                newJSONObject["keywordsID"] = resourceID;
                                console.log("Highlights appended to object.");

                                // Return to user
                                res.set( "x-agora-message-title", "Success" );
                                res.set( "x-agora-message-detail", "Returned response from HuggingFace" );
                                res.status( 200 ).json( newJSONObject );
                                console.log("Tone Analysis process complete.");

                            }); // then

                    }); // then

            }); // then

            // Uncomment to test without having to connect to hugging face - just ensure format is up to date with current implementation
            //let tempObject = {keywords: ["Gato", "hydro", "Pow", "Dog", "Fortnite", "cheese"]};
            //res.status( 200 ).json( tempObject );       
        } // try
        catch ( error ) {

            console.log(error);
            res.set( "x-agora-message-title", "Error" );
            res.set( "x-agora-message-detail", "Failed to return response from HuggingFace" );
            res.status( 500 ).json( {"error": "Failed to return response from HuggingFace"} );
            
        } // catch

    } // if
    else {

        res.set( "x-agora-message-title", "HuggingFace API Restricted" );
        res.set( "x-agora-message-detail", "API is not enabled see HF_TOGGLE flag in .env file" );
        res.status( 403 ).json( {"error": "HuggingFace API Restricted, Set the env variable HF_TOGGLE to true"} );

    } // else

}; // exports.callToneAnalysis

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
 * Function pulled from Hugging Face documentation for calling the API 
 * for a response.
 * https://huggingface.co/docs/api-inference/en/detailed_parameters?code=js
 * @param {*} data data to send through to the API
 * @returns response from the API 
 */
async function queryGranite( data ) {
	const response = await fetch(
		"https://brdcvmgjhivmp6i6.us-east-1.aws.endpoints.huggingface.cloud",
		{
			headers: { 
				"Accept" : "application/json",
				"Authorization": "Bearer " + process.env.HF_USER_TOKEN,
				"Content-Type": "application/json" 
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);

	const result = await response.json(); 
	return result;

} // queryGranite()

/**
 * Function that creates the prompt for the tone analysis model.
 * @param {*} promptType specifies which prompt to send to the API
 * @param {*} input parsed text from the resource editor.
 * @param {*} keywords keywords for tone analysis if needed for the prompt. Defaults to null since the initial tone analysis 
 * prompt generates those keywords and thus is not needed for the prompt.
 * @returns returns the final built prompt to pass along to the API.
 */
function createToneAnalysisPrompt( promptType, input, keywords=null ) {

    // Variables
    let fullPrompt = '';

    // Prompt for initial tone analysis keyword generation
    if ( promptType == 'initial-tone' ) {

        let prompt = `Analyze the text for the tone of the entire text. Return the tone as a list of different keywords that encapsulate the tone. The ONLY output that should be returned is the keywords as a list, NOTHING ELSE. DO NOT return more than 5 keywords. NO MORE THAN FIVE KEYWORDS IN THE OUTPUT!!!`;

        let example1 = `Example Text 1: Sorry for the last minute cancellation. I have a department meeting at IBM that I thought would be done before our meeting, but unfortunately, it won’t.  I talked to the Joint Study students earlier about yesterday’s event and thanked them for all of their help and participation, and got their feedback on the day as well.  If you have additional items that need to be discussed, please stop and talk to me tomorrow, slack me, or schedule a meeting.

        Example Output 1: apologetic, professional, informative, grateful, accommodating`;

        let example2 = `Example Text 2: William Butler Yeats, an Irish poet who has heavily contributed to the Irish Literary Revival, was very cultured and very well-versed in the arts. His extensive knowledge and interest in history and in the arts helped him write some impressively magnificent poems throughout the course of his career. In turn, he has become very well renowned for his writing, for his use of different things throught history, and in the arts to convey strong themes in the messages of his poems. Specifically, Yeats was interested in Irish mythology since he used it in a vast amount of his work. His use of Irish mythology has been a distinguishing factor for his work, reminding the Irish nation of their ancient roots through various inspirations and allusions to several Irish myths and legends. In the poems “The Song of Wandering Aengus,” “The Stolen Child,” and “To the Rose upon the Rood of Time,” W.B Yeats rekindles the connection between modern & ancient Irish culture through the use of Irish mythology to convey different themes among a plethora of his works, restoring a sense of Irish pride and identity by differing that part of their culture away from the Greek mythology and way of thinking.

        Example Output 2: "Reverent,  Reflective, Celebratory, Inspirational, Scholarly"`

        fullPrompt = prompt + '\n\n' + example1 + '\n\n' + example2 + '\n\n'+ 'Text: ' + input + '\n\nOutput: ';

    } // if

    // Prompt for explanation of generated tone keywords
    else if ( promptType == 'keyword-explanation' ) {

        let prompt = `For each keyword, please give an explanation on why the text can be classified into the given tone. Return a JSON object that has the keyword as the key and the explanation as the value. The ONLY output returned should be the JSON object, NOTHING ELSE.`
        
        let example1 = `Example Text 1: Sorry for the last minute cancellation. I have a department meeting at IBM that I thought would be done before our meeting, but unfortunately, it won’t.  I talked to the Joint Study students earlier about yesterday’s event and thanked them for all of their help and participation, and got their feedback on the day as well.  If you have additional items that need to be discussed, please stop and talk to me tomorrow, slack me, or schedule a meeting.

        Example Keywords 1: apologetic, professional, informative, grateful, accommodating

        Example Output 1: {
        "apologetic": "The text begins with 'Sorry for the last minute cancellation,' expressing regret for the inconvenience caused.",
        "professional": "The mention of a department meeting at IBM and the structured communication style reflects a professional tone.",
        "informative": "The text provides specific details about the cancellation reason, the meeting with Joint Study students, and options for further discussion.",
        "grateful": "The phrase 'thanked them for all of their help and participation' shows appreciation for the efforts of the Joint Study students.",
        "accommodating": "The text offers multiple ways to follow up ('stop and talk to me tomorrow, slack me, or schedule a meeting'), showing a willingness to accommodate the reader's needs."
        }
        `

        let example2 =  `Example Text 2: William Butler Yeats, an Irish poet who has heavily contributed to the Irish Literary Revival, was very cultured and very well-versed in the arts. His extensive knowledge and interest in history and in the arts helped him write some impressively magnificent poems throughout the course of his career. In turn, he has become very well renowned for his writing, for his use of different things throught history, and in the arts to convey strong themes in the messages of his poems. Specifically, Yeats was interested in Irish mythology since he used it in a vast amount of his work. His use of Irish mythology has been a distinguishing factor for his work, reminding the Irish nation of their ancient roots through various inspirations and allusions to several Irish myths and legends. In the poems “The Song of Wandering Aengus,” “The Stolen Child,” and “To the Rose upon the Rood of Time,” W.B Yeats rekindles the connection between modern & ancient Irish culture through the use of Irish mythology to convey different themes among a plethora of his works, restoring a sense of Irish pride and identity by differing that part of their culture away from the Greek mythology and way of thinking.

        Example Keywords 2: Reverent,  Reflective, Celebratory, Inspirational, Scholarly

        Example Output 2: {
        "Reverent": "The text describes Yeats' deep respect and admiration for Irish mythology and his efforts to remind the Irish nation of their ancient roots, showing a sense of reverence towards his cultural heritage.",
        "Reflective": "The text highlights Yeats' use of history and arts to convey strong themes in his poems, indicating a reflective approach to his work and the cultural significance of his inspirations.",
        "Celebratory": "Yeats' rekindling of the connection between modern and ancient Irish culture and his restoration of Irish pride and identity are portrayed as celebratory acts of cultural revival.",
        "Inspirational": "Yeats' efforts to restore a sense of Irish pride and identity through his poetry, and his use of mythology to inspire and remind people of their heritage, reflect an inspirational tone.",
        "Scholarly": "The text emphasizes Yeats' extensive knowledge, interest in history and the arts, and his well-versed background, indicating a scholarly approach to his writing and contributions to the Irish Literary Revival."
        }
        `

        fullPrompt = prompt + '\n\n' + example1 + '\n\n' + example2 + '\n\n'
        + 'Text: ' + input + '\n\n'+ 'Keywords: ' + keywords + '\n\nOutput: ';

    } // else if

    // Highlighting of inital input text to correspond text with generated tone keywords
    else if ( promptType == 'tone-highlights' ) {

        let prompt = `For each keyword, highlight specific portions of the text that pertain to that keyword. Return a JSON object where the key is the keyword and the value is the specific highlighted portion of the text. The ONLY output returned should be the JSON object, NOTHING ELSE.`
        
        let example1 = `Example Text 1: Sorry for the last minute cancellation. I have a department meeting at IBM that I thought would be done before our meeting, but unfortunately, it won’t.  I talked to the Joint Study students earlier about yesterday’s event and thanked them for all of their help and participation, and got their feedback on the day as well.  If you have additional items that need to be discussed, please stop and talk to me tomorrow, slack me, or schedule a meeting.

        Example Keywords 1: apologetic, professional, informative, grateful, accommodating

        Example Output 1: {
        "apologetic": "Sorry for the last minute cancellation",
        "professional": "I have a department meeting at IBM",
        "informative": "I have a department meeting at IBM that I thought would be done before our meeting, but unfortunately, it won’t. I talked to the Joint Study students earlier about yesterday’s event and thanked them for all of their help and participation, and got their feedback on the day as well.",
        "grateful": "thanked them for all of their help and participation",
        "accommodating": "If you have additional items that need to be discussed, please stop and talk to me tomorrow, slack me, or schedule a meeting."
        }
        `

        let example2 = `Example Text 2: William Butler Yeats, an Irish poet who has heavily contributed to the Irish Literary Revival, was very cultured and very well-versed in the arts. His extensive knowledge and interest in history and in the arts helped him write some impressively magnificent poems throughout the course of his career. In turn, he has become very well renowned for his writing, for his use of different things throught history, and in the arts to convey strong themes in the messages of his poems. Specifically, Yeats was interested in Irish mythology since he used it in a vast amount of his work. His use of Irish mythology has been a distinguishing factor for his work, reminding the Irish nation of their ancient roots through various inspirations and allusions to several Irish myths and legends. In the poems “The Song of Wandering Aengus,” “The Stolen Child,” and “To the Rose upon the Rood of Time,” W.B Yeats rekindles the connection between modern & ancient Irish culture through the use of Irish mythology to convey different themes among a plethora of his works, restoring a sense of Irish pride and identity by differing that part of their culture away from the Greek mythology and way of thinking.

        Example Keywords 2: Reverent,  Reflective, Celebratory, Inspirational, Scholarly

        Example Output 2: {
        "Reverent": "reminding the Irish nation of their ancient roots through various inspirations and allusions to several Irish myths and legends",
        "Reflective": "His extensive knowledge and interest in history and in the arts helped him write some impressively magnificent poems throughout the course of his career",
        "Celebratory": "restoring a sense of Irish pride and identity",
        "Inspirational": "rekindles the connection between modern & ancient Irish culture through the use of Irish mythology to convey different themes among a plethora of his works",
        "Scholarly": "very cultured and very well-versed in the arts. His extensive knowledge and interest in history and in the arts"
        }
        `

        let example3 = `Example Text 3: Assistive technology for communication has made significant strides over the years, providing invaluable support to individuals with various disabilities. Traditional communication aids, such as augmentative and alternative communication (AAC) devices, have been instrumental in giving a voice to those who cannot speak. These devices range from simple picture boards to sophisticated speech-generating devices (SGDs) that can be customized to meet the specific needs of the user. However, the reliance on such devices often requires the presence of a computer or tablet, limiting the user's ability to communicate in situations where these tools are unavailable. This dependency underscores the need for innovative solutions that can bridge the gap when traditional assistive technologies are not accessible.

        Example Keywords 3: Innovative,  Dependable,  Reliable,  Accessible,  Adaptable

        Example Output 3: {
        "Innovative": "the need for innovative solutions that can bridge the gap when traditional assistive technologies are not accessible",
        "Dependable": "traditional communication aids, such as augmentative and alternative communication (AAC) devices, have been instrumental in giving a voice to those who cannot speak",
        "Reliable": "These devices range from simple picture boards to sophisticated speech-generating devices (SGDs) that can be customized to meet the specific needs of the user",
        "Accessible": "providing invaluable support to individuals with various disabilities",
        "Adaptable": "sophisticated speech-generating devices (SGDs) that can be customized to meet the specific needs of the user"
        }
        ` 

        fullPrompt = prompt + '\n\n' + example1 + '\n\n' + example2 + '\n\n'+ example3 
        + '\n\n' +'Text: ' + input + '\n\n'+ 'Keywords: ' + keywords + '\n\nOutput: ';
    } // else if

    return fullPrompt;

} // createToneAnalysisPrompt()

/**
 * Helper function that cleans the output from the model. Sometimes you get extra whitespace
 * or newline characters that get generated.
 * @param {*} words the keywords returned from the Granite mode.
 * @returns Returns the corrected list of words.
 */
function validateToneKeywords( words ) {

    // Variables
    let i = 0;
    let cleanWords = [];

    // Clean keywords (removing whitespace, newline characters, unwanted text, etc.)
    cleanWords = words.map(entry => entry.trim().replace(/^"|"$/g, ''));
    for (i; i < cleanWords.length; i++) {

        let cleanWord = cleanWords[i];
        let index = cleanWord.indexOf('"');
        if ( index != -1 ) {
            cleanWords[i] = cleanWord.substring(0, index);
        } // if
        
    } // for

    return cleanWords;

} // validateToneKeywords()

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

