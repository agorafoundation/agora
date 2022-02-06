/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

 var express = require('express');
 var router = express.Router();

 const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());

// service requires
let topicService = require('../../service/topicService');
let resourceService = require('../../service/resourceService')
let activityService = require('../../service/activityService');
let assessmentService = require('../../service/assessmentService');

// model requires
const Topic = require('../../model/topic');
const Activity = require('../../model/activity');
const Assessment = require('../../model/assessment');
const AssessmentQuestion = require('../../model/assessmentQuestion');
const AssessmentQuestionOption = require('../../model/assessmentQuestionOption'); 

// import multer (file upload) and setup
const fs = require('fs');
var path = require('path');
var baseTopicImageUrl = process.env.TOPIC_IMAGE_BASE_URL;
var UPLOAD_PATH = path.resolve(__dirname, '..', process.env.TOPIC_STORAGE);
var UPLOAD_PATH_BASE = path.resolve(__dirname, '..', process.env.STORAGE_BASE);
var maxSize = 1 * 1024 * 1024;

// Start multer
var multer = require('multer');

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png') {
        cb(null, true);
    }
    else {
        cb(null, false);
    }
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_PATH)
    },
    filename: function (req, file, cb) {
        let filename = Date.now() + file.originalname;
        req.session.savedTopicFileName = filename;
        cb(null, filename);
    }
})
let upload = multer({ storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } }).single('topicImage');
// end multer



router.route('/')
    .get(async function (req, res) {
        // get all the topics for this owner
        let ownerTopics = await topicService.getAllActiveTopicsForOwner(req.session.user.id)
        //console.log("------------- owner topics: " + JSON.stringify(ownerTopics));
        let topic = null;
        
        res.render('./admin/adminTopic', {ownerTopics: ownerTopics, topic: topic});
      
    })
    .post(async function(req, res) {
        upload(req, res, (err) => {

            if(err) {
                console.log("Error uploading picture : " + err);
                req.session.uploadMessage = "File size was larger the 1MB, please use a smaller file."
                res.redirect(303, '/auth');
            }
            else {
                // create topic        
                let topic = Topic.emptyTopic();
                topic.id = req.body.topicId;

                topic.topicName = req.body.topicName;
                topic.topicDescription = req.body.topicDescription;
                topic.topicHtml = req.body.submission_text;
                topic.active = (req.body.topicActive == "on") ? true : false;

                // if there an existing image for this topic populate it incase the user did not change it, also set the owned by to the orginal
                if(topic.id > 0) {
                    topicService.getActiveTopicById(topic.id).then((dbTopic) => {
                        topic.id = dbTopic.id;
                        topic.topicImage = dbTopic.topicImage

                        // save the image if one is provided
                        if(req.session.savedTopicFileName) {
                            topic.topicImage = baseTopicImageUrl + req.session.savedTopicFileName;
                        } 

                        topic.ownedBy = req.session.user.id;
                        
                    });
                }
                else {
                    topic.ownedBy = req.session.user.id; 
                    
                    if(req.session.savedTopicFileName) {
                        topic.topicImage = baseTopicImageUrl + req.session.savedTopicFileName;
                    }
                    

                }

                // topic activity
                // check to see if there is already an activity to update
                if(!topic.activityId > 0) {
                    if(!topic.activity) {
                        topic.activity = Activity.emptyActivity();
                    }   
                }

                if(req.body.activityName) {
                    topic.activity.activityName = req.body.activityName;
                }
                if(req.body.activityDescription) {
                    topic.activity.activityDescription = req.body.activityDescription;
                }
                console.log("test activity_html: " + req.body.activity_html);
                if(req.body.activity_html) {
                    topic.activity.activityHtml = req.body.activity_html;
                }

                // assessment
                if(!topic.assessmentId > 0) {
                    if(!topic.assessment) {
                        topic.assessment = Assessment.emptyAssessment();
                    }
                }

                // TODO: is there anything to do with assessment type?? currently hard coding 1, isRequired is currently deemed to be true for all assessments.
                topic.assessment.assessmentType = 1;
                topic.assessment.isRequired = true;

                if(req.body.topicAssessmentName) {
                    topic.assessment.assessmentName = req.body.topicAssessmentName;
                }

                if(req.body.topicAssessmentDescription) {
                    topic.assessment.assessmentDescription = req.body.topicAssessmentDescription;
                }

                topic.assessment.active = false;
                (req.body.topicAssessmentActive == 'checked') ? topic.assessment.active = true : topic.assessment.active = false;
                
                // assessment questions
                let numQuestions = req.body.topicAssessmentQuestionId.length;
                for( let i = 1; i <= numQuestions; i++ ) {
                    // create each question
                    let question = AssessmentQuestion.emptyAssessmentQuestion();
                    question.id = i;
                    question.assessmentId = -1;
                    question.question = req.body["topicAssessmentQuestionName-" + i ];
                    question.isRequired = true;

                    // go through each option
                    if(req.body["topicAssessmentQuestionOptions-" + i]) {
                        let optionLength = req.body["topicAssessmentQuestionOptions-" + i].length;
                        console.log("question num : " + i + " has length: " + optionLength);
                        for( let j = 0; j < optionLength; j++ ) {
                            // create the option
                            let questionOption = AssessmentQuestionOption.emptyAssessmentQuestionOption();
                            questionOption.active = true;
                            questionOption.optionAnswer = req.body["topicAssessmentQuestionOptions-" + i][j];
                            questionOption.optionNumber = (j + 1);
                            // check to see if this is the checked option to set correct
                            console.log("CHECK::: " + req.body["topicAssessmentQuestionOptionsCorrect-" + i ] + "==" + req.body["topicAssessmentQuestionOptionId-" + i ][j]);
                            if(req.body["topicAssessmentQuestionOptionsCorrect-" + i ] == req.body["topicAssessmentQuestionOptionId-" + i ][j]) {
                                question.correctOptionId = req.body["topicAssessmentQuestionOptionsCorrect-" + i ];
                            }
                            
                            questionOption.assessmentQuestionId = i;

                            question.options.push(questionOption);
                        }
                        
                    }
                    topic.assessment.questions.push(question);
                    
                }

                console.log("Checking the constructed assessment: \n" + JSON.stringify(topic.assessment) + "\n\n");

                // save the activity
                activityService.saveActivity(topic.activity).then((returnedActivity) => {
                    topic.activity = returnedActivity;
                    topic.activityId = returnedActivity.id;
                    
                    console.log("topic check: " + JSON.stringify(returnedActivity));

                    // save the assessment
                    assessmentService.saveAssessment(topic.assessment).then((returnedAssessment) => {
                        topic.assessmentId = returnedAssessment.id;

                        // save the topic
                        topicService.saveTopic(topic).then((savedTopic) => {

                            // get the pathway
                            let selectedTopicResources = null;
                            let selectedTopicResourcesRequired = null;
                            
                            if(req.body.selectedTopicResources) {
                                if(req.body.selectedTopicResourcesRequired) {
                                    selectedTopicResourcesRequired = req.body.selectedTopicResourcesRequired.split(",");
                                }
                                selectedTopicResources = req.body.selectedTopicResources.split(",");
                                topicService.saveResourcesForTopic(savedTopic.id, selectedTopicResources, selectedTopicResourcesRequired);
                            }

                            // save the assessment

                            res.locals.message = "Topic Saved Successfully";
                            res.redirect(303, '/a/topic/' + savedTopic.id);
                        });
                    });

                    
                });

                
                
                //res.redirect(303, '/a/topic');

            }  
        });


        
    }
);


