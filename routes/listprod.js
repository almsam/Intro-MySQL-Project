const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getUser } = require('../util.js');

router.get('/', async function(req, res, next) {
    // Get the product name to search for
    let name = req.query.productName;

    let content;
    let pool;
    let stmt;

    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('name', sql.VarChar)
        await stmt.prepare(`select productId, productName, productPrice
                from product
                where productName like concat('%', @name, '%')
        `);

        const productResults = await stmt.execute({name:name});

        content = `
            <h2>All products ${name ? `matching ${name}` : ''}</h2>

            <table>
                <tbody>
                    <tr>
                        <th>Product Name</th>
                        <th>Price</th>
                    </tr>
                    ${productResults.recordset.map(row => `
                        <tr>
                            <td>
                                <a href="/product?id=${row.productId}">
                                    ${row.productName}
                                </a>
                            </td>
                            <td>$${row.productPrice.toFixed(2)}</td>
                            <td>
                                <a href='/addcart?${(new URLSearchParams({id: row.productId, name: row.productName, price: row.productPrice})).toString()}'>
                                    Add to Cart
                                </a>
                            </td>
                        </tr>
                    `).join('\n')}
                </tbody>
            </table>

            ${ productResults.length === 0 ?
                    `<p>
                        Nothing to show!
                    </p>`
                    : ''
            }
        `;

    } catch (err) {
        content = err.toString();    
        console.error(err);
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }

    res.render('layouts/main', {
        loggedIn: getUser(req) != null,
        user: getUser(req),
        spacer: true,
        content: `
            <h1>Find what you're looking for</h1>
            <form action='/listprod'>
                <div class="product-search">
                    <input type='text' name='productName' id='productNameInput' placeholder="Search..."/><br>
                    <input type='submit' value='Search'/>
                    <button type='button' onclick='document.getElementById("productNameInput").value = "";'>
                        Reset
                    </button>
                </div>
            </form>
            ${content}
        `,
    });
});

module.exports = router;
