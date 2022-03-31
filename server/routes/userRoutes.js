/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();
 
 
 // require services
 //const goalService = require('../../service/goalService');
const userService = require('../service/userService');
 
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
}));
router.use(bodyParser.json());


router.route('/:userId')
    .get(async (req, res) => {
        // get the user data
        let userId = req.params.userId;
        let user = await userService.getActiveUserById(userId);

        //console.log("returned user: " + JSON.stringify(user));
        
        res.render('community/user', {user: user});
    }
);
 


module.exports = router;