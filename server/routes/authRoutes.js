/**
 * Agora - Close the loop
 * © 2021-2022 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

var express = require('express');
var router = express.Router();

const bodyParser = require('body-parser');
const session = require('express-session');
router.use(bodyParser.urlencoded({
    extended: true
  }));
router.use(bodyParser.json());

// include services
const userService = require("../service/userService");
const productService = require("../service/productService");

// check that the user is logged in!
router.use(function (req, res, next) {
    if(!req.session.authUser) {
        res.redirect(303, '/signIn');
    }
    else {
        next();
    }
    
})


router.route('/')
    .get(async function (req, res) {
        if(req.session.authUser) {
            const authUser = await userService.setUserSession(req.session.authUser.email);
            req.session.authUser = null;
            req.session.authUser = authUser;
            res.locals.authUser = req.session.authUser;
            // get user orders
            const orders = await productService.getOrdersByUserId(authUser.id);

            // get all products ordered
            let products = [];
            for(let i=0; i<orders.length; i++) {
                let product = await productService.getProductById(orders[i].productId);
                product.status = orders[i].orderStatus;
                products.push(product);
            }
            
            if(req.session.uploadMessage) {
                let message = req.session.uploadMessage;
                req.session.uploadMessage = null;
                res.render('./auth/dashboard', { authUser: authUser, user: authUser, products: products });
            }
            else {
                res.render('./auth/dashboard', { authUser: authUser, user: authUser, products: products });
            }
            
        }
        else {
            res.redirect(303, '/signIn');
        }
    }
);

    
module.exports = router;
