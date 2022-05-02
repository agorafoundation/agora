/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const userService = require('../service/userService');
//const topicService = require('../service/topicService');
const goalService = require('../service/goalService');

exports.communityEventFeed = async function(limit) {
    
    // create a list to hold the events
    let eventList = [];

    // get the new user events
    let list1 = await userService.getRecentNewUserEvents(limit);

    // get recent enrollments
    let list2 = await goalService.getRecentGoalEnrollmentEvents(limit);

    // get recent goal completions
    let list3 = await goalService.getRecentGoalCompletionEvents(limit);

    // get recent supporters
    let list4 = await userService.getRecentSupportingMembers(limit);

    // put the lists together
    eventList = list1.concat(list2).concat(list3).concat(list4);

    // sort the events desc
    eventList.sort((a, b) => {
        return b.eventTime - a.eventTime;
    });

    return eventList;
}