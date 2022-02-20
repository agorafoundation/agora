/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();


// require services
const goalService = require('../../service/goalService');
const userService = require('../../service/userService');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());


// check that the user is logged in!
router.use(function (req, res, next) {
    if(!req.session.authUser) {
        if(req.query.redirect) {
            res.locals.redirect = req.query.redirect;
        }
        res.render('user-signup');
    }
    else {
        next();
    }
    
})



router.route('/:goalId')

.get(async (req, res) => {
    // get the topic data
    let goalId = req.params.goalId;
    let goal = await goalService.getActiveGoalWithTopicsById(goalId);
    //console.log("goal: " + JSON.stringify(goal));
    res.render('community/goal', {user: req.session.authUser, goal: goal});
}

);


router.route('/enroll/:goalId')
.get(async (req, res) => {
    let goalId = req.params.goalId;
    if(req.session.authUser) {

        // save the enrollment for the user in the goal
        await goalService.saveGoalEnrollmentMostRecentGoalVersion(req.session.authUser.id, goalId);

        // reset the session
        const rUser = await userService.setUserSession(req.session.authUser.email);

        req.session.authUser = null;
        req.session.authUser = rUser;

        // send them to the course
        res.redirect('/community/goal/' + goalId);
        
    }
    else {
        res.render('user-signup');
    }
}
);



module.exports = router;
