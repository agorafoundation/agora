/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function completedAssessment() {
    this.id = -1;
    this.assessmentId = -1;
    this.userId = -1;
    this.topicAssessmentNumber = -1;
    this.createTime;

    // add the completed questions here
    this.completedQuestions = [];
}

exports.emptyCompletedAssessment = () => {
    return new completedAssessment();
}

exports.ormCompletedAssessment = function (row) {
    let completedAssessment = exports.emptyCompletedAssessment();
    completedAssessment.id = row.id;
    completedAssessment.assessmentId = row.assessment_id;
    completedAssessment.userId = row.user_id;
    completedAssessment.topicAssessmentNumber = row.topic_assessment_number;
    completedAssessment.createTime = row.create_time;
    return completedAssessment;
}