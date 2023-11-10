/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// dependencies


// models
const Workspace = require( '../model/workspace' );
const Topic = require( '../model/topic' );
const Resource = require( '../model/resource' );

// services
const workspaceService = require( '../service/workspaceService' );
const topicService = require( '../service/topicService' );
const resourceService = require( '../service/resourceService' );
const tagService = require( '../service/tagService' );

exports.getDashboard = async function ( req, res ) {

    //let workspaceId = req.params.workspaceId;

    // get all the shared workspaces for the user.
    let sharedWorkspaces = await workspaceService.getSharedWorkspaces( req.session.authUser.userId, false );

    // start the available topics out with the full owner topic set
    let availableTopics = [];

    // create an empty workspace to use if the user creates a new one
    let workspace = Workspace.emptyWorkspace();

    for ( let i = 0; i < sharedWorkspaces.length; i++ ) {
        // Get all topics Ids associated with our workspaceId.
        let topicsIds = await workspaceService.getAllTopicsIdsForWorkspace( sharedWorkspaces[i].workspaceRid );

        // Grab each topic by id and append it to our list of topics
        for ( let index in topicsIds ) {
            let topics = await topicService.getTopicById( topicsIds[index], sharedWorkspaces[i].ownedBy );

            if ( topics ) { // Ensure retrieval of topics
                sharedWorkspaces[i].topics.push( topics );
            }
            else {
                console.log( "Error retrieving resource " + topicsIds[index] + "\n" );
            }
        }

        // get all the tags for this workspace
        sharedWorkspaces[i].tags = await tagService.getTaggedEntity( 'workspace', sharedWorkspaces[i].workspaceId );

    }

    // create an empty topic to use if the user creates a new one
    let topic = Topic.emptyTopic();

    // get all the resources for this owner
    let availableResources = await resourceService.getAllActiveResourcesForOwner( sharedWorkspaces.ownedBy );

    let resource = Resource.emptyResource();

    const messageType = req.session.messageType;
    const messageTitle = req.session.messageTitle;
    const messageBody = req.session.messageBody;

    if ( req.session.messageType ) {
        delete req.session.messageType;
    }
    if ( req.session.messageTitle ) {
        delete req.session.messageTitle;
    }
    if ( req.session.messageBody ) {
        delete req.session.messageBody;
    }

    // if the user has shared workspaces
    if ( sharedWorkspaces  ) {
        res.render( 'dashboard-shared/dashboard-shared', { sharedWorkspaces: sharedWorkspaces, workspace: workspace, topic: topic, availableTopics: availableTopics, availableResources: availableResources, resource: resource, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }
    else {
        req.session.messageType = "warn";
        req.session.messageTitle = 'No workspaces';
        req.session.messageBody = 'You do not have any workspaces shared with you';
        res.render( 'dashboard-shared/dashboard-shared', { sharedWorkspaces: sharedWorkspaces, workspace: null, topic: topic, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }


};