/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

let Assessment = require( './assessment' );


function completedAssessment() {
    this.completedAssessmentId = -1;
    this.assessmentId = -1;
    this.userId = -1;
    this.topicAssessmentNumber = -1;
    this.percentageCorrect = .000;
    this.completionTime;
    this.createTime;

    // add the completed questions here
    this.completedQuestions = [];

    // object representation for the assessment tied to this completedAssessment
    this.assessment = Assessment.emptyAssessment();
}

exports.emptyCompletedAssessment = () => {
    return new completedAssessment();
};

exports.ormCompletedAssessment = function ( row ) {
    let completedAssessment = exports.emptyCompletedAssessment();
    completedAssessment.completedAssessmentId = row.completed_assessment_id;
    completedAssessment.assessmentId = row.assessment_id;
    completedAssessment.userId = row.user_id;
    completedAssessment.topicAssessmentNumber = row.topic_assessment_number;
    completedAssessment.percentageCorrect = row.percentage_correct;
    completedAssessment.completionTime = row.completion_time;
    completedAssessment.createTime = row.create_time;
    return completedAssessment;
};