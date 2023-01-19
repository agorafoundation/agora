/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function assessment() {
    this.assessmentId = -1;
    this.assessmentType = -1;
    this.assessmentName = "";
    this.assessmentDescription = "";
    this.preThreshold = 90;             // default value that if acheived in pre assessment allows a student to "test-out" of topic
    this.postThreshold = 70;            // default value that if acheived in post assessment means a user can "move-on" from a topic
    this.isRequired = "";               // boolean in DB, but leaving as string for now
    this.active = true;
    this.createTime;

    // questions go here
    this.questions = [];

    // completed assessments (by userId) must only be used for the current user! 
    // and of course this assessmentId (pre and post mean more then one often, hense the array)
    // TODO: impletement this, in getTopicWithEverythingById? other places?
    this.completedAssessments = [];

}

exports.emptyAssessment = () => {
    return new assessment();
};

exports.ormAssessment = function ( row ) {
    let assessment = exports.emptyAssessment();
    assessment.assessmentId = row.assessment_id;
    assessment.assessmentType = row.assessment_type;
    assessment.assessmentName = row.assessment_name;
    assessment.assessmentDescription = row.assessment_description;
    assessment.preThreshold = row.pre_threshold;
    assessment.postThreshold = row.post_threshold;
    assessment.isRequired = row.is_required;
    assessment.active = row.active;
    assessment.createTime = row.create_time;
    return assessment;
};