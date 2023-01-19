/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function event() {
    this.eventItem = "";
    this.eventItemId = -1;
    this.eventType = "";
    this.eventUsername = "";
    this.eventUserId = -1;
    this.eventUserPrivate = false;  // TODO: STUB create a field in users that a user can use to disable public profile. This will make their name not a link if true
    this.eventTitle = "";
    this.eventDescription = "";
    this.eventImage = "";
    this.eventImage2 = "";
    this.eventLink = "";
    this.eventTime;
}

exports.emptyEvent = () => {
    return new event();
};

/*
 not stored currently
exports.ormEvent = function (row) {
    let event = exports.emptyEvent();
    
    return event;
}
*/
