/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

let Assessment = require('./assessment');
let Activity = require('./activity');

function topic() {
    this.id = -1;
    this.topicName = "";
    this.topicDescription = "";
    this.topicImage = "";
    this.topicHtml = "";
    this.assessmentId = -1;
    this.activityId = -1;
    this.active = true;
    this.createTime;
    this.ownedBy = -1;

    this.assessment = Assessment.emptyAssessment();
    this.activity = Activity.emptyActivity();
    this.resources = [];
}

exports.emptyTopic = () => {
    return new topic();
}

exports.ormTopic = function (row) {
    let topic = exports.emptyTopic();
    topic.id = row.id;
    topic.topicName = row.topic_name;
    topic.topicDescription = row.topic_description;
    topic.topicImage = row.topic_image;
    topic.topicHtml = row.topic_html;
    topic.assessmentId = row.assessment_id;
    topic.activityId = row.activity_id;
    topic.active = row.active;
    topic.createTime = row.create_time;
    topic.ownedBy = row.owned_by;
    return topic;
}