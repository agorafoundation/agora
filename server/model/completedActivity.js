/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function completedActivity() {
    this.completedActivityId = -1;
    this.activityId = -1;
    this.userId = -1;
    this.submissionText = "";
    this.createTime;
    this.updateTime;
}

exports.emptyCompletedActivity = () => {
    return new completedActivity();
};

exports.ormCompletedActivity = function ( row ) {
    let completedActivity = exports.emptyCompletedActivity();
    completedActivity.completedActivityId = row.completed_activity_id;
    completedActivity.activityId = row.activity_id;
    completedActivity.userId = row.user_id;
    completedActivity.submissionText = row.submission_text;
    completedActivity.createTime = row.create_time;
    completedActivity.updateTime = row.update_time;
    return completedActivity;
};