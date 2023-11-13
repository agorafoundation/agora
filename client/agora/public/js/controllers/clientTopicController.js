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


const topicModel = {
    topicId: null,
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

const getTopic = async( id ) => {
    console.log( "getTopic() id: " + id );
    const response = fetch( "api/v1/auth/topics/" + id, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    } );
    if( response.ok ) {
        const topic = await response.json();
        console.log( "getTopic() topic retrieved: " + JSON.stringify( topic ) );
        return topic;
    }

        
};

// retrieve the resources associated with a topic given the topic id
const getResourcesForTopic = async function ( topicId ) {
    console.log( "getResourcesForTopicId() : Start for topicId: " + topicId );
    const response = await fetch( "api/v1/auth/topics/resources/" + topicId );
    const data = await response.json();
    console.log( "getResourcesForTopicId() : complete - response: " + JSON.stringify( data ) );
    return data;
};

const saveTopic = async( topic, resourceIds ) => {
    console.log( "saveTopic() : Start" );

    // if passed, add the topicIds to the workspace object
    if( resourceIds ) {
        topic.resources = resourceIds;
    }

    const response = await fetch( "api/v1/auth/topics", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify( topic )
    } );

    if( response.ok ) {
        const data = await response.json();
        console.log( "saveTopic() : Topic created + repsonse: " + JSON.stringify( data ) );
        return data;
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

export { topicModel, getTopic, getResourcesForTopic, saveTopic };
