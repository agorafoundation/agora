/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();

// import util Models
const ApiMessage = require( '../model/util/ApiMessage' );

// check that the user is logged in!
// Currently by being here all APIs should require an athenicated user to work
router.use(function (req, res, next) {
    if(!req.session.authUser) {
        // create the ApiMessage
        const apiRes = ApiMessage.createApiMessage( 401, "Unauthorized", "API requires authentication");
        
        res.set("x-agora-message-title", "Unauthorized");
        res.set("x-agora-message-detail", "API requires authentication");
        res.status(401).json(apiRes);
        //res.send();
    }
    else {
        next();
    }
    
});


/**
 * Goal APIs
 */
const goalRoutes = require('./apis/goalRoutes')
router.use('/goals', goalRoutes);

/**
 * Topic APIs
 */
// const topicRoutes = require('./apis/topicRoutes')
// router.use('/topic', topicRoutes);

/**
 * Resource APIs
 */
const resourceRoutes = require('./apis/resourceRoutes')
router.use('/resources', resourceRoutes);
 
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