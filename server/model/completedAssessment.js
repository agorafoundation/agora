function completedAssessment() {
    this.id = -1;
    this.assessmentId = -1;
    this.userId = -1;
    this.prePost = -1;
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
    completedAssessment.prePost = row.pre_post;
    completedAssessment.createTime = row.create_time;
    return completedAssessment;
}