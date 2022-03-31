/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function goalEnrollment() {
    this.id = -1;
    this.goalRid = -1;
    this.userId = -1;
    this.isCompleted = false;
    this.completedDate = null;
    this.active = true;
    this.createTime;

    // put the goal object here for easy access to name, desc, img, etc
    this.goal = null;
}

exports.emptyGoalEnrollment = () => {
    return new goalEnrollment();
}

exports.ormGoalEnrollment = function (row) {
    let goalEnrollment = exports.emptyGoalEnrollment();
    goalEnrollment.id = row.id;
    goalEnrollment.goalRid = row.goal_rid;
    goalEnrollment.goalVersion = row.goal_version;
    goalEnrollment.userId = row.user_id;
    goalEnrollment.isCompleted = row.is_completed;
    goalEnrollment.active = row.active;
    goalEnrollment.createTime = row.create_time;
    return goalEnrollment;
}