/**
 * Agora - Close the loop
 * © 2021-2023 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 */

function product( productType, productName, productDescription1, productDescription2, productPurchaseText, stripeProductId, stripePriceId, price, productUrl, productStaticImage ) {
    this.productId = -1;
    this.productType = productType;
    this.productName = productName;
    this.productDescription1 = productDescription1;
    this.productDescription2 = productDescription2;
    this.productPurchaseText = productPurchaseText;
    this.stripeProductId = stripeProductId;
    this.stripePriceId = stripePriceId;
    this.price = price;
    this.productUrl = productUrl;
    this.productStaticImage = productStaticImage;
    this.active = true;
    this.images = [];
}

exports.emptyProduct = () => {
    return new product();
};

exports.createProduct = function ( productType, productName, productDescription1, productDescription2, productPurchaseText, stripeProductId, stripePriceId, price, productUrl, productStaticImage ) {
    let newProduct = new product( productType, productName, productDescription1, productDescription2, productPurchaseText, stripeProductId, stripePriceId, price, productUrl, productStaticImage );
    newProduct.productId = -1;
    return newProduct;
};

exports.ormProduct = function ( productRow ) {
    let product = exports.emptyProduct();
    product.productId = productRow.product_id;
    product.productType = productRow.product_type;
    product.productName = productRow.product_name;
    product.productDescription1 = productRow.product_description_1;
    product.productDescription2 = productRow.product_description_2;
    product.productPurchaseText = productRow.product_purchase_text;
    product.stripeProductId = productRow.stripe_product_id;
    product.stripePriceId = productRow.stripe_price_id;
    product.price = productRow.price;
    product.productUrl = productRow.product_url;
    product.productStaticImage = productRow.product_static_image;
    product.active = productRow.active;
    return product;
};
