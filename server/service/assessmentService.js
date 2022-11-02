/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const Assessment = require( '../model/assessment' );
const AssessmentQuestion = require( '../model/assessmentQuestion' );
const AssessmentQuestionOption = require( '../model/assessmentQuestionOption' ); 

// any cross services required


/**
 * Get an assessment with questions and options by id
 * @param {Integer} assessmentId 
 * @param {boolean} active
 * @returns assessment
 */
exports.getAssessmentById = async function( assessmentId, active ) {
    let text = "";
    let values = [];
    if( active ) {
        text = "SELECT * FROM assessments WHERE active = $1 AND id = $2";
        values = [ true, parseInt( assessmentId ) ];
    }
    else {
        text = "SELECT * FROM assessments WHERE id = $1";
        values = [ parseInt( assessmentId ) ];
    }
    
    try {
        let assessment = "";
         
        let res = await db.query( text, values );
        if( res.rowCount > 0 ) {
            assessment = Assessment.ormAssessment( res.rows[0] );

            // find the questions associated with the assessment
            if( active ) {
                text = "SELECT * FROM assessment_question WHERE active = $1 AND assessment_id = $2";
                values = [ true, assessment.id ];
            }
            else {
                text = "SELECT * FROM assessment_question WHERE assessment_id = $1";
                values = [ assessment.id ];
            }
            

            let res2 = await db.query( text, values );
            if( res2.rowCount > 0 ) {
                for( let i = 0; i < res2.rowCount; i++ ) {
                    let question = AssessmentQuestion.ormAssessmentQuestion( res2.rows[i] );

                    // find the options associated with each question
                    if( active ) {
                        text = "SELECT * FROM assessment_question_option WHERE active = $1 AND assessment_question_id = $2";
                        values = [ true, question.id ];
                    }
                    else {
                        text = "SELECT * FROM assessment_question_option WHERE assessment_question_id = $1";
                        values = [ question.id ];
                    }
                    
    
                    let res3 = await db.query( text, values );
                    if( res3.rowCount > 0 ) {
                        for( let j = 0; j < res3.rowCount; j++ ) {
                            let option = AssessmentQuestionOption.ormAssessmentQuestionOption( res3.rows[j] );

                            question.options.push( option );
                        }
                    }
    
                    assessment.questions.push( question );
                }
                
            }
        }
        return assessment;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Returns the last topic_assessment_number in the database for the passed assessment and user Ids. Used to determine the post assessment  
 * topic_assessment_number as there may be multiple post assessments. 
 * @param {*} assessmentId assessment Id
 * @param {*} userId user Id
 * @returns the last topic assessment_number saved or false if query fails
 */
exports.getNextTopicAssessmentNumber = async function( assessmentId, userId ) {
    if( assessmentId ) {
        // query : select assessment_id, user_id, max(topic_assessment_number) from completed_assessment where assessment_id = 2 and user_id = 1 group by user_id, assessment_id;
        let text = "select assessment_id, user_id, max(topic_assessment_number) as num_assessments from completed_assessment where assessment_id = $1 and user_id = $2 group by user_id, assessment_id;";
        let values = [ assessmentId, userId ];

        try {
             
            let res = await db.query( text, values );
            if( res.rowCount > 0 ) {
                return res.rows[0].num_assessments;
            }

        }
        catch( e ) {
            console.log( e.stack );
        }
        return false;
    }
};

/**
 * Determines the number of correct answers a student had on an assessment.
 * Pass in the assessment and the completedAssessment. Function will return a decimal representing the percentage correct
 * range ( .000 -> 1.000 )
 * @param {Assessment} assessment 
 * @param {CompletedAssessment} completedAssessment 
 * @returns decimal representing the percentage correct range ( .000 -> 1.000 )
 */
exports.evaluateAssessment = async function( assessment, completedAssessment ) {
    let totalQuestions = 0;
    let totalCorrect = 0;

    if( assessment && assessment.questions && completedAssessment && completedAssessment.completedQuestions && assessment.id == completedAssessment.assessmentId ) {
        for( let i=0; i < assessment.questions.length; i++ ) {
            
            totalQuestions++;

            let completedQuestion = null;
            for( let j=0; j < completedAssessment.completedQuestions.length; j++ ) {
                if( assessment.questions[i].id === completedAssessment.completedQuestions[j].assessmentQuestionId ) {

                    // see if the user had the right answer
                    if( assessment.questions[i].correctOptionId == completedAssessment.completedQuestions[j].assessmentQuestionOptionId ) {
                        // user selected the correct option
                        totalCorrect++;
                    }
                }
            }

        }

        // return the % correct as a decimal (range .000 -> 1.000)
        // console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ");
        // console.log("tq: " + totalQuestions + " tc: " + totalCorrect + " eq: " + (totalQuestions > 0) + " res: " + (totalCorrect / totalQuestions));
        // console.log(" ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ");
        return ( ( totalQuestions > 0 )?( totalCorrect / totalQuestions ):0 );
    }
};

/**
 * Updates the completed resource with the matching id to status of false.
 * This marks the assessment so that it is not retrieved for the topic enrollment but leaves the history intact
 * @param {Integer} completedAssessmentId 
 * @returns true if successful, false otherwise.
 */
exports.removeCompletedAssessmentFromEnrollment = async function ( completedAssessmentId, enrollmentId ) {
    if( completedAssessmentId > 0 ) {

        // update
        let text = "UPDATE completed_assessment SET active = $1 WHERE id = $2;";
        let values = [ false, completedAssessmentId ];

        try {
            await db.query( text, values );
            
            // also remove the completed assessment id from the enrollment table
            text = "UPDATE user_topic SET post_completed_assessment_id = $1 WHERE id = $2;";
            values = [ -1, enrollmentId ];

            try {
                await db.query( text, values );
                return true;
            }
            catch( e ) {
                console.log( "[ERR]: Error updating completedAssessment - " + e );
                return false;
            }
        }
        catch( e ) {
            console.log( "[ERR]: Error updating completedAssessment - " + e );
            return false;
        }

    }
    else {
        return false;
    }
};


/**
 * Saves a assessment to the database, creates a new record if no id is assigned, updates existing record if there is an id.
 * @param {Assessment} assessment 
 * @param {Integer} topicId Id of topic associated with the assessment
 * @returns Assessment object with id 
 */
exports.saveAssessment = async function( assessment ) {
    // check to see if an id exists - insert / update check
    
    if( assessment ) {
        /*
         * Working on #35 and #37 
         * #35 showed that getActiveAssessmentById now getAssessmentById was not returning anything 
         * In considering #37 in the mix however, fixing #35 might cause the loss of history regarding modified assessments that have 
         * already been completed.  So for now, I am commenting the section out that was aiming to delete the historial assessment, as
         * we want to retain the correct version that the user completed.
         *
        if(assessment.id > 0) {
            //console.log(" ----- deleting the old the assesment -----");
            // delete all existing data for this assessment

            // get the existing db oldAssessment in order to delete it first
            let oldAssessment = await exports.getActiveAssessmentById(assessment.id); // now getAssessmentById

            console.log("old assessment -------------------");
            console.log("looking for assessment with id : " + assessment.id)
            console.log(JSON.stringify(oldAssessment));
            console.log("-----------------------------------");

            // go through options, questions and the assessment and delete all of them
            if(oldAssessment && oldAssessment.questions) {
                for( let i = 0; i < oldAssessment.questions.length; i++ ) {
                    if(oldAssessment.questions[i].options) {
                        for( let i = 0; i < oldAssessment.questions[i].options.length; i++ ) {
                            let text = "DELETE FROM assessment_question_option WHERE id = $1;";
                            let values = [ oldAssessment.questions[i].options[j].id ];
                    
                            try {
                                let res = await db.query(text, values);
                            }
                            catch(e) {
                                console.log("[ERR]: Error deleting assessment_question_option - " + e);
                                return false;
                            }

                        }
                    }
                    // delete the question
                    let text = "DELETE FROM assessment_question WHERE id = $1;";
                    let values = [ oldAssessment.questions[i].id ];
            
                    try {
                        let res = await db.query(text, values);
                    }
                    catch(e) {
                        console.log("[ERR]: Error deleting assessment_question - " + e);
                        return false;
                    }
                }
            }

            // delete the assessment
            let text = "DELETE FROM assessments WHERE id = $1;";
            let values = [ oldAssessment.id ];
    
            try {
                let res = await db.query(text, values);
            }
            catch(e) {
                console.log("[ERR]: Error deleting from assessments - " + e);
                return false;
            }

            
        }
        */

        // console.log(" ----- Saving the assesment -----");
        // console.log("New assessment: \n" + JSON.stringify(assessment) + "\n\n");
        
        // save the assessment
        if( assessment ) {
            let text = "INSERT INTO assessments (assessment_type, assessment_name, assessment_description, pre_threshold, post_threshold, is_required, active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id;";
            let values = [ assessment.assessmentType, assessment.assessmentName, assessment.assessmentDescription, assessment.preThreshold, assessment.postThreshold, assessment.isRequired, true ];

            try {
                let res = await db.query( text, values );
                if( res.rowCount > 0 ) {
                    // get the id
                    assessment.id = res.rows[0].id;

                    // save the questions
                    if( assessment.questions ) {
                        for( let i = 0; i < assessment.questions.length; i++ ) {
                            text = "INSERT INTO assessment_question (assessment_id, question, is_required, correct_option_id, active) VALUES ($1, $2, $3, $4, $5) RETURNING id;";
                            values = [ assessment.id, assessment.questions[i].question, assessment.questions[i].isRequired, assessment.questions[i].correctOptionId, assessment.questions[i].active ];

                            try {
                                let res2 = await db.query( text, values );

                                if( res2.rowCount > 0 ) {
                                    // get the id
                                    assessment.questions[i].id = res2.rows[0].id;

                                    // save the question options
                                    if( assessment.questions[i].options ) {
                                        for( let j = 0; j < assessment.questions[i].options.length; j++ ) {
                                            text = "INSERT INTO assessment_question_option (assessment_question_id, option_number, option_answer, active) VALUES ($1, $2, $3, $4) RETURNING id;";
                                            values = [ assessment.questions[i].id, assessment.questions[i].options[j].optionNumber, assessment.questions[i].options[j].optionAnswer, assessment.questions[i].options[j].active ];

                                            try {
                                                let res3 = await db.query( text, values );

                                                if( res3.rowCount > 0 ) {
                                                    assessment.questions[i].options[j].id = res3.rows[0].id;

                                                    // update the correct option id with the actual id number and not the option index
                                                    if( ( j + 1 ) == assessment.questions[i].correctOptionId ) {
                                                        text = "UPDATE assessment_question SET correct_option_id = $1 WHERE id = $2;";
                                                        values = [ assessment.questions[i].options[j].id, assessment.questions[i].id ];

                                                        try {
                                                            let res4 = await db.query( text, values );
                                                        }
                                                        catch( e ) {
                                                            console.log( "[ERR]: Error updating assessment_question table with correct_option_id - " + e );
                                                            return false;
                                                        }
                                                    }
                                                }
                                            }
                                            catch( e ) {
                                                console.log( "[ERR]: Inserting into assessment_question_option - " + e );
                                                return false;
                                            }
                                        }
                                    }
                                }
                            }
                            catch( e ) {
                                console.log( "[ERR]: Inserting into assessment_question - " + e );
                                return false;
                            }
                        }
                    }
                }
            }
            catch( e ) {
                console.log( "[ERR]: Inserting assessment - " + e );
                return false;
            }
        }

        console.log( " ----- Assessment Saved -----" );
        //console.log("New assessment: \n" + JSON.stringify(assessment) + "\n\n");

        return assessment;
    }
    else {
        return false;
    }
};