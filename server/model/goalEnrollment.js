function goalEnrollment() {
    this.id = -1;
    this.goalId = -1;
    this.goalVersion = -1;
    this.userId = -1;
    this.isCompleted = true;
    this.completedDate = null;
    this.active = true;
    this.createTime;
}

exports.emptyGoalEnrollment = () => {
    return new goalEnrollment();
}

exports.ormGoalEnrollment = function (row) {
    let goalEnrollment = exports.emptyGoalEnrollment();
    goalEnrollment.id = row.id;
    goalEnrollment.goalId = row.goal_id;
    goalEnrollment.goalVersion = row.goal_version;
    goalEnrollment.userId = row.user_id;
    goalEnrollment.isCompleted = row.is_completed;
    goalEnrollment.active = row.active;
    goalEnrollment.createTime = row.create_time;
    return goalEnrollment;
}