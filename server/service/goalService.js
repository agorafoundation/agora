/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require('../db/connection');

// import models
const User = require("../model/user");
const Goal = require("../model/goal");
const Topic = require("../model/topic");
const GoalEnrollment = require("../model/goalEnrollment");
const Event = require('../model/event');




/**
 * Retrieves all active goals with the highest version number
 * @returns All active goals as a list
 */
 exports.getAllAcitveGoals = async function() {
    const text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
    const values = [ true ];

    let goals = [];
    
    try {
         
        let res = await db.query(text, values);
        

        for(let i=0; i<res.rows.length; i++) {
            goals.push(Goal.ormGoal(res.rows[i]));
        }

        return goals;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}

/**
 * Retrieves all active goals created by a particular owner with the highest version number
 * @returns All active goals as a list
 */
 exports.getAllAcitveGoalsForOwner = async function(ownerId) {
    const text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version and gl.owned_by = $2 order by gl.id;";
    const values = [ true, ownerId ];

    let goals = [];
    
    try {
         
        let res = await db.query(text, values);
        

        for(let i=0; i<res.rows.length; i++) {
            goals.push(Goal.ormGoal(res.rows[i]));
        }

        return goals;
        
    }
    catch(e) {
        console.log(e.stack)
    }
    finally {
        
    }
}


/**
 * Returns all active goals including topics associated.
 * @returns List<goal> with topics
 */
exports.getAllActiveGoalsWithTopics = async function() {
    let text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
    let values = [ true ];

    let goals = [];
    
    try {
         
        let res = await db.query(text, values);
        for(let i=0; i<res.rows.length; i++) {
            text = "select * from goal_path where active = $1 and goal_id = $2 and goal_version = $3 order by position;";
            values = [ true, res.rows[i].id, res.rows[i].goal_version ];
            let topics = [];
            let res2 = await db.query(text, values);

            for(let j=0; j<res2.rowCount; j++) {
                text = "select * from topics where active = $1 and id = $2;";
                values = [ true, res2.rows[j].topic_id];

                let res3 = await db.query(text, values);
                if(res3.rows[0]) {
                    topics.push(Topic.ormTopic(res3.rows[0]));
                }
                
            }
            let goal = Goal.ormGoal(res.rows[i]);
            goal.topics = topics;
            
            goals.push(goal);
        }

        
        return goals;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}


/**
 * Get an active goal by id including associated topics
 * @param {Integer} goalId 
 * @returns goal with topics
 */
exports.getActiveGoalWithTopicsById = async function(goalId) {
    let text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 AND id = $2 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
    let values = [ true, goalId ];
    try {
        let goal = "";
         
        let res = await db.query(text, values);
        if(res.rowCount > 0) {
            text = "select * from goal_path where active = $1 and goal_id = $2 and goal_version = $3 order by position;";
            values = [ true, res.rows[0].id, res.rows[0].goal_version ];
            let topics = [];
            let res2 = await db.query(text, values);

            for(let j=0; j<res2.rowCount; j++) {
                text = "select * from topics where active = $1 and id = $2;";
                values = [ true, res2.rows[j].topic_id];

                let res3 = await db.query(text, values);
                if(res3.rowCount > 0) {
                    topics.push(Topic.ormTopic(res3.rows[0]));
                }
                
            }
            goal = Goal.ormGoal(res.rows[0]);
            goal.topics = topics;
               
        }
        return goal;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}

/**
 * Get the most recent version of an active goal by id
 * @param {Integer} goalId 
 * @returns goal
 */
 exports.getMostRecentActiveGoalById = async function(goalId) {
    let text = "select * from goals gl INNER JOIN (SELECT id, MAX(goal_version) AS max_version FROM goals where active = $1 AND id = $2 group by id) goalmax "
        + "on gl.id = goalmax.id AND gl.goal_version = goalmax.max_version order by gl.id;";
    let values = [ true, goalId ];
    try {
        let goal = "";
         
        let res = await db.query(text, values);
        let topics = [];
        if(res.rowCount > 0) {
            goal = Goal.ormGoal(res.rows[0]);
                  
        }
        goal.topics = topics;
        return goal;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}

/**
 * Saves a goal to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Goal} goal 
 * @returns Goal object with id 
 */
exports.saveGoal = async function(goal) {
    // check to see if an id exists - insert / update check
    if(goal) {
        if(goal.id > 0) {
            
            // update
            let text = "UPDATE goals SET goal_version = $1, goal_name = $2, goal_description = $3, goal_image = $4, active = $5, owned_by = $6 WHERE id = $7;";
            let values = [ goal.goalVersion, goal.goalName, goal.goalDescription, goal.goalImage, goal.active, goal.ownedBy, goal.id ];
    
            try {
                let res = await db.query(text, values);
            }
            catch(e) {
                console.log("[ERR]: Error updating goal - " + e);
                return false;
            }
            
        }
        else {
            // get the current max goal id
            let text = "select max(id) from goals;";
            let values = [];
            try {
                let res = await db.query(text, values);
                console.log("about to parse: " + res.rows[0].max + " which has a type of : " + typeof(res.rows[0].max));
                goal.id = res.rows[0].max; 
                goal.id++;
                if(res.rowCount > 0) {
                    // insert
                    text = "INSERT INTO goals (id, goal_version, goal_name, goal_description, goal_image, active, owned_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;";
                    values = [ goal.id, goal.goalVersion, goal.goalName, goal.goalDescription, goal.goalImage, goal.active, goal.ownedBy ];
                    
                    let res2 = await db.query(text, values);
        
                    if(res2.rows.rowCount > 0) {
                        goal.id = res.rows2[0].id;
                    }
                }
            }
            catch(e) {
                console.log("[ERR]: Error inserting goal - " + e);
                return false;
            }
            

            
        }
        return goal;
    }
    else {
        return false;
    }
}


/**
 * Add a user enrollment to the most recent version of a goal 
 * @param {Integer} userId id of user to enroll
 * @param {Integer} goalId id of goal
 * @returns true for successful operation or false if enrollment fails
 */
 exports.saveGoalEnrollmentMostRecentGoalVersion = async function(userId, goalId) {
    // get the most recent version of the goal
    let text = "SELECT MAX(goal_version) as version from goals where id = $1";
    let values = [ goalId ];

    try {
         
        let res = await db.query(text, values);
        
        if(res.rowCount > 0) {
            return exports.saveGoalEnrollment(userId, goalId, res.rows[0].version)
            
        }
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}

/**
 * Add a user enrollment to the specified version of a goal 
 * @param {Integer} userId id of user to enroll
 * @param {Integer} goalId id of goal (Goal identifier is id + version)
 * @param {Integer} goalVersion version of goal
 * @returns true for successful operation or false if enrollment fails
 */
 exports.saveGoalEnrollment = async function(userId, goalId, goalVersion) {
    // check this userId and goalId combination does not already exist
    text = "SELECT * FROM user_goal WHERE active = $1 AND user_id = $2 AND goal_id = $3 AND goal_version = $4";
    let values = [ true, userId, goalId, goalVersion ];

    try {
         
        let response = await db.query(text, values);

        if(!response.rowCount > 0) {       
            text = 'INSERT INTO user_goal(goal_id, goal_version, user_id, active)'
                + 'VALUES($1, $2, $3, $4)';
            values = [ goalId, goalVersion, userId, true ];

            let response = await db.query(text, values);
    
        }
        else {
            console.log("Duplicate user_goal not saved!!");
        }
        
        return true;
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}


/**
 * Get all goals that a user has an active enrollment in, returns the goal with the highest version number
 * if the user has more then one record for the same goal id.
 * @param {Integer} userId id of user enrolled
 * @returns List<goal> a list of the goal objects the user is enrolled in
 */
 exports.getActiveGoalEnrollmentsForUserId = async function(userId) {
    let text = "SELECT ug.* FROM user_goal ug INNER JOIN " 
        + "(SELECT user_id, goal_id, MAX(goal_version) AS max_version FROM user_goal where user_id = $2 and active = $1 GROUP BY user_id, goal_id) groupedug " 
        + " ON ug.user_id = groupedug.user_id AND ug.goal_id = groupedug.goal_id AND ug.goal_version = groupedug.max_version;";
    let values = [true, userId];
    
    let goals = [];
    try {
         
        let res = await db.query(text, values);
        
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                // get the goal for each user_goal
                text = "SELECT * FROM goals WHERE active = $1 AND id = $2 "
                values = [true, res.rows[i].goal_id];

                let res2 = await db.query(text, values);

                if(res2.rows.length > 0) {
                    goals.push(Goal.ormGoal(res2.rows[0]));
                }     
            }

        }
        else {
            
            return false;
        }
        
        return goals;
    }
    catch(e) {
        console.log(e.stack)
    }
}

exports.getRecentGoalEnrollmentEvents = async function(limit) {
    limit = (!limit) ? 10 : limit;
    let text = "select ud.id as user_id, ud.username as username, ud.profile_filename as user_image, mod.id as goal_id, mod.goal_name as goal_name, mod.goal_image as goal_image, mode.create_time as create_time from user_data ud, goals mod, user_goal mode where mode.user_id = ud.id AND mode.goal_id = mod.id and mode.active = true AND mod.active = true ORDER BY mode.create_time desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        
        let res = await db.query(text, values);
        
        let enrollmentEvents = [];
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].goal_id;
                event.eventItem = "Goal Enrollment";
                event.eventType = "Goal Enrollment";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a> Enrolled in <a href='/community/goal/" + res.rows[i].goal_id + "'>" + res.rows[i].goal_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].goal_image;
                enrollmentEvents.push(event);
            }
        }
        else {
            return false;
        }
        return enrollmentEvents;
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }  
}