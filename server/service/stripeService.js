/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

//const stripe = require('stripe')(`${process.env.STRIPE_TEST_KEY}`);
const stripe = require( 'stripe' )( `${process.env.STRIPE_KEY}` );
const YOUR_DOMAIN = `${process.env.SITE_PROTOCOL}${process.env.SITE_HOST}:${process.env.SITE_PORT}`;

module.exports.createStripeCustomer = async function ( email, fullname ) {
    let id = "";
    try {
        const customer = await stripe.customers.create( {
            email: email,
            name: fullname,
        } );

        id = customer.id;
    }
    catch( e ) {
        console.log( e );
        id = "unknown";
    }

    return id;
};