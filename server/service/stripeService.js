const stripe = require('stripe')(`${process.env.STRIPE_TEST_KEY}`);
const YOUR_DOMAIN = `${process.env.STRIPE_DOMAIN}`;

module.exports.createStripeCustomer = async function (email, fullname) {
    let id = "";
    try {
        const customer = await stripe.customers.create({
            email: email,
            name: fullname,
        });

        id = customer.id;
    }
    catch(e) {
        console.log(e);
        id = "unknown";
    }

    return id;
}