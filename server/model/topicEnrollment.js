/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function topicEnrollment() {
    this.topicEnrollmentId = -1;
    this.topicId = -1;
    this.userId = -1;
    this.isIntroComplete = false;
    this.preCompletedAssessmentId = -1;
    this.postCompletedAssessmentId = -1;
    this.completedActivityId = -1;
    this.isCompleted = false;
    this.completedDate = null;
    this.active = true;
    this.createTime;
    this.updateTime;

    // put the topic object here for easy access to name, desc, img, etc
    this.topic = null;

    // create an object for each of the assessments
    this.preAssessment = null;
    this.postAssessment = null;

    // create an object for the activity
    this.completedActivity = null;
    
    // keep track of complete resources
    this.completedResources = [];
}

exports.emptyTopicEnrollment = () => {
    return new topicEnrollment();
};

exports.ormTopicEnrollment = function ( row ) {
    let topicEnrollment = exports.emptyTopicEnrollment();
    topicEnrollment.topicEnrollmentId = row.topic_enrollment_id;
    topicEnrollment.topicId = row.topic_id;
    topicEnrollment.userId = row.user_id;
    topicEnrollment.isIntroComplete = row.is_intro_complete;
    topicEnrollment.preCompletedAssessmentId = row.pre_completed_assessment_id;
    topicEnrollment.postCompletedAssessmentId = row.post_completed_assessment_id;
    topicEnrollment.completedActivityId = row.completed_activity_id;
    topicEnrollment.isCompleted = row.is_completed;
    topicEnrollment.active = row.active;
    topicEnrollment.createTime = row.create_time;
    topicEnrollment.updateTime = row.update_time;
    return topicEnrollment;
};