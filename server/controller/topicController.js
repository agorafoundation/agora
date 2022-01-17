var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
const { redirect } = require('express/lib/response');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

// import services
const topicService = require('../service/topicService');

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

/**
 * API Controller for topics
 * 
 */


 router.route('/resource')
    .patch(async (req, res) => {
        let resourceId = req.body.resourceId;
        let status = req.body.status;
        let submittedText = req.body.submittedText;


        if(req.session.currentTopic && req.session.user) {
            // call service?
            let completedResource = await topicService.getCompletedResourceByResourceAndUserId(resourceId, req.session.user.id);
            if(!completedResource) {
                completedResource = CompletedResource.emptyCompletedResource();
                completedResource.userId = req.session.user.id;
                completedResource.resourceId = resourceId;
            }
            completedResource.active = status;
            completedResource.submissionText = submittedText;

            // save the completedResource
            let completeResource = await topicService.saveCompletedResourceStatus(completedResource);

            // update the session
            let replaced = false;
            if(req.session.currentTopic.completedResources.length > 0 && completeResource.id > 0) {
                for(let i=0; i < req.session.currentTopic.completedResources.length; i++) {
                    if(req.session.currentTopic.completedResources[i].id == completeResource.id) {
                        req.session.currentTopic.completedResources[i] = completeResource;
                        replaced = true;
                        break;
                    }
                }
            }
            if (!replaced) {
                req.session.currentTopic.completedResources.push(completeResource);
            }
        }

        res.send();
    }
);




router.route('/')
module.exports = router;