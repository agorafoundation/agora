/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

const express = require( 'express' );
const router = express.Router( );

// const bodyParser = require('body-parser');
// router.use(bodyParser.urlencoded({
//     extended: true
//   }));
// router.use(bodyParser.json());

// controllers
const stripeController = require( '../../controller/apis/stripeController' );

/**
 * Stripe API calls and related routes
 */

/**
 * Stripe checkout sessions
 */
router.post( '/cb1-checkout-session', async ( req, res ) => {
    stripeController.checkoutCb1( req, res );
  
} );

router.post( '/founders-checkout-session', async ( req, res ) => {
    stripeController.checkoutFounders( req, res );
} );


router.post( '/access-token-checkout-session', async ( req, res ) => {
    stripeController.checkoutToken( req, res );
} );


/**
 * Success routes
 */
router.get( '/cb1-success', async function ( req, res ) {
    stripeController.successCb1( req, res );
    
} );

router.get( '/founders-success', async function ( req, res ) {
    stripeController.successFounders( req, res );
    
} );

router.get( '/access-token-success', async function ( req, res ) {
    stripeController.successToken( req, res );
    
} );


/**
 * Failure Routes
 */
router.get( '/cb1-cancel', function ( req, res ) {
    res.render( 'purchase/codebot1-cancel' );
} );

router.get( '/founders-cancel', function ( req, res ) {
    res.render( 'purchase/founders-cancel' );
} );

router.get( '/access-token-cancel', function ( req, res ) {
    res.render( 'purchase/access-token-cancel' );
} );




module.exports = router;