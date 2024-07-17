const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');
const { getUser } = require('../util.js');


router.get('/', async (req, res, next) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);

        let orderResults;

        if (getUser(req).isAdmin) {
            orderResults = await pool.request().query(`
                select o.orderId, o.orderDate, o.customerId, c.firstName, c.lastName, o.totalAmount
                    from ordersummary as o
                    left join customer as c on o.customerId = c.customerId
            `);
        } else {
            stmt = new sql.PreparedStatement(pool);
            stmt.input('customerId', sql.Int);
            await stmt.prepare(`
                select o.orderId, o.orderDate, o.customerId, c.firstName, c.lastName, o.totalAmount
                    from ordersummary as o
                    left join customer as c on o.customerId = c.customerId
                    where o.customerId = @customerId
            `);

            orderResults = await stmt.execute({customerId: getUser(req).id});
        }

        const productResults = await pool.request().query(`
            select orderId, productId, quantity, price from orderproduct
        `);

        res.render('layouts/main', {
            loggedIn: getUser(req) != null,
            user: getUser(req),
            spacer: true,
            content: `
                <!DOCTYPE html>
                <html lang='en'>
                    <head>
                        <title>Nat & Sami's Grocery Order List</title>
                    </head>
                    <body>
                        <h1>Order List</h1>
                        <table>
                            <tbody>
                                <tr>
                                    <th>Customer ID</th>
                                    <th>Order Date</th>
                                    <th>Customer ID</th>
                                    <th>Customer Name</th>
                                    <th>Total Amount</th>
                                </tr>
                                ${orderResults.recordset.map(row => {
                                    const products = productResults.recordset.filter(r => r.orderId == row.orderId);

                                    return `
                                        <tr>
                                            <td>${row.orderId}</td>
                                            <td>${row.orderDate.toDateString()}</td>
                                            <td>${row.customerId}</td>
                                            <td>${row.firstName} ${row.lastName}</td>
                                            <td>$${row.totalAmount.toFixed(2)}</td>
                                        </tr>
                                        <tr>
                                            <td colspan='5'>
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            <th>Prouct Id</th>
                                                            <th>Quantity</th>
                                                            <th>Price</th>
                                                        </tr>
                                                        ${products.map(productRow => `
                                                        <tr>
                                                            <td>${productRow.productId}</td>
                                                            <td>${productRow.quantity}</td>
                                                            <td>$${productRow.price.toFixed(2)}</td>
                                                        </tr>
                                                        `).join('\n')}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    `;
                                }).join('\n')}
                            </tbody>
                        </table>
                    </body>
                </html>
            `
        });

        pool.close();
    } catch (err) {
        res.send(err.toString());
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }

});

module.exports = router;