router.route('/:topicId')
    .get(async function (req, res) {
        let message = '';
        if(req.locals && req.locals.message) {
            message = req.locals.message;
        }
        
        let topicId = req.params.topicId;

        // get all the topics for this owner
        let ownerTopics = await topicService.getAllActiveTopicsForOwner(req.session.user.id);

        // get the topic by id
        let topic = Topic.emptyTopic();
        if(topicId > 0) {
            topic = await topicService.getActiveTopicWithEverythingById(topicId);
        }
        else {
            topic.ownedBy = req.session.user.id;
        }

        // get all the resources for this owner
        let ownerResources = await resourceService.getAllActiveResourcesForOwner(req.session.user.id);

        // start the available topics out with the full owner resource set
        let availableResources = ownerResources;

        // iterate through the resources already associated with the topic, remove them from the available list
        if(topic.resources) {
            for( let i=0; i < topic.resources; i++ ) {
                let redundantResource = ownerResources.map(ot => ot.id).indexOf(topic.resources[i].id);
                
                ~redundantResource && availableResources.splice(redundantResource, 1);
            }
        }
      
        
        // make sure the user has access to this topic (is owner)
        if(topic.ownedBy === req.session.user.id) {
            res.render('./admin/adminTopic', {ownerTopics: ownerTopics, topic: topic, availableResources: availableResources});
        }
        else {
            message = 'Access Denied';
            message2 = 'You do not have access to the requested resource';
            res.render('./admin/adminTopic', {ownerTopics: ownerTopics, topic: null, message: message, message2: message2});
        }
    }
);

module.exports = router;