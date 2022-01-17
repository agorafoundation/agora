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
    if(!req.session.user) {
        res.redirect(303, '/signIn');
    }
    else {
        next();
    }
    
})


router.route('/')
    .get(async function (req, res) {
        if(req.session.user) {
            const user = await userService.setUserSession(req.session.user.email);

            req.session.user = null;
            req.session.user = user;
            res.locals.user = req.session.user;

            // get user orders
            const orders = await productService.getOrdersByUserId(user.id);

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
                res.render('./auth/dashboard', { firstName: req.session.firstName, uploadMessage: message, products: products });
            }
            else {
                res.render('./auth/dashboard', { firstName: req.session.firstName, products: products });
            }
            
        }
        else {
            res.redirect(303, '/signIn');
        }
    }
);

    
module.exports = router;
