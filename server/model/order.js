/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function order( productId, quantity, userId, stripeSessionData, stripeCustomerData, mailAddress1, mailAddress2, mailCity, mailState, mailZip, mailCountry, orderStatus, paymentIntent, mode, stripeEmail, amount, subTotal, automaticTax, tax ) {
    this.orderId = -1;
    this.productId = productId;
    this.quantity = quantity;
    this.userId = userId;
    this.stripeSessionData = stripeSessionData;
    this.stripeCustomerData = stripeCustomerData;
    this.mailAddress1 = mailAddress1;
    this.mailAddress2 = mailAddress2;
    this.mailCity = mailCity;
    this.mailState = mailState;
    this.mailZip = mailZip;
    this.mailCountry = mailCountry;
    this.orderStatus = orderStatus;
    this.paymentIntent = paymentIntent;
    this.mode = mode;
    this.stripeEmail = stripeEmail;
    this.amount = amount;
    this.subTotal = subTotal;
    this.automaticTax = automaticTax;
    this.tax = tax;
}

exports.emptyOrder = () => {
    return new order();
};

exports.createOrder = function ( productId, quantity, userId, stripeSessionData, stripeCustomerData, mailAddress1, mailAddress2, mailCity, mailState, mailZip, mailCountry, orderStatus, paymentIntent, mode, stripeEmail, amount, subTotal, automaticTax, tax ) {
    let newOrder = new order( productId, quantity, userId, stripeSessionData, stripeCustomerData, mailAddress1, mailAddress2, mailCity, mailState, mailZip, mailCountry, orderStatus, paymentIntent, mode, stripeEmail, amount, subTotal, automaticTax, tax );
    newOrder.orderId = -1;
    return newOrder;
};

exports.ormOrder = function ( orderRow ) {
    let order = exports.emptyOrder();
    order.orderId = orderRow.order_id;
    order.productId = orderRow.product_id;
    order.quantity = orderRow.quantity;
    order.userId = orderRow.user_id;
    order.stripeSessionData = orderRow.stripe_session_data;
    order.stripeCustomerData = orderRow.stripe_customer_data;
    order.mailAddress1 = orderRow.mail_address_1;
    order.mailAddress2 = orderRow.mail_address_2;
    order.mailCity = orderRow.mail_city;
    order.mailState = orderRow.mail_state;
    order.mailZip = orderRow.mail_zip;
    order.mailCountry = orderRow.mail_country;
    order.orderStatus = orderRow.order_status;
    order.paymentIntent = orderRow.payment_intent;
    order.mode = orderRow.mode;
    order.stripeEmail = orderRow.stripe_email;
    order.amount = orderRow.amount;
    order.subTotal = orderRow.sub_total;
    order.automaticTax = orderRow.automatic_tax;
    order.tax = orderRow.tax;

    
    return order;
};

/**
 * Returns a Order object 
 * @param {Session} session <- Stripe Session object returned from stripe api
 * @param {Cusomer} customer <- String Customer object returned from stripe api
 * @param {User} user <- coding coach user object
 * @param {Integer} productId <- Coding Coach product Id
 * @param {Integer} quantity <- quanity ordered
 * @returns Order object
 */
exports.parseOrder = function ( session, customer, user, productId, quantity ) {
    // create order 
    let order = exports.emptyOrder();
    order.orderId -1;    // new order
    order.productId = productId;    // passed from a specific landing page
    order.quantity = quantity;     
    order.userId = user.userId;
    order.stripeSessionData = session;
    order.stripeCustomerData = customer;
    order.mailAddress1 = session.shipping.address.line1;
    order.mailAddress2 = session.shipping.address.line2;
    order.mailCity = session.shipping.address.city;
    order.mailState = session.shipping.address.state;
    order.mailZip = session.shipping.address.postal_code;
    order.mailCountry = session.shipping.address.country;
    order.orderStatus = session.status;
    if( session.mode == "subscription" ) {
        order.paymentIntent = session.subscription;
    }
    else {
        order.paymentIntent = session.payment_intent;
    }
    order.mode = session.mode;
    order.stripeEmail = session.customer_details.email;
    order.amount = session.amount_total;
    order.subTotal = session.amount_subtotal;
    order.automaticTax = session.automatic_tax;

    return order;
};