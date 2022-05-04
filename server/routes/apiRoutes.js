/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();

// check that the user is logged in!
// Currently by being here all APIs should require an athenicated user to work
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


/**
 * Goal APIs
 */
// const goalRoutes = require('./apis/goalRoutes')
// router.use('/goal', goalRoutes);

/**
 * Topic APIs
 */
// const topicRoutes = require('./apis/topicRoutes')
// router.use('/topic', topicRoutes);

/**
 * Resource APIs
 */
// const resourceRoutes = require('./apis/resourceRoutes')
// router.use('/resource', resourceRoutes);
 
/**
 * User APIs
 */
const userRoutes = require('./apis/userRoutes')
router.use('/user', userRoutes);


/**
 * Stripe APIs
 */
const stripeRoutes = require('./apis/stripeRoutes')
router.use('/stripe', stripeRoutes);

module.exports = router;