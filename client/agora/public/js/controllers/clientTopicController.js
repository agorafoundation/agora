/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

/**
 * Client Side controller for Topics
 * Contains the client side data model and API calls to maintain it.
 */

// import debug
import { debug, dataDebug } from "../state/stateManager.js";
import { uuidv4 } from "../util/editorUtil.js";


function createNewTopic() {
    return {
        topicId: uuidv4(),
        topicType: 0,
        topicName: "",
        topicDescription: "",
        topicImage: "",
        topicHtml: "",
        assessmentId: -1,
        hasActivity: false,
        hasAssessment: false,
        activityId: -1,
        active: true,
        visibility: "private",
        createTime: null,
        ownedBy: -1,
        assessment: null,
        activity: null,
        resources: [],
        resourcesRequired: []
    };
}

const getTopic = async( id ) => {
    ( debug ) ? console.log( "getTopic() : Start - id: " + id ) : null;
    const response = fetch( "api/v1/auth/topics/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );
    if( response.ok ) {
        const topic = await response.json();
        ( debug && dataDebug ) ? console.log( "getTopic() topic retrieved: " + JSON.stringify( topic ) ) : null;
        ( debug ) ? console.log( "getTopic() : Complete" ) : null;
        return topic;
    }

        
};

// retrieve the resources associated with a topic given the topic id
const getResourcesForTopic = async function ( topicId ) {
    ( debug ) ? console.log( "getResourcesForTopicId() : Start for topicId: " + topicId ) : null;
    const response = await fetch( "api/v1/auth/topics/resources/" + topicId, { 
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );
    
    if( response.ok ){
        const data = await response.json();
        ( debug && dataDebug ) ? console.log( "getResourcesForTopicId() : complete - response: " + JSON.stringify( data ) ) : null;
        ( debug ) ? console.log( "getResourcesForTopicId() : Complete" ) : null;
        return data.results;
    }
};

// retrieve the shared resources associated with a shared topic
const getSharedResourcesForTopic = async function ( topicId ) {
    ( debug ) ? console.log( "getSharedResourcesForTopicId() : Start for topicId: " + topicId ) : null;
    const response = await fetch( "api/v1/auth/topics/resources/shared/" + topicId, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ){
        const data = await response.json();
        ( debug && dataDebug ) ? console.log( "getSharedResourcesForTopicId() : complete - response: " + JSON.stringify( data ) ) : null;
        ( debug ) ? console.log( "getSharedResourcesForTopicId() : Complete" ) : null;
        return data.results;
    }
};

const saveTopic = async( topic ) => {
    ( debug ) ? console.log( "saveTopic() : Start for topic -  " + topic.topicId ) : null;
    if( topic ) {
        // prepare the topics as an array of uuids
        let resourceUuids = [];
        if( topic.resources ) {
            topic.resources.forEach( resource => {
                resourceUuids.push( resource.resourceId );
            } );
        }

        const response = await fetch( "api/v1/auth/topics", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify( {
                "topicId": topic.topicId ? topic.topicId : null,
                "topicType": topic.topicType,
                "topicName": topic.topicName,
                "topicDescription": topic.topicDescription,
                "topicHtml": topic.topicHtml,
                "assessmentId": 1,
                "hasActivity": ( topic.hasActivity ? topic.hasActivity : false ),
                "hasAssessment": ( topic.hasAssessment ? topic.hasAssessment : false ),
                "activityId": ( topic.activityId ? topic.activityId : -1 ),
                "active": ( topic.active ? topic.active : true ),
                "visibility": topic.visibility ? topic.visibility : "private",
                "resources": resourceUuids ? resourceUuids : []
            } )
        } );

        if( response.ok ) {
            const data = await response.json();
            ( debug && dataDebug ) ? console.log( "saveTopic() : Topic created + repsonse: " + JSON.stringify( data ) ) : null;
            ( debug ) ? console.log( "saveTopic() : Complete" ) : null;
            return data;
        }
    }

    

    // console.log( "contents of the resources array: " + JSON.stringify( resources ) );
    // const response = await fetch( "api/v1/auth/topics", {
    //     method: "POST",
    //     headers: {'Content-Type': 'application/json'},
    //     body: JSON.stringify( {
    //         "topicType": 0,
    //         "topicName": topicName,
    //         "topicDescription": "",
    //         "topicHtml": "",
    //         "assessmentId": 1,
    //         "hasActivity": false,
    //         "hasAssessment": false,
    //         "activityId": -1,
    //         "active": true,
    //         "visibility": "private",
    //         "resources": resources ? resources : []
    //     } )
    // } );

    // if( response.ok ) {
    //     const data = await response.json();
    //     //console.log( "createTopic() topic saved " );
    //     // map the resulting topic id to the value used in topic elements
    //     topics[numTopics] = data.topicId;

    //     //console.log( topics );
    //     await saveWorkspace( topics );
    //     console.log( "saveTopic() : Complete" );
    //     return data;
    // }
};

const deleteTopic = async function ( topicId ) {
    ( debug ) ? console.log( "deleteTopic() : Start for topicId: " + topicId ) : null;
    const response = await fetch( "api/v1/auth/topics/" + topicId, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
    } );

    if( response.ok ) {
        const data = await response.json();
        ( debug && dataDebug ) ? console.log( "deleteTopic() : Topic and resources deleted: " + JSON.stringify( data ) ) : null;
        ( debug ) ? console.log( "deleteTopic() : Complete" ) : null;
        return data;
    }
};

export { createNewTopic, getTopic, getResourcesForTopic, getSharedResourcesForTopic, saveTopic, deleteTopic };
