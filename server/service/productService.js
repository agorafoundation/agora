/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

// database connection
const db = require( '../db/connection' );

// import models
const Product = require( "../model/product" );
const ProductImage = require( "../model/productImage" );
const Order = require( "../model/order" );

// TODO: STUB save product
exports.saveProduct = async function( record ) {
};

// TODO: STUB save productImage
exports.saveProductImage = async function( record ) {
};



exports.verifyOrderByStripePaymentIntentAndStripeStatus = async function( payment_intent, status ) {
    const text = "SELECT id FROM orders WHERE payment_intent = $1 AND order_status = $2;";
    const values = [ payment_intent, status ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return true;
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};


exports.createOrder = async function( order ) {
    if( order ) {
        // check to see if this is a duplicate by looking for a unique combo of payment_intent and status
        if( ! await exports.verifyOrderByStripePaymentIntentAndStripeStatus( order.paymentIntent, order.orderStatus ) ) {
            let text = 'INSERT INTO orders(product_id, quantity, user_id, stripe_session_data, stripe_customer_data, mail_address_1, mail_address_2, mail_city, mail_state, mail_zip, mail_country, order_status, payment_intent, mode, stripe_email, amount, sub_total, automatic_tax, tax)'
                + 'VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19);';
            let values = [ order.productId, order.quantity, order.userId, order.stripeSessionData, order.stripeCustomerData, order.mailAddress1, order.mailAddress2, order.mailCity, order.mailState, order.mailZip, order.mailCountry, order.orderStatus, order.paymentIntent, order.mode, order.stripeEmail, order.amount, order.subTotal, order.automaticTax, order.tax ];
            try {
                 
                let response = await db.query( text, values );
                
                return true;
            }
            catch( e ) {
                console.log( e.stack );
                return false;
            }
        }
        else {
            console.log( "duplicate order success page submission detected: " + order );
            return false;
        }

        
    }
};


/**
 * Returns the order matching a given id
 * 
 * @param {integer} id id to lookup
 * @returns Product associated with id or false in none found.
 */
exports.getOrderById = async function( id ) {
    const text = "SELECT * FROM orders WHERE order_id = $1";
    const values = [ id ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return Order.ormOrder( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Retrieve all orders for a particular user that are currently acvite from the database
 * @returns All active products or false if none are found
 */
exports.getOrdersByUserId = async function( userId ) {
    const text = "SELECT * FROM orders WHERE user_id = $1";
    const values = [ userId ];

    let orders = [];
    
    try {
         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            orders.push( Order.ormOrder( res.rows[i] ) );
        }
        
        return orders;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};


/**
 * This is the authorative source on which roles qualify for user membership.  Currently Administrators and Founders.
 * @param {User (built by session creation)} userWithRoles 
 * @returns 
 */
exports.verifyUserCodeBotPurchase = async function( user ) {
    if( user ) {
        // get user orders
        const orders = await exports.getOrdersByUserId( user.userId );

        // get all products ordered
        let products = [];
        for( let i=0; i<orders.length; i++ ) {
            let product = await exports.getProductById( orders[i].productId );
            if( product.productName == "Code Bot 3π+ Kit" ) {
                return true;
            }
            
        }
        return false;
    }
    else {
        return false;
    }

};

/**
 * Retrieve all products that are currently acvite from the database
 * @returns All active products or false if none are found
 */
exports.getAllActiveProducts = async function() {
    const text = "SELECT * FROM products WHERE active = $1";
    const values = [ true ];

    let products = [];
    
    try {
         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            products.push( Product.ormProduct( res.rows[i] ) );
        }
        
        return products;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};

exports.getAllProductsWithImages = async function() {
    const text = "SELECT * FROM products WHERE active = $1";
    const values = [ true ];

    let products = [];
    
    try {
         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            let product = Product.ormProduct( res.rows[i] );
            product.images = await exports.getAllActiveProductImageForProductById( product.productId );
            products.push( product );
        }

        return products;
        
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
};


exports.getAllActviteTokenAndMembershipProductsWithImages = async function() {
    const text = "SELECT * FROM products WHERE active = $1 AND (product_type = 'membership' OR product_type = 'topic_access');";
    const values = [ true ];

    let products = [];
    
    try {
         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            let product = Product.ormProduct( res.rows[i] );
            product.images = await exports.getAllActiveProductImageForProductById( product.productId );
            products.push( product );
                
        }

        return products;
        
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }
    
};

/**
 * Returns the product matching a given stripePriceId returned with stripe session
 * Note: This means that there should only be one row for each product with a particular stripe price id. 
 * If a new row is created for a existing product a new stripe price id should be generated and used!
 * @param {String} stripePriceId Stripe price id to lookup
 * @returns Product associated with stripe price id or false in none found.
 */
exports.getProductByStripePriceId = async function( stripePriceId ) {
    const text = "SELECT * FROM products WHERE stripe_price_id = $1";
    const values = [ stripePriceId ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return Product.ormProduct( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Returns the product matching a given id
 * 
 * @param {integer} id id to lookup
 * @returns Product associated with id or false in none found.
 */
exports.getProductById = async function( id ) {
    const text = "SELECT * FROM products WHERE product_id = $1";
    const values = [ id ];
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            return Product.ormProduct( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
    }
};

/**
 * Returns an active product by the product id and includes the associated images for the product
 * @param {integer} productId 
 * @returns product complete with images (if available) or false if product id not found. 
 */
exports.getActiveProductWithProductImagesById = async function( productId ) {
    
    const text = "SELECT * FROM products WHERE active = $1 AND product_id = $2";
    const values = [ true, productId ];
    let product = null;
    
    try {
         
        let res = await db.query( text, values );
        
        if( res.rows.length > 0 ) {
            product = Product.ormProduct( res.rows[0] );
        }
        else {
            return false;
        }
    }
    catch( e ) {
        console.log( e.stack );
        return false;
    }

    // if there is a product, get the images
    if( product ) {
        let productImages = await exports.getAllActiveProductImageForProductById( product.productId );
        // attach the images to the product array
        if( productImages ) {
            product.images = productImages;
        }
    }
    return product;
};

/**
 * Retrieve all product images for product that are currently acvite from the database
 * @returns All active productImages for Product or false if none are found
 */
exports.getAllActiveProductImageForProductById = async function( productId ) {
    const text = "SELECT * FROM product_images WHERE active = $1 AND product_id = $2";
    const values = [ true, productId ];

    let productImages = [];
    
    try {
         
        let res = await db.query( text, values );
        
        
        for( let i=0; i<res.rows.length; i++ ) {
            productImages.push( ProductImage.ormProductImage( res.rows[i] ) );
        }

        return productImages;
        
    }
    catch( e ) {
        console.log( e.stack );
    }
};
