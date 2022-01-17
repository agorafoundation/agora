/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function goal() {
    this.id = -1;
    this.version = 1;
    this.goalName = "";
    this.goalDescription = "";
    this.goalImage = "";
    this.active = true;
    this.createTime;

    this.topics = [];
}

exports.emptyGoal = () => {
    return new goal();
}

exports.ormGoal = function (row) {
    let goal = exports.emptyGoal();
    goal.id = row.id;
    goal.version = row.version;
    goal.goalName = row.goal_name;
    goal.goalDescription = row.goal_description;
    goal.goalImage = row.goal_image;
    goal.active = row.active;
    goal.createTime = row.create_time;
    return goal;
}