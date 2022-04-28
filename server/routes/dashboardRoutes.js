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
 
 
 router.route('/')
     .get(async function (req, res) {
         res.setHeader('Content-Type', 'text/html; charset=utf-8');

         // get goals associated with the user
         let ownerGoals = await goalService.getAllGoalsForOwner( req.session.authUser.id, false )
         
 
         res.render('dashboard/dashboard', {user: req.session.authUser, ownerGoals: ownerGoals})
     }
 );

 
 module.exports = router;
