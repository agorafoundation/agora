/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function activity() {
    this.activityId = -1;
    this.activityType = 1;
    this.activityName = "";
    this.activityDescription = "";
    this.activityHtml = "";
    this.isRequired = true;
    this.active = true;
    this.createTime;
}

exports.emptyActivity = () => {
    return new activity();
};

exports.ormActivity = function ( row ) {
    let activity = exports.emptyActivity();
    activity.activityId = row.activity_id;
    activity.activityType = row.activity_type;
    activity.activityName = row.activity_name;
    activity.activityDescription = row.activity_description;
    activity.activityHtml = row.activity_html;
    activity.isRequired = row.is_required;
    activity.active = row.active;
    activity.createTime = row.create_time;
    return activity;
};