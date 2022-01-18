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
const Topic = require("../model/topic");
const TopicEnrollment = require("../model/topicEnrollment");
const Event = require('../model/event');
const Assessment = require('../model/assessment');
const AssessmentQuestion = require('../model/assessmentQuestion');
const AssessmentQuestionOption = require('../model/assessmentQuestionOption');
const Activity = require('../model/activity');
const Resource = require('../model/resource');
const CompletedAssessment = require('../model/completedAssessment');
const CompletedAssessmentQuestion = require('../model/completedAssessmentQuestion');
const CompletedActivity = require('../model/completedActivity');
const CompletedResource = require('../model/completedResource');

// any cross services required
const userService = require('../service/userService');
const res = require('express/lib/response');



/**
 * Verifies whether or not a user currently has access to a topic
 * @param {Integer} userId 
 * @param {Integer} topicId 
 * @returns true if the user has access, false if not.
 */
 exports.verifyTopicAccess = async function(userId, topicId) {
    // get current user enrollments
    let enrollments = await exports.getActiveEnrolledTopicsForUserId(userId);
    // see if our topic is in the set
    if(enrollments && enrollments.filter(enrollment => enrollment.id == topicId).length > 0) {
        // user is enrolled 
        return true;
    }
    else {
        return false;
    }
}

exports.enrollUserWithMembershipOrToken = async function(userWithRoles, topicId) {
    // first double check they do not already have access
    if(!await exports.verifyTopicAccess(userWithRoles.id, topicId)) {
        // check to see if the user has membership
        if(userWithRoles.member) {
            // add enrollment via membership
            let te = TopicEnrollment.emptyTopicEnrollment();
            te.userId = userWithRoles.id;
            te.topicId = topicId;
            exports.saveTopicEnrollment(te);
            
            return true;
        }
        else {
            // check if the user has a token
            if(userWithRoles.availableAccessTokens > 0) {
                // use the token to create the enrollment
                let te = TopicEnrollment.emptyTopicEnrollment();
                te.userId = userWithRoles.id;
                te.topicId = topicId;
                exports.saveTopicEnrollment(te);
                // decrement the users tokens
                await userService.useAccessTokensById(userWithRoles.id, 1);

                return true;
            }
            else {
                // user did not have membership or a token, sorry!
                return false;
            }
        }
    }
    else {
        // they already had access!
        console.log("[INFO]: User already had access to the topic")
        return false;
    }
}


/**
 * This is the authorative source on which roles qualify for user membership.  Currently Administrators and Founders.
 * @param {User (built by session creation)} userWithRoles 
 * @returns 
 */
exports.verifyUserHasMembershipAccessRole = async function(userWithRoles) {
    if(userWithRoles && userWithRoles.roles && userWithRoles.roles.length > 0 && userWithRoles.roles.filter(role => role.roleName == "Administrator" || role.roleName == "Founder").length > 0) {
        return true;
    }
    else {
        return false;
    }

}



/**
 * Retrieves all active topic 
 * @returns All active topics as a list
 */
 exports.getAllAcitveTopics = async function() {
    const text = "SELECT * FROM topics WHERE active = $1";
    const values = [ true ];

    let topics = [];
    
    try {
        const client = await db().connect();
        let res = await client.query(text, values);
        client.release();

        for(let i=0; i<res.rows.length; i++) {
            topics.push(Topic.ormTopic(res.rows[i]));
        }

        return topics;
        
    }
    catch(e) {
        console.log(e.stack)
    }
}

/**
 * Gets an active topic by topic Id with all resources, activity and assessments attached
 * @param {Integer} topicId 
 * @returns Topic
 */
