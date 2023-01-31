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

exports.getDashboard = async function( req, res ) {
    
    let workspaceId = req.params.workspaceId;

    // get all the workspaces for this owner
    let ownerWorkspaces = await workspaceService.getAllWorkspacesForOwner( req.session.authUser.userId, false );
    // get all the topics for this owner
    let ownerTopics = await topicService.getAllTopicsForOwner( req.session.authUser.userId, true );
    // start the available topics out with the full owner topic set
    let availableTopics = ownerTopics;

    // create an empty workspace to use if the user creates a new one
    let workspace = Workspace.emptyWorkspace();

    for( let i =0; i < ownerWorkspaces.length; i++ ) {
        // Get all topics Ids associated with our workspaceId.
        let topicsIds = await workspaceService.getAllTopicsIdsForWorkspace( ownerWorkspaces[i].workspaceRid );
        
        // Grab each topic by id and append it to our list of topics
        for ( let index in topicsIds ) {
            let topics = await topicService.getTopicById( topicsIds[index], req.session.authUser.userId );

            if ( topics ){ // Ensure retrieval of topics
                ownerWorkspaces[i].topics.push( topics );
            }
            else {
                console.log( "Error retrieving resource " + topicsIds[index] + "\n" );
            }
        }

        // get all the tags for this workspace
        ownerWorkspaces[i].tags = await tagService.getTaggedEntity( 'workspace', ownerWorkspaces[i].workspaceId );    

    }
    if( workspaceId > 0 ) {
        workspace = await workspaceService.getActiveWorkspaceWithTopicsById( workspaceId, false );
        // iterate through the workspaces assigned topics, remove them from the available list
        for( let i=0; i < workspace.topics.length; i++ ) {
            let redundantTopic = ownerTopics.map( ot => ot.id ).indexOf( workspace.topics[i].id );
            
            ~redundantTopic && availableTopics.splice( redundantTopic, 1 );
        }

        // get the topics that are not currently assigned to this workspace

    }
    else {
        workspace.ownedBy = req.session.authUser.userId;
        workspace.workspaceVersion = 1;
    }

    // create an empty topic to use if the user creates a new one
    let topic = Topic.emptyTopic( );

    // get all the resources for this owner
    let availableResources = await resourceService.getAllActiveResourcesForOwner( req.session.authUser.userId );
    
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

    // make sure the user has access to this workspace (is owner)
    if( workspace.ownedBy === req.session.authUser.userId ) {
        res.render( 'dashboard/dashboard', { ownerWorkspaces: ownerWorkspaces, workspace: workspace, ownerTopics: ownerTopics, topic: topic, availableTopics: availableTopics, availableResources: availableResources, resource: resource, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }
    else {
        req.session.messageType = "warn";
        req.session.messageTitle = 'Access Denied';
        req.session.messageBody = 'You do not have access to the requested resource';
        res.render( 'dashboard/dashboard', { ownerWorkspaces: ownerWorkspaces, workspace: null, ownerTopics: ownerTopics, topic: topic, messageType: messageType, messageTitle: messageTitle, messageBody: messageBody } );
    }

    
};