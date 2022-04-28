/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function goal() {
    this.rid = -1;
    this.id = -1;
    this.goalVersion = 1;
    this.goalName = "";
    this.goalDescription = "";
    this.goalImage = "";
    this.active = true;
    this.completable = false;
    this.createTime;
    this.visibility = 2;
    this.ownedBy = -1;

    this.topics = [];
}

exports.emptyGoal = () => {
    return new goal();
}

exports.ormGoal = function (row) {
    let goal = exports.emptyGoal();
    goal.rid = row.rid;
    goal.id = row.id;
    goal.version = row.goal_version;
    goal.goalName = row.goal_name;
    goal.goalDescription = row.goal_description;
    goal.goalImage = row.goal_image;
    goal.active = row.active;
    goal.completable = row.completable;
    goal.createTime = row.create_time;
    goal.visibility = row.visibility;
    goal.ownedBy = row.owned_by;
    return goal;
}