const APIError = require('../../rest').APIError;
const products = require('../../products');

module.exports = {
    'GET /api/products': async ctx => {
        ctx.rest({
            products: products.getProducts()
        });
    },
    'POST /api/products': async ctx => {
        let body = ctx.request.body;
        let p = products.createProduct(body.name, body.manufacturer, body.price);
        ctx.rest(p);
    },
    'DELETE /api/products/:id': async ctx => {
        console.log(`delete product ${ctx.params.id}`);
        let p = products.deleteProduct(ctx.params.id);
        if (p) {
            ctx.rest(p);
        } else {
            throw new APIError('product:not_found', 'product not found by id.');
        }
    }
};