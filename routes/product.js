const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getUser } = require('../util.js');

router.get('/', async function(req, res, next) {
    // Get product name to search for
    const productId = req.query.id;

    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('productId', sql.Int);

    	// TO/DO: Retrieve and display info for the product
        await stmt.prepare(`
            select * from product
                join category on product.categoryId = category.categoryId
                where productId = @productId
        `);

        const product = (await stmt.execute({productId})).recordset[0];
        console.log(product);

        if (!product) {
            throw new Error('Product not found!');
        }
    
    	// TO/DO: If there is a productImageURL, display using IMG tag
    	// TO/DO: Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
        
        let imageUrl;

        if (product.productImageURL) {
            imageUrl = product.productImageURL;
        } else {
            imageUrl = `/displayImage?id=${productId}`;
        }
    
    	// TO/DO: Add links to Add to Cart and Continue Shopping
        
        res.render('layouts/main', {
            title: product.productName,
            loggedIn: true,
            user: getUser(req),
            spacer: true,
            content: `
            <h1>${product.productName}</h1>

            <img src='${imageUrl}' alt='${product.productName}'>
            <p>
                <strong>Category:</strong> ${product.categoryName}
            </p>
            <p>
                ${product.productDesc}
            </p>
            <p>
                <strong>Price:</strong> $${Number(product.productPrice).toFixed(2)}
            </p>

            <ul>
                <li>
                    <a href="/addcart?${(new URLSearchParams({id: product.productId, name: product.productName, price: product.productPrice})).toString()}">
                        Add to Cart
                    </a>
                </li>
                <li>
                    <a href="/listprod">Continue Shopping</a>
                </li>
            </ul>
            `,
        });
    } catch(err) {
        console.dir(err);
        res.write(err + "")
        res.end();
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

module.exports = router;

