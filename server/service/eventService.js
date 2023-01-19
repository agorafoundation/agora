/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection

// import models


// any cross services required
const userService = require( '../service/userService' );
const workspaceService = require( '../service/workspaceService' );

exports.communityEventFeed = async function( limit ) {
    
    // create a list to hold the events
    let eventList = [];

    // get the new user events
    let list1 = await userService.getRecentnewUserEvents( limit );

    // get recent enrollments
    let list2 = await workspaceService.getRecentWorkspaceEnrollmentEvents( limit );

    // get recent workspace completions
    let list3 = await workspaceService.getRecentWorkspaceCompletionEvents( limit );

    // get recent supporters
    let list4 = await userService.getRecentSupportingMembers( limit );

    // put the lists together
    eventList = list1.concat( list2 ).concat( list3 ).concat( list4 );

    // sort the events desc
    eventList.sort( ( a, b ) => {
        return b.eventTime - a.eventTime;
    } );

    return eventList;
};