exports.getActiveTopicWithEverythingById = async function(topicId) {
    let text = "SELECT * FROM topics WHERE active = $1 AND id = $2";
    let values = [ true, topicId ];
    
    try {
        const client = await db().connect();
        let res = await client.query(text, values);
        let topic = null;
        
        if(res.rowCount > 0) {
            let topic = Topic.ormTopic(res.rows[0]);

            // get the assessment
            if(topic.assessmentId > 0) {
                text = "SELECT * from assessments where id = $1 and active = $2";
                values = [ topic.assessmentId, true ];
                let res2 = await client.query(text, values);

                if(res2.rowCount > 0) {
                    // model it
                    assessment = Assessment.ormAssessment(res2.rows[0]);
                    //console.log("assessment object: " + JSON.stringify(assessment))
                    // populate the questions for the assessment
                    text = "SELECT * from assessment_question where assessment_id = $1 and active = $2";
                    values = [ assessment.id, true ];
                    let res3 = await client.query(text, values);

                    // attach the questions
                    for(let i=0; i < res3.rowCount; i++) {
                        let question = AssessmentQuestion.ormAssessmentQuestion(res3.rows[i]);

                        // populate the options for each question
                        text = "SELECT * from assessment_question_option where assessment_question_id = $1 and active = $2 ORDER BY option_number asc";
                        values = [ question.id, true ];
                        let res4 = await client.query(text, values);

                        for(let j=0; j < res4.rowCount; j++) {
                            let option = AssessmentQuestionOption.ormAssessmentQuestionOption(res4.rows[j]);
                            question.options.push(option);
                        }
                        assessment.questions.push(question);
                    }
                    topic.assessment = assessment;

                }

            }

            // get the activity_id
            if(topic.activityId > 0) {
                text = "SELECT * from activities where id = $1 and active = $2";
                values = [ topic.activityId, true ];
                let res5 = await client.query(text, values);

                if(res5.rowCount > 0) {
                    // model it
                    topic.activity = Activity.ormActivity(res5.rows[0]);
                }

            }

            // get the resources
            text = "SELECT * from resources where topic_id = $1 and active = $2";
            values = [ topic.id, true ];
            let res6 = await client.query(text, values);
            let resources = [];
            for(let i=0; i < res6.rowCount; i++) {
                resources.push(Resource.ormResource(res6.rows[i]));
            }
            topic.resources = resources;

            console.log("------------------------");
            console.log("Full Topic: " + JSON.stringify(topic));
            console.log("------------------------");
            return topic;
            client.release();
        }
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}

/**
 * The motherload. Returns everything releated to the users enrollment, completed items, and if getFullTopic is passed as true
 * it also returns the topic with all of its supporting data as well. (IMPORTANT!! You will want to do this as the topic data
 * is required to save the record and will be looked for there, only pass false for getFullTopic if you are looking up the 
 * enrollment record with no intent to edit / resave)
 * @param {Integer} userId Id of user
 * @param {Integer} topicId Id of topic
 * @param {Boolean} getFullTopic True if you wish the returned TopicEnrollment.topic to be populated 
 *                               along with all supporting data (calls getActiveTopicWithEverythingById())
 * @returns TopicEnrollment with supporting data
 */
exports.getActiveTopicEnrollmentsByUserAndTopicIdWithEverything = async function(userId, topicId, getFullTopic) {
    let text = "SELECT * FROM user_topic WHERE active = $1 AND user_id = $2 AND topic_id = $3";
    let values = [ true, userId, topicId ];
    let topicEnrollment = null;
    try {
        const client = await db().connect(); 
        let res = await client.query(text, values);
        if(res.rowCount > 0) {
            topicEnrollment = TopicEnrollment.ormTopicEnrollment(res.rows[0]);

            // get the full topic?
            if(getFullTopic) {
                topicEnrollment.topic = await exports.getActiveTopicWithEverythingById(topicEnrollment.topicId);
            }
            // get the completed pre assessment
            if(topicEnrollment.preCompletedAssessmentId > 0) {
                text = "SELECT * from completed_assessment where id = $1 AND pre_post = $2 AND active = $3";
                values = [ topicEnrollment.preCompletedAssessmentId, 1, true ];
                let res2 = await client.query(text, values);

                if(res2.rowCount > 0) {
                    topicEnrollment.preAssessment = CompletedAssessment.ormCompletedAssessment(res2.rows[0]);

                    // get the completed questions to attach to the completed assessment
                    text = "SELECT * from completed_assessment_question where completed_assessment_id = $1 and active = $2";
                    values = [ topicEnrollment.preAssessment.id, true ];
                    let res3 = await client.query(text, values);
                    // attach the completed questions
                    for(let i=0; i < res3.rowCount; i++) {
                        let question = CompletedAssessmentQuestion.ormCompletedAssessmentQuestion(res3.rows[i]);

                        topicEnrollment.preAssessment.completedQuestions.push(question);
                    }
                }
            }
            
            // get the post assessment
            if(topicEnrollment.postCompletedAssessmentId > 0) {
                text = "SELECT * from completed_assessment where id = $1 AND pre_post = $2 AND active = $3";
                values = [ topicEnrollment.postCompletedAssessmentId, 2, true ];
                let res3 = await client.query(text, values);
                if(res3.rowCount > 0) {
                    topicEnrollment.postAssessment = CompletedAssessment.ormCompletedAssessment(res3.rows[0]);

                    // get the completed questions to attach to the completed assessment
                    text = "SELECT * from completed_assessment_question where completed_assessment_id = $1 and active = $2";
                    values = [ topicEnrollment.postAssessment.id, true ];
                    let res4 = await client.query(text, values);
                    // attach the completed questions
                    for(let i=0; i < res4.rowCount; i++) {
                        let question = CompletedAssessmentQuestion.ormCompletedAssessmentQuestion(res4.rows[i]);

                        topicEnrollment.postAssessment.completedQuestions.push(question);
                    }
                }
            }

            // get the completed activity
            if(topicEnrollment.completedActivityId > 0) {
                text = "SELECT * from completed_activity where id = $1 and active = $2";
                values = [ topicEnrollment.completedActivityId, true ];
                let res5 = await client.query(text, values);
                if(res5.rowCount > 0) {
                    // model it
                    topicEnrollment.completedActivity = CompletedActivity.ormCompletedActivity(res5.rows[0]);
                }
            }

            // get the completed resources, completed resources are queried by their corrosponding resource id so we 
            // have to get the resources first then iterate through them
            text = "SELECT * from resources where topic_id = $1 and active = $2";
            values = [ topicEnrollment.topicId, true ];
            let res6 = await client.query(text, values);
            //let resources = [];
            for(let i=0; i < res6.rowCount; i++) {
                console.log("check 1 : " + res6.rowCount + " this is " + res6.rows[i].id);
                //resources.push(Resource.ormResource(res6.rows[i]));
                text = "SELECT * from completed_resource where resource_id = $1 AND user_id = $2 and active = $3";
                values = [ res6.rows[i].id, topicEnrollment.userId, true ];
                let res7 = await client.query(text, values);

                //let completedResources = [];
                for(let i=0; i < res7.rowCount; i++) {
                    topicEnrollment.completedResources.push(CompletedResource.ormCompletedResource(res7.rows[i]));
                }
            }
        }
        else {
            // no record
            client.release();
            return false;
        }

        // success?  of course! release the pool!
        client.release();
        console.log("------------------------");
        console.log("Full TopicEnrollment: " + JSON.stringify(topicEnrollment));
        console.log("------------------------");
        return topicEnrollment;
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}


/**
 * Saves the users topic enrollment and all associated information such as completed assessments, activity and resources
 * You MUST pass the completely populated TopicEnrollment object with associated .topic and all completed objects populated 
 * from a call like getActiveTopicEnrollmentsByUserAndTopicIdWithEverything with getFullTopic set to true.
 * Note: this method will either update or insert any object based on whether or not there is an existing id associtated with
 * the object when passed in.  After saving this method will assign any new ids to the proper place for association.
 * @param {TopicEnrollment (with everything!)} topicEnrollment 
 * @returns the saved TopicEnrollment with ids.
 */
exports.saveTopicEnrollmentWithEverything = async function(topicEnrollment) {
    
    // is completed flag is used to cleanly set the completed_date field either null or with the current time
    let currentTime = null;
    let text = "";
    let values = [];
    if(topicEnrollment.isCompleted) {
        currentTime = Date.now();
    }

    try {

        const client = await db().connect();

        // save pre assessment data
        if(topicEnrollment.preAssessment && topicEnrollment.topic && topicEnrollment.topic.assessment) {
            // check that this assessment does not already exist, we only save assessments once! An id will not be
            // assigned if the data has not been save previously
            if(topicEnrollment.preCompletedAssessmentId > 0) {
                console.log("[INFO]: Completed Pre Assessment row already exists! enrollement data: " + topicEnrollment.id);
            }
            else {
                text = "INSERT INTO completed_assessment (assessment_id, user_id, pre_post) VALUES ($1, $2, $3) RETURNING id;"
                values = [ topicEnrollment.topic.assessment.id, topicEnrollment.userId, 1 ];

                let res = await client.query(text, values);
                // last step, update the fk in topicEnrollment!
                if(res.rowCount > 0) {
                    topicEnrollment.preCompletedAssessmentId = res.rows[0].id;
                    topicEnrollment.preAssessment.id = res.rows[0].id;
                    console.log("[DEBUG]: Checking that the fk is being added for the assessmentId you should see this if it is working it can be REMOVED! id: " + topicEnrollment.preCompletedAssessmentId);
                }
            }
        }
        else {
            // missing assessment data, not able to save
            //console.log("[WARN]: Completed pre assessment data missing, not able to save - TopicEnrollment: " + JSON.stringify(topicEnrollment));
        }

        // save post assessment data
        if(topicEnrollment.postAssessment && topicEnrollment.topic && topicEnrollment.topic.assessment) {
            // check that this assessment does not already exist, we only save assessments once! An id will not be
            // assigned if the data has not been save previously
            if(topicEnrollment.postCompletedAssessmentId > 0) {
                console.log("[INFO]: Completed Post Assessment row already exists! enrollement data: " + topicEnrollment.id);
            }
            else {
                text = "INSERT INTO completed_assessment (assessment_id, user_id, pre_post) VALUES ($1, $2, $3) RETURNING id;"
                values = [ topicEnrollment.topic.assessment.id, topicEnrollment.userId, 2 ];

                let res = await client.query(text, values);

                // last step, update the fk in topicEnrollment!
                if(res.rowCount > 0) {
                    topicEnrollment.postCompletedAssessmentId = res.rows[0].id;
                    topicEnrollment.postAssessment.id = res.rows[0].id;
                    console.log("[DEBUG]: Checking that the fk is being added for the assessmentId you should see this if it is working it can be REMOVED! id: " + topicEnrollment.postCompletedAssessmentId);
                }
            }
        }
        else {
            // missing assessment data, not able to save
            //console.log("[WARN]: Completed post assessment data missing, not able to save - TopicEnrollment: " + JSON.stringify(topicEnrollment));
        }

        // save activity data
        if(topicEnrollment.completedActivity && topicEnrollment.topic && topicEnrollment.topic.activity) {
            console.log("pre flight 1");
            // check that this activity does not already exist
            // Activities can be updated
            if(topicEnrollment.completedActivityId > 0) {
                console.log("pre flight 2");
                // update to existing completed_activity
                text = "UPDATE completed_activity SET submission_text = $1, active = $2, update_time = NOW() WHERE id = $3;"
                values = [ topicEnrollment.completedActivity.submissionText, topicEnrollment.completedActivity.active, topicEnrollment.completedActivityId ];

                let res = await client.query(text, values);

                //console.log("[INFO]: Completed Post Assessment row already exists! enrollement data: " + topicEnrollment.id);
            }
            else {
                console.log("pre flight 3");
                text = "INSERT INTO completed_activity (activity_id, user_id, submission_text, active) VALUES ($1, $2, $3, $4) RETURNING id;"
                values = [ topicEnrollment.topic.activity.id, topicEnrollment.userId, topicEnrollment.completedActivity.submissionText, topicEnrollment.completedActivity.active ];

                let res = await client.query(text, values);

                // last step, update the fk in topicEnrollment!
                if(res.rowCount > 0) {
                    topicEnrollment.completedActivity.id = res.rows[0].id;
                    topicEnrollment.completedActivityId = res.rows[0].id;
                    console.log("[DEBUG]: Checking that the fk is being added for the activityId you should see this if it is working it can be REMOVED! id: " + topicEnrollment.completedActivityId);
                }
            }
            console.log("pre flight 4");
        }
        else {
            // missing assessment data, not able to save
            //console.log("[WARN]: Completed activity data missing, not able to save - TopicEnrollment: " + JSON.stringify(topicEnrollment));
        }

        // save completed resources
        if(topicEnrollment.completedResources && topicEnrollment.completedResources.length > 0 && topicEnrollment.topic && topicEnrollment.topic.resources && topicEnrollment.topic.resources.length > 0) {
            // iterate through the completed resources and save
            for(let i=0; i < topicEnrollment.completedResources.length; i++) {
                let resource = null;
                // verify and retrieve the matching resource attached to the topic
                for(let j=0; j < topicEnrollment.topic.resources.length; j++) {
                    if(topicEnrollment.topic.resources[j].id === topicEnrollment.completedResources[i].resourceId) {
                        resource = topicEnrollment.topic.resources[j];
                    }
                }
                // we must have a resource to attach the completed resource to
                if(resource) {
                    // check to see if this completed resource already has a record to update or is new
                    if(topicEnrollment.completedResources[i].id > 0) {
                        // update
                        text = "UPDATE completed_resource SET submission_text = $1, update_time = NOW() WHERE id = $2;";
                        values = [ topicEnrollment.completedResources[i].submissionText, topicEnrollment.completedResources[i].id];

                        let res = await client.query(text, values);
                    }
                    else {
                        // insert
                        text = "INSERT INTO completed_resource (resource_id, user_id, submission_text ) VALUES ( $1, $2, $3 );";
                        values = [ resource.id, topicEnrollment.userId, topicEnrollment.completedResources[i].submissionText ];

                        let res = await client.query(text, values);
                    }
                }
                else {
                    console.log("[WARN]: Resource matching completed resource not available, not able to save - TopicEnrollment: " + JSON.stringify(topicEnrollment));
                }   
            }
        }
        else {
            // missing assessment data, not able to save
            //console.log("[WARN]: Completed resources data missing, not able to save - TopicEnrollment: " + JSON.stringify(topicEnrollment));
        }

        // now that we have saved all the supporting data and assigned any new id's to there foreign keys we can save the topicEnrollement itself
        // first see if we are doing an udpate or insert based on whether we have an id already.
        if(topicEnrollment && topicEnrollment.id > 0) {
            // UPDATE
            text = "UPDATE user_topic SET is_intro_complete = $1, pre_completed_assessment_id = $2, post_completed_assessment_id = $3, completed_activity_id = $4, is_completed = $5, completed_date = $6, active = $7, update_time = NOW() WHERE id = $8;";
            values = [ topicEnrollment.isIntroComplete, topicEnrollment.preCompletedAssessmentId, topicEnrollment.postCompletedAssessmentId, topicEnrollment.completedActivityId, topicEnrollment.isCompleted, currentTime, topicEnrollment.active, topicEnrollment.id ];
            try { 
                let res = await client.query(text, values);

            }
            catch(e) {
                console.log(e.stack);
                return false;
            }

        }
        else {
            // INSERT 
            text = "INSERT INTO user_topic (topic_id, user_id, is_intro_complete, pre_completed_assessment_id, post_completed_assessment_id, completed_activity_id, is_completed, completed_date, active ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8, $9 ) RETURNING id;";
            values = [ topicEnrollment.topicId, topicEnrollment.userId, topicEnrollment.isIntroComplete, topicEnrollment.preCompletedAssessmentId, topicEnrollment.postCompletedAssessmentId, topicEnrollment.completedActivityId, topicEnrollment.isCompleted, currentTime, true ];

            let res = await client.query(text, values);

            // last step, update the topicEnrollment id!
            if(res.rowCount > 0) {
                topicEnrollment.id = res.rows[0].id;
            }
        }

        client.release();
        return topicEnrollment;

    }
    catch(e) {
        console.log(e.stack);
        client.release();
        return false;
    }
}

/**
 * Add a user enrollment in a topic 
 * This is assumed to be a new (INSERT) topic enrollment! (no updates, see with everything function for that!)
 * Creates an empty user_topic record with all progress flags unset.
 * @param {Integer} userId id of user to enroll
 * @param {Integer} topicId id of topic
 * @returns true for successful operation or false if enrollment fails
 */
 exports.saveTopicEnrollment = async function(topicEnrollment) {
    // check this userId and topicId combination does not already exist
    let text = "SELECT * FROM user_topic WHERE active = $1 AND user_id = $2 AND topic_id = $3";
    let values = [ true, topicEnrollment.userId, topicEnrollment.topicId ];

    try {
        const client = await db().connect(); 
        let response = await client.query(text, values);
        if(!response.rowCount > 0) {
            text = "INSERT INTO user_topic (topic_id, user_id, is_intro_complete, pre_completed_assessment_id, post_completed_assessment_id, completed_activity_id, is_completed, active ) VALUES ( $1, $2, $3, $4, $5, $6, $7, $8 );";
            values = [ topicEnrollment.topicId, topicEnrollment.userId, topicEnrollment.isIntroComplete, topicEnrollment.preCompletedAssessmentId, topicEnrollment.postCompletedAssessmentId, topicEnrollment.completedActivityId, topicEnrollment.isCompleted, true ];

            let response = await client.query(text, values);
        }
        else {
            console.log("Duplicate enrollment not saved!!");
        }
        client.release();
        return true;
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}


exports.getCompletedResourceByResourceAndUserId = async function(resourceId, userId) {
    let text = "SELECT * FROM completed_resource WHERE resource_id = $1 AND user_id = $2;";
    let values = [ resourceId, userId ];

    try {
        const client = await db().connect(); 
        let res = await client.query(text, values);

        client.release();
        if(res.rowCount > 0) {
            return CompletedResource.ormCompletedResource(res.rows[0]);
        }
        return false;
    }
    catch(e) {
        console.log(e.stack);
        return false;
    }
}

exports.saveCompletedResourceStatus = async function(completedResource) {
    // check to see if there is alreadly a saved record
    if(completedResource.id > 0) {
        // update
        let text = "UPDATE completed_resource SET submission_text = $1, active = $2, update_time = NOW() where resource_id = $3 AND user_id = $4";
        let values = [ completedResource.submissionText, completedResource.active, completedResource.resourceId, completedResource.userId ];
        try {
            const client = await db().connect(); 
            let res = await client.query(text, values);
    
            client.release();
            return completedResource;
        }
        catch(e) {
            console.log(e.stack);
            return false;
        }
    }
    else {
        // insert
        let text = "INSERT INTO completed_resource (resource_id, user_id, submission_text, active) VALUES ($1, $2, $3, $4) RETURNING id";
        let values = [ completedResource.resourceId, completedResource.userId, completedResource.submissionText, completedResource.active ];
        try {
            const client = await db().connect(); 
            let res = await client.query(text, values);

            if(res.rowCount > 0) {
                completedResource.id = res.rows[0].id;
            }
    
            client.release();
            return completedResource;
        }
        catch(e) {
            console.log(e.stack);
            client.release();
            return false;
        }
    }

    

    
}


/**
 * Get all topics that a user is enrolled in currently
 * enrollment and topic must both have an active status
 * @param {Integer} userId id of user enrolled
 * @returns List<topic> a list of the topic objects the user is enrolled in
 */
 exports.getActiveEnrolledTopicsForUserId = async function(userId) {
    let text = "SELECT * FROM user_topic WHERE active = $1 AND user_id = $2";
    let values = [ true, userId ];
    
    let topics = [];
    try {
        const client = await db().connect();
        let res = await client.query(text, values);
        
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                text = "SELECT * FROM topics WHERE active = $1 AND id = $2;";
                values = [ true, res.rows[i].topic_id ];

                let res2 = await client.query(text, values);
                if(res2.rows.length >0) {
                    topics.push(Topic.ormTopic(res2.rows[0]));
                }
            }
        }
        client.release();
        return topics;
    }
    catch(e) {
        console.log(e.stack)
    }
}



/**
 * Get all topics that a user has an active enrollment in, returns the topic with the highest version number
 * if the user has more then one record for the same topic id.
 * @param {Integer} userId id of user enrolled
 * @returns List<topic> a list of the topic objects the user is enrolled in
 */
 exports.getActiveTopicEnrollmentsForUserId = async function(userId) {
    let text = "SELECT * FROM user_topic WHERE active = $1 AND user_id = $2";
    let values = [true, userId];
    
    let enrollments = [];
    
    try {
        const client = await db().connect() 
        let res = await client.query(text, values);
        
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                // save the enrollment
                let enrollment = TopicEnrollment.ormTopicEnrollment(res.rows[i]);

                // get the topic for each user_topic
                text = "SELECT * FROM topics WHERE active = $1 AND id = $2 "
                values = [true, res.rows[i].topic_id];

                let res2 = await client.query(text, values);

                if(res2.rows.length > 0) {
                    enrollment.topic = Topic.ormTopic(res2.rows[0]);
                }     

                enrollments.push(enrollment);
            }

        }
        else {
            client.release();
            return false;
        }
        client.release();
        return enrollments;
    }
    catch(e) {
        console.log(e.stack)
    }
}



