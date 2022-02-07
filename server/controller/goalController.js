/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();
 
const bodyParser = require('body-parser');
const { redirect } = require('express/lib/response');
router.use(bodyParser.urlencoded({extended: true}));
router.use(bodyParser.json());

// import services
const goalService = require('../service/goalService');
const topicService = require('../service/topicService');

// import models
const Goal = require("../model/goal");
const Topic = require("../model/topic");


router.route('/goalPath')
    .post(async (req, res) => {

    })
    .delete(async (req, res) => {

    }
);




router.route('/')
module.exports = router;