/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function assessmentQuestion() {
    this.assessmentQuestionId = -1;
    this.assessmentId = -1;
    this.question = "";
    this.isRequired = true;
    this.correctOptionId = -1;
    this.active = true;
    this.createTime;

    // question options go here
    this.options = [];
}

exports.emptyAssessmentQuestion = () => {
    return new assessmentQuestion();
};

exports.ormAssessmentQuestion = function ( row ) {
    let assessmentQuestion = exports.emptyAssessmentQuestion();
    assessmentQuestion.assessmentQuestionId = row.assessment_question_id;
    assessmentQuestion.assessmentId = row.assessment_id;
    assessmentQuestion.question = row.question;
    assessmentQuestion.isRequired = row.is_required;
    assessmentQuestion.correctOptionId = row.correct_option_id;
    assessmentQuestion.active = row.active;
    assessmentQuestion.createTime = row.create_time;
    return assessmentQuestion;
};