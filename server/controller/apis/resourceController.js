/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// import services
const topicService = require( '../service/topicService' );

// import models
const CompletedResource = require( '../model/completedResource' );


/**
 * Update or create a completed resource for the resource Id passed.
 * Checks to see if there is an existing completedResource with the passed resourceId and
 * updates if so, otherwise creates a new completedResource and saves
 * @param {HTTP Request} req // body contains resourceId, status, submittedText
 * @param {HTTP Response} res 
 */
exports.saveCompletedResource = async function( req, res ) {
    let resourceId = req.body.resourceId;
    let status = req.body.status;
    let submittedText = req.body.submittedText;

    if( req.session.currentTopic && req.session.authUser ) {
        // call service?
        let completedResource = await topicService.getCompletedResourceByResourceAndUserId( resourceId, req.session.authUser.id );
        if( !completedResource ) {
            completedResource = CompletedResource.emptyCompletedResource( );
            completedResource.userId = req.session.authUser.id;
            completedResource.resourceId = resourceId;
        }
        completedResource.active = status;
        completedResource.submissionText = submittedText;

        // save the completedResource
        let completeResource = await topicService.saveCompletedResourceStatus( completedResource );

        // update the session
        let replaced = false;
        if( req.session.currentTopic.completedResources.length > 0 && completeResource.id > 0 ) {
            for( let i=0; i < req.session.currentTopic.completedResources.length; i++ ) {
                if( req.session.currentTopic.completedResources[ i ].id == completeResource.id ) {
                    req.session.currentTopic.completedResources[ i ] = completeResource;
                    replaced = true;
                    break;
                }
            }
        }
        if ( !replaced ) {
            req.session.currentTopic.completedResources.push( completeResource );
        }
    }

    res.send();
}