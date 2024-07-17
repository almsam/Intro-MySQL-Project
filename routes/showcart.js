const express = require('express');
const router = express.Router();
const { getUser } = require('../util.js');

router.get('/', function(req, res, next) {
    if (req.session.productList && req.session.productList.length != 0 && req.query.remove) {
        req.session.productList = req.session.productList.filter(p => p.id != req.query.remove);
    }

    if (req.session.productList && req.session.productList.length != 0 && req.query.id && req.query.inc) {
        req.session.productList = req.session.productList.map(p => {
            if (p.id == req.query.id) {
                const newQuantity = p.quantity + Number(req.query.inc);

                return newQuantity === 0 ? null : {...p, quantity: p.quantity + Number(req.query.inc)};
            }

            return p;
        }).filter(p => p !== null);
    }

    let content;
    if (req.session.productList && req.session.productList.length != 0) {
        req.session.productList = req.session.productList.filter(p => p);

        const productList = req.session.productList;

        content = `
            <table>
                <tr>
                    <th>Product ID</th>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Quantity</th>
                </tr>
                ${productList.map(product => `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.name}</td>
                        <td>$${Number(product.price).toFixed(2)}</td>
                        <td>
                            <a href='/showcart?${(new URLSearchParams({id: product.id, inc: -1})).toString()}'>-</a>&nbsp;
                            ${product.quantity}&nbsp;
                            <a href='/showcart?${(new URLSearchParams({id: product.id, inc: 1})).toString()}'>+</a>
                        </td>
                        <td align='right'><a href='/showcart?remove=${product.id}'>Delete</a></td>
                    </tr>
                `).join('\n')}
            </table>

            <p>
                <a href='/checkout'>Checkout</a>
            </p>
        `;
    } else{
        content = `
            <p>
                Your shopping cart is empty!
            </p>
        `;
    }
    res.render('layouts/main', {
        title: 'Your Shopping Cart',
        loggedIn: true,
        user: getUser(req),
        spacer: true,
        content: `
        <h1>Your Shopping Cart</h1>

        ${content}

        <p>
            <a href='/listprod'>Continue Shopping</a>
        </p>`,
    });
});

module.exports = router;