exports.getRecentTopicEnrollmentEvents = async function(limit) {
    limit = (!limit) ? 10 : limit;
    let text = "select ud.id as user_id, ud.username as username, ud.profile_filename as user_image, mod.id as topic_id, mod.topic_name as topic, mod.topic_image as topic_image, mode.create_time as create_time from user_data ud, topics mod, user_topic mode where mode.user_id = ud.id AND mode.topic_id = mod.id and mode.active = true AND mod.active = true ORDER BY mode.create_time desc LIMIT $1;";
    let values = [ limit ];
    
    try {
        const client = await db().connect();
        let res = await client.query(text, values);
        client.release();
        let enrollmentEvents = [];
        if(res.rows.length > 0) {
            for(let i=0; i<res.rows.length; i++) {
                let event = Event.emptyEvent();
                event.eventUserId = res.rows[i].user_id;
                event.eventItemId = res.rows[i].topic_id;
                event.eventItem = "Topic Enrollment";
                event.eventType = "Topic Enrollment";
                event.eventUsername = res.rows[i].username;
                event.eventTime = res.rows[i].create_time;
                event.eventTitle = "<a href='/user/" + res.rows[i].user_id + "'>" + res.rows[i].username + "</a> Enrolled in <a href='/topic/" + res.rows[i].topic_id + "'>" + res.rows[i].topic_name + "</a>";
                event.eventImage = res.rows[i].user_image;
                event.eventImage2 = res.rows[i].topic_image;
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