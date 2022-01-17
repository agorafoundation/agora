function goalPath() {
    this.id = -1;
    this.goalId = -1;
    this.goalVersion = -1;
    this.topicId = -1;
    this.isRequired = true;
    this.active = true;
    this.createTime;
}

exports.emptyGoalPath = () => {
    return new goalPath();
}

exports.ormGoalPath = function (row) {
    let goalPath = exports.emptyGoalPath();
    goalPath.id = row.id;
    goalPath.goalId = row.goal_id;
    goalPath.goalVersion = row.goal_version;
    goalPath.topicId = row.topic_id;
    goalPath.isRequired = row.is_required;
    goalPath.active = row.active;
    goalPath.createTime = row.create_time;
    return goalPath;
}