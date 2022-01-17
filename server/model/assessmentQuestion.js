function assessmentQuestion() {
    this.id = -1;
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
}

exports.ormAssessmentQuestion = function (row) {
    let assessmentQuestion = exports.emptyAssessmentQuestion();
    assessmentQuestion.id = row.id;
    assessmentQuestion.assessmentId = row.assessment_id;
    assessmentQuestion.question = row.question;
    assessmentQuestion.isRequired = row.is_required;
    assessmentQuestion.correctOptionId = row.correct_option_id;
    assessmentQuestion.active = row.active;
    assessmentQuestion.createTime = row.create_time;
    return assessmentQuestion;
}