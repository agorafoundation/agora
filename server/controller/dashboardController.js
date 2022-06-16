/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies


// models
const Goal = require( '../model/goal' );
const Topic = require( '../model/topic' );
const Resource = require( '../model/resource' );

// services
const goalService = require( '../service/goalService' );
const topicService = require( '../service/topicService' );
const resourceService = require( '../service/resourceService' );

exports.getDashboard = async function( req, res ) {
    
    let goalId = req.params.goalId;

    // get all the goals for this owner
    let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false );

    // get all the topics for this owner
    let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.id, true );
    // start the available topics out with the full owner topic set
    let availableTopics = ownerTopics;

    // create an empty goal to use if the user creates a new one
    let goal = Goal.emptyGoal();

    if( goalId > 0 ) {
        goal = await goalService.getActiveGoalWithTopicsById( goalId, false );

        // iterate through the goals assigned topics, remove them from the available list
        for( let i=0; i < goal.topics.length; i++ ) {
            let redundantTopic = ownerTopics.map( ot => ot.id ).indexOf( goal.topics[i].id );
            
            ~redundantTopic && availableTopics.splice( redundantTopic, 1 );
        }

        // get the topics that are not currently assigned to this goal

    }
    else {
        goal.ownedBy = req.session.authUser.id;
        goal.goalVersion = 1;
    }

    // create an empty topic to use if the user creates a new one
    let topic = Topic.emptyTopic( );

    // get all the resources for this owner
    let availableResources = await resourceService.getAllActiveResourcesForOwner( req.session.authUser.id );
    
    let resource = Resource.emptyResource( );

    const messageType = req.session.messageType;
    const messageTitle = req.session.messageTitle;
    const messageBody = req.session.messageBody;

    if( req.session.messageType ) {
        delete req.session.messageType;
    }
    if( req.session.messageTitle ) {
        delete req.session.messageTitle;
    }
    if( req.session.messageBody ) {
        delete req.session.messageBody;
    }

    console.log("returning resources: " + JSON.stringify(availableResources));

    // make sure the user has access to this goal (is owner)
    if( goal.ownedBy === req.session.authUser.id ) {
        res.render( 'dashboard/dashboard', { ownerGoals: ownerGoals, goal: goal, ownerTopics: ownerTopics, topic: topic, availableTopics: availableTopics, availableResources: availableResources, resource: resource, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }
    else {
        req.session.messageType = "warn";
        req.session.messageTitle = 'Access Denied';
        req.session.messageBody = 'You do not have access to the requested resource';
        res.render( 'dashboard/dashboard', { ownerGoals: ownerGoals, goal: null, ownerTopics: ownerTopics, topic: topic, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }

    
}