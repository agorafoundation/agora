/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function assessmentQuestionOption() {
    this.id = -1;
    this.assessmentQuestionId = -1;
    this.optionNumber = -1;
    this.optionAnswer = "";
    this.active = true;
    this.createTime;
}

exports.emptyAssessmentQuestionOption = () => {
    return new assessmentQuestionOption();
}

exports.ormAssessmentQuestionOption = function (row) {
    let assessmentQuestionOption = exports.emptyAssessmentQuestionOption();
    assessmentQuestionOption.id = row.id;
    assessmentQuestionOption.assessmentQuestionId = row.assessment_question_id;
    assessmentQuestionOption.optionNumber = row.option_number;
    assessmentQuestionOption.optionAnswer = row.option_answer;
    assessmentQuestionOption.active = row.active;
    assessmentQuestionOption.createTime = row.create_time;
    return assessmentQuestionOption;
}