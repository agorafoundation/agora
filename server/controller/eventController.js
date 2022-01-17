const userService = require('../service/userService');
//const topicService = require('../service/topicService');
const goalService = require('../service/goalService');

exports.communityEventFeed = async function(limit) {
    
    // create a list to hold the events
    let eventList = [];

    // get the new user events
    let list1 = await userService.getRecentNewUserEvents(limit);
    //let list2 = await topicService.getRecentTopicEnrollmentEvents(limit);
    let list2 = await goalService.getRecentGoalEnrollmentEvents(limit);

    // get new enrollment events
    eventList = list1.concat(list2);

    // sort the events desc
    eventList.sort((a, b) => {
        return b.eventTime - a.eventTime;
    })

    return eventList;
}