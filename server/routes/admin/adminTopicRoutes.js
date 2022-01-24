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
            
                // get the existing data
                if(topic.id) {

                    topicService.getActiveTopicById(topic.id).then((dbTopic) => {
                        topic.id = dbTopic.id;
                        topic.topicImage = dbTopic.topicImage

                        if(req.session.savedTopicFileName) {
                            topic.topicImage = baseTopicImageUrl + req.session.savedTopicFileName;
                        } 

                        topic.ownedBy = req.session.user.id;
                        topicService.saveTopic(topic).then((savedTopic) => {
                            res.locals.message = "Topic Saved Successfully";
                        });

                    });
                }
                else {
                    
                    topic.ownedBy = req.session.user.id; 

                    topicService.saveTopic(topic).then((savedTopic) => {
                        res.locals.message = "Topic Saved Successfully";
                    });

                }
                
                res.redirect(303, '/a/topic/' + topic.id);

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

        let topic = Topic.emptyTopic();
        if(topicId > 0) {
            topic = await topicService.getActiveTopicById(topicId);
        }
        else {
            topic.ownedBy = req.session.user.id;
            topic.topicVersion = 1;
        }
      
        
        // make sure the user has access to this topic (is owner)
        if(topic.ownedBy === req.session.user.id) {
            res.render('./admin/adminTopic', {ownerTopics: ownerTopics, topic: topic});
        }
        else {
            message = 'Access Denied';
            message2 = 'You do not have access to the requested resource';
            res.render('./admin/adminTopic', {ownerTopics: ownerTopics, topic: null, message: message, message2: message2});
        }
    }
);

module.exports = router;