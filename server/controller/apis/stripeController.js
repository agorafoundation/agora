/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

//const stripe = require('stripe')(`${process.env.STRIPE_TEST_KEY}`);
const stripe = require( 'stripe' )( `${process.env.STRIPE_KEY}` );
const YOUR_DOMAIN = `${process.env.SITE_PROTOCOL}${process.env.SITE_HOST}:${process.env.SITE_PORT}`;

// import services
const userService = require( "../../service/userService" );
const productService = require( "../../service/productService" );
const stripeService = require( "../../service/stripeService" );

// import models
const Order = require( "../../model/order" );
const UserRole = require( "../../model/userRole" );




exports.checkoutCb1 = async function( res, req ) {
    //console.log(req.session.authUser)
    let coupon = req.body.checkoutcoupon;
    console.log( "coupon sent : " + coupon );
    if( coupon ) {
        try {
            const session = await stripe.checkout.sessions.create( {
                customer: req.session.authUser.stripeId,
                automatic_tax: {
                    enabled: true,
                },
                customer_update: {
                    name: 'auto',
                    shipping: 'auto',
                },
                shipping_address_collection: {
                    allowed_countries: [ 'US' ],
                },
                line_items: [
                    {
                        // Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
                        price: process.env.STRIPE_CB_PRICE,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                discounts: [ {
                    coupon: `${coupon}`,
                } ],
                success_url: `${YOUR_DOMAIN}/api/stripe/cb1-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${YOUR_DOMAIN}/api/stripe/cb1-cancel`,
            } );
    
            res.redirect( 303, session.url );
        }
        catch( e ) {
            console.log( "error: " + e );
            
            res.render( 'codebot', { message: "The Coupon code you enterd was invalid!"} );
        }
    }
    else {
        try {
            const session = await stripe.checkout.sessions.create( {
                customer: req.session.authUser.stripeId,
                automatic_tax: {
                    enabled: true,
                },
                customer_update: {
                    name: 'auto',
                    shipping: 'auto',
                },
                shipping_address_collection: {
                    allowed_countries: [ 'US' ],
                },
                line_items: [
                    {
                        // Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
                        price: process.env.STRIPE_CB_PRICE,
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${YOUR_DOMAIN}/api/stripe/cb1-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${YOUR_DOMAIN}/api/stripe/cb1-cancel`,
            } );
    
            res.redirect( 303, session.url );
        }
        catch( e ) {
            console.log( "error: " + e );
            
            res.render( 'codebot', { message: "There was a problem going to checkout."} );
        }
    }
};

exports.checkoutFounders = async function( req, res ) {
    //console.log(req.session.authUser)
    const session = await stripe.checkout.sessions.create( {
        customer: req.session.authUser.stripeId,
        shipping_address_collection: {
            allowed_countries: [ 'US' ],
        },
        line_items: [
            {
                // Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
                price: process.env.STRIPE_FOUNDERS_PRICE,
                quantity: 1,
            },
        ],
        mode: 'subscription',
        success_url: `${YOUR_DOMAIN}/api/stripe/founders-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/api/stripe/founders-cancel`,
    } );
    res.redirect( 303, session.url );
};

exports.checkoutToken = async function( req, res ) {
    //console.log(req.session.authUser)
    const session = await stripe.checkout.sessions.create( {
        customer: req.session.authUser.stripeId,
        shipping_address_collection: {
            allowed_countries: [ 'US' ],
        },
        line_items: [
            {
                // Provide the exact Price ID (e.g. pr_1234) of the product you want to sell
                price: process.env.STRIPE_TOKEN_PRICE,
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${YOUR_DOMAIN}/api/stripe/access-token-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${YOUR_DOMAIN}/api/stripe/access-token-cancel`,
    } );
    res.redirect( 303, session.url );
};



exports.successCb1 = async function( req, res ) {
    if( req.query.session_id ) {
        const session = await stripe.checkout.sessions.retrieve( req.query.session_id );
        const customer = await stripe.customers.retrieve( session.customer );
        //console.log("Session data: " + JSON.stringify(session));
        //console.log("Customer data: " + JSON.stringify(customer));

        // retrieve product and user based on stripe data returned
        if( session && customer ) {
            // this is used to get my id number
            const user = await userService.getUserByStripeCustomerId( customer.id );
            // did not need these yet, everything I needed was availabe in stripe session
            //const product = await productService.getProductById(1);

            // create order 
            let order = Order.parseOrder( session, customer, user, 1, 1 );
            
            //order.tax = ? // for the future

            // save order
            productService.createOrder( order );

            res.locals.stripeSession = session;
            res.locals.customer = customer;
        }
        
    }
    
    res.render( 'purchase/codebot1-success' );
};

exports.successFounders = async function( req, res ) {
    if( req.query.session_id ) {
        const session = await stripe.checkout.sessions.retrieve( req.query.session_id );
        const customer = await stripe.customers.retrieve( session.customer );
        //console.log("Session data: " + JSON.stringify(session));
        //console.log("Customer data: " + JSON.stringify(customer));

        // retrieve product and user based on stripe data returned
        if( session && customer ) {
            // this is used to get my id number
            let user = await userService.getUserByStripeCustomerId( customer.id );
            // did not need these yet, everything I needed was availabe in stripe session
            //const product = await productService.getProductById(1);

            // create order 
            let order = Order.parseOrder( session, customer, user, 2, 1 );
            //order.tax = ? // for the future

            // save order
            productService.createOrder( order );

            //console.log("order created: " + order);

            // create the fonders role for the user
            if( order.orderStatus == 'complete' ) {
                const uRole = await userService.getActiveRoleByName( "Founder" );

                // create the UserRole
                let userRole = UserRole.emptyUserRole();
                userRole.userId = user.userId;
                userRole.roleId = uRole.roleId;
                userRole.active = true;
                userRole.endTime = 'infinity';

                // create a user role record for this user
                await userService.saveUserRole( userRole );

                // reset the session
                const rUser = await userService.setUserSession( req.session.authUser.email );

                req.session.authUser = null;
                req.session.authUser = rUser;
            }

            res.locals.stripeSession = session;
            res.locals.customer = customer;
        }
        
    }
    
    //res.render('purchase/founders-success', {root: './client/views' });
    res.render( 'purchase/founders-success' );
};

exports.successToken = async function( req, res ) {
    if( req.query.session_id ) {
        const session = await stripe.checkout.sessions.retrieve( req.query.session_id );
        const customer = await stripe.customers.retrieve( session.customer );
        //console.log("Session data: " + JSON.stringify(session));
        //console.log("Customer data: " + JSON.stringify(customer));
        // retrieve product and user based on stripe data returned
        if( session && customer ) {
            // this is used to get my id number
            const user = await userService.getUserByStripeCustomerId( customer.id );
            // did not need these yet, everything I needed was availabe in stripe session
            //const product = await productService.getProductById(1);
            // create order 
            let order = Order.parseOrder( session, customer, user, 3, 1 );

            // save order
            let orderRes = await productService.createOrder( order );
            if( orderRes ) {
                // add a token to the users account
                
                await userService.addAccessTokensToUserById( user.userId, order.quantity );
            }
            // reset the session
            const rUser = await userService.setUserSession( req.session.authUser.email );

            // the new user has x tokens
            req.session.authUser = null;
            req.session.authUser = rUser;

            res.locals.stripeSession = session;
            res.locals.customer = customer;
        }
        
    }
    
    //res.render('purchase/access-token-success', {root: './client/views' })
    res.render( 'purchase/access-token-success' );
};