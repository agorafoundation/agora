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

// model requires
let Topic = require('../../model/topic');
const { localsName } = require('ejs');

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
                // save image          
                    
                let topic = Topic.emptyTopic();
                topic.id = req.body.topicId;

                topic.topicName = req.body.topicName;
                topic.topicDescription = req.body.topicDescription;
                topic.topicHtml = req.body.submission_text;
                topic.active = (req.body.topicActive == "on") ? true : false;


                // if there an existing image for this topic populate it incase the user did not change it, also set the owned by to the orginal
                console.log("topic id check: " + topic.id);
                if(topic.id > 0) {
                    console.log("user id check 0 : " + req.session.user.id);
                    topicService.getActiveTopicById(topic.id).then((dbTopic) => {
                        topic.id = dbTopic.id;
                        topic.topicImage = dbTopic.topicImage

                        if(req.session.savedTopicFileName) {
                            topic.topicImage = baseTopicImageUrl + req.session.savedTopicFileName;
                        } 

                        console.log("user id check 1 : " + req.session.user.id);
                        topic.ownedBy = req.session.user.id;
                        
                    });
                }
                else {
                    console.log("user id check 2 : " + req.session.user.id);
                    topic.ownedBy = req.session.user.id; 

                    

                }

                console.log("topic check: " + JSON.stringify(topic));
                // save the topic
                topicService.saveTopic(topic).then((savedTopic) => {

                    // get the pathway
                    let selectedTopicResources = null;
                    let selectedTopicResourcesRequired = null;
                    console.log("selectedTopicResources: " + req.body.selectedTopicResources );
                    console.log("selectedTopicResourcesRequired: " + req.body.selectedTopicResourcesRequired );
                    console.log("the samved topic: " + JSON.stringify(savedTopic));
                    if(req.body.selectedTopicResources) {
                        if(req.body.selectedTopicResourcesRequired) {
                            selectedTopicResourcesRequired = req.body.selectedTopicResourcesRequired.split(",");
                        }
                        selectedTopicResources = req.body.selectedTopicResources.split(",");
                        console.log("saving!");
                        topicService.saveResourcesForTopic(savedTopic.id, selectedTopicResources, selectedTopicResourcesRequired);
                    }

                    res.locals.message = "Topic Saved Successfully";
                    res.redirect(303, '/a/topic/' + savedTopic.id);
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