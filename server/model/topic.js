/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

let Assessment = require( './assessment' );
let Activity = require( './activity' );

// import uuid generator
const { v4: uuidv4 } = require( "uuid" );

function topic() {
    this.topicId = uuidv4();
    this.topicType = 0;
    this.topicName = "";
    this.topicDescription = "";
    this.topicImage = "";
    this.topicHtml = "";
    this.assessmentId = -1;
    this.hasActivity = false;
    this.hasAssessment = false;
    this.activityId = -1;
    this.active = true;
    this.visibility = "private";
    this.createTime;
    this.ownedBy = -1;

    this.assessment = Assessment.emptyAssessment();
    this.activity = Activity.emptyActivity();
    this.resources = [];
    this.resourcesRequired = [];
}

exports.emptyTopic = () => {
    return new topic();
};

exports.ormTopic = function ( row ) {
    let topic = exports.emptyTopic();
    topic.topicId = row.topic_id; // TODO: Once database change goes through, this will need to be row.topicId;
    topic.topicType = row.topic_type;
    topic.topicName = row.topic_name;
    topic.topicDescription = row.topic_description;
    topic.topicImage = row.topic_image;
    topic.topicHtml = row.topic_html;
    topic.assessmentId = row.assessment_id;
    topic.hasActivity = row.has_activity;
    topic.hasAssessment = row.has_assessment;
    topic.activityId = row.activity_id;
    topic.active = row.active;
    topic.visibility = row.visibility;
    topic.createTime = row.create_time;
    topic.ownedBy = row.owned_by;
    topic.assessment = row.assessment;
    topic.activity = row.activity;
    topic.resources = row.resources;
    topic.resourcesRequired = row.resourcesRequired;
    return topic;
};