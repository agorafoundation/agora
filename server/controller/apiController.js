var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());


/**
 * User APIs
 */
let user = require('./userController')
router.use('/user', user);

/**
 * Stripe APIs
 */
if(process.env.STRPIE_TOGGLE == "true") {
    let stripe = require('./stripeController')
    router.use('/stripe', stripe);
}


/**
 * Topic APIs
 */
let topicApi = require('./topicController')
router.use('/topic', topicApi);

router.route('/')
module.exports = router;
