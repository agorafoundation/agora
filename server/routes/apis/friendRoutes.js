/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
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

//dependencies 

// controllers
const workspaceController = require('../../controller/apis/friendController');
const { get } = require('./tagRoutes');

router.route('/')
    //get all friends
    .get(async (req, res) => {
        friendController.getAllFriends(req, res);

    })

    //save a new friend
    .post(async (req, res) => {
        friendController.saveFriend(req, res);
    });

router.route('/:userID')
    //get a friend by their user ID.
    .get(async (req, res) => {
        friendController.getFriendByID(req, res);
    })

    .delete(async (req, res) => {
        friendController.deleteFriendByID(req, res);
    });