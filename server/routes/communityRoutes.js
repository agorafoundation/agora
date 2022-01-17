/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();

// require services
const goalService = require('../service/goalService');
const productService = require('../service/productService');

// controllers
const eventController = require('../controller/eventController');

const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());


// check that the user is logged in!
router.use(function (req, res, next) {
    if(!req.session.user) {
        if(req.query.redirect) {
            res.locals.redirect = req.query.redirect;
        }
        res.render('user-signup');
    }
    else {
        next();
    }
    
})


router.route('/')
    .get(async function (req, res) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        //res.sendFile('edge-signup.html', {root: './client/views' })
        // get all the current goals and topics to display
        const availableGoals = await goalService.getAllActiveGoalsWithTopics();
        //const availableTopics = await topicService.getAllAcitveTopics();

        //console.log(JSON.stringify(availableGoals));

        // get the events feed
        const feed = await eventController.communityEventFeed(10);

        res.render('community/community', {availableGoals: availableGoals, feed: feed})
    }
);

router.route('/welcome')
    .get((req, res) => {
        res.render('user-welcome');
    }
);
router.route('/manage')
    .get((req, res) => {
        res.render('user-manage');
    }
);
router.route('/error')
    .get((req, res) => {
        res.render('user-error');
    }
);

router.route('/join')
    .get(async (req, res) => {
        // get products to send to page (founders membership and tokens)
        const products = await productService.getAllActviteTokenAndMembershipProductsWithImages();

        // user does not currently have membership or tokens, redirct to join
        res.render('community/join', {products: products, user:req.session.user});

    })






router.route('/purchase')
    .get(async (req, res) => {
        if(req.session.user) {
            let user = req.session.user;
            
            // get products to send to page (founders membership and tokens)
            const products = await productService.getAllActviteTokenAndMembershipProductsWithImages();

            // user does not currently have membership or tokens, redirct to join
            res.render('community/join', {products: products, user:user});
        }
        else {
            // get products to send to page (founders membership and tokens)
            const products = await productService.getAllActviteTokenAndMembershipProductsWithImages();

            // user does not currently have membership or tokens, redirct to join
            res.render('community/join', {products: products});
        }
        
    }
);
    
module.exports = router;
