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
let resourceService = require('../../service/resourceService');

// model requires
let Resource = require('../../model/resource');
const { localsName } = require('ejs');

// import multer (file upload) and setup
const fs = require('fs');
var path = require('path');
var baseResourceImageUrl = process.env.RESOURCE_IMAGE_BASE_URL;
var UPLOAD_PATH = path.resolve(__dirname, '..', process.env.RESOURCE_STORAGE);
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
        req.session.savedResourceFileName = filename;
        cb(null, filename);
    }
})
let upload = multer({ storage: storage, fileFilter:fileFilter, limits: { fileSize: maxSize } }).single('resourceImage');
// end multer



router.route('/')
    .get(async function (req, res) {
        // get all the resources for this owner
        let ownerResources = await resourceService.getAllActiveResourcesForOwner(req.session.authUser.id)
        //console.log("------------- owner resources: " + JSON.stringify(ownerResources));
        let resource = null;
        
        res.render('./admin/adminResource', {ownerResources: ownerResources, resource: resource});
      
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
                    
                let resource = Resource.emptyResource();
                resource.id = req.body.resourceId;

                resource.resourceType = req.body.resourceType;
                resource.resourceName = req.body.resourceName;
                resource.resourceDescription = req.body.resourceDescription;
                if(resource.resourceType == 3) {
                    resource.resourceContentHtml = req.body.submission_text2;
                }
                else {
                    resource.resourceContentHtml = req.body.submission_text;
                }
                // console.log("checking the resource: " + JSON.stringify(resource));
                // console.log("now the req.body: " + JSON.stringify(req.body));
                resource.active = (req.body.resourceActive == "on") ? true : false;
                resource.resourceLink = req.body.resourceLink;
                resource.isRequired = req.body.isRequired;
            
                // get the existing data
                if(resource.id) {

                    resourceService.getActiveResourceById(resource.id).then((dbResource) => {
                        resource.id = dbResource.id;
                        resource.resourceImage = dbResource.resourceImage

                        if(req.session.savedResourceFileName) {
                            resource.resourceImage = baseResourceImageUrl + req.session.savedResourceFileName;
                        } 

                        resource.ownedBy = req.session.authUser.id;
                        resourceService.saveResource(resource).then((savedResource) => {
                            res.locals.message = "Resource Saved Successfully";
                        });

                    });
                }
                else {
                    
                    resource.ownedBy = req.session.authUser.id; 

                    resourceService.saveResource(resource).then((savedResource) => {
                        res.locals.message = "Resource Saved Successfully";
                    });

                }
                
                res.redirect(303, '/a/resource/' + resource.id);

            }  
        });


        
    }
);


router.route('/:resourceId')
    .get(async function (req, res) {
        let message = '';
        if(req.locals && req.locals.message) {
            message = req.locals.message;
        }
        
        let resourceId = req.params.resourceId;

        // get all the resources for this owner
        let ownerResources = await resourceService.getAllActiveResourcesForOwner(req.session.authUser.id);

        let resource = Resource.emptyResource();
        if(resourceId > 0) {
            resource = await resourceService.getActiveResourceById(resourceId);
        }
        else {
            resource.ownedBy = req.session.authUser.id;
        }
      
        
        // make sure the user has access to this resource (is owner)
        if(resource.ownedBy === req.session.authUser.id) {
            res.render('./admin/adminResource', {ownerResources: ownerResources, resource: resource});
        }
        else {
            message = 'Access Denied';
            message2 = 'You do not have access to the requested resource';
            res.render('./admin/adminResource', {ownerResources: ownerResources, resource: null, message: message, message2: message2});
        }
    }
);

module.exports = router;