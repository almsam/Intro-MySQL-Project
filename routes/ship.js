const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');
const { htmlPage } = require('../util.js');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

	// TO/DO: Get order id
    const orderId = req.query.orderId;

    let pool;
    let validateIdStatement;
    let fetchItemsStatement;
    let createShipmentStatement;
    let checkInventoryStatement;
    let updateInventoryStatement;
    let orderSummaryHTML;
    let tx;
    let failed = false;
    try {
        pool = await sql.connect(dbConfig);

	    // TODO: Check if valid order id
        validateIdStatement = new sql.PreparedStatement(pool);
        validateIdStatement.input('orderId', sql.Int)
        await validateIdStatement.prepare(`select * from ordersummary where orderId = @orderId`);
        const results = await validateIdStatement.execute({orderId});

        if (results.recordset.length === 0) {
            throw new Error("The order you're looking for doesn't exist!");
        }

        const order = results.recordset[0];

        // TO/DO: Start a transaction
        tx = new sql.Transaction(pool);

        await tx.begin();
   	
   	    // TO/DO: Retrieve all items in order with given id
        
        let items;

        fetchItemsStatement = new sql.PreparedStatement(tx);
        fetchItemsStatement.input('orderId', sql.Int);
        await fetchItemsStatement.prepare(`
            select * from orderproduct where orderId = @orderId
        `);

        items = (await fetchItemsStatement.execute({orderId: order.orderId})).recordset;

        await fetchItemsStatement.unprepare();
        fetchItemsStatement = false;

        orderSummaryHTML = `
            <ul>
                ${items.map(item =>`
                    <li>
                        ${item.quantity} units of product ${item.productId}
                    </li>
                `).join('\n')}
            <ul>
        `;

   	    // TO/DO: Create a new shipment record.
        createShipmentStatement = new sql.PreparedStatement(tx);
        createShipmentStatement.input('shipmentDesc', sql.VarChar);
        createShipmentStatement.input('warehouseId', sql.Int);
        await createShipmentStatement.prepare(`
            insert into shipment(shipmentDate, shipmentDesc, warehouseId)
                output inserted.shipmentId
                values (getdate(), @shipmentDesc, @warehouseId)
        `);

        const shipmentResults = await createShipmentStatement.execute({
            shipmentDate: Date.now(),
            shipmentDesc: order.orderId + "",
            warehouseId: 1,
        });

        await createShipmentStatement.unprepare();
        createShipmentStatement = false;
        
        for (const item of items) {
   	        // TO/DO: For each item verify sufficient quantity available in warehouse 1.
            checkInventoryStatement = new sql.PreparedStatement(tx);
            checkInventoryStatement.input('productId', sql.Int);
            await checkInventoryStatement.prepare(`
                select * from productinventory
                    where productId = @productId and warehouseId = 1
            `);

            const inventoryResults = await checkInventoryStatement.execute({productId: item.productId});
            const inventory = inventoryResults.recordset[0];

            await checkInventoryStatement.unprepare();
            checkInventoryStatement = false;

       	    // TO/DO: If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.
            if (inventory.quantity < item.quantity) {
                let err = new Error('Insufficient inventory');
                err.inventory = true;
                err.productId = item.productId;
                err.orderId = item.orderId;
                throw err;
            } else {
                updateInventoryStatement = new sql.PreparedStatement(tx);
                updateInventoryStatement.input('productId', sql.Int);
                updateInventoryStatement.input('amount', sql.Int);
                await updateInventoryStatement.prepare(`
                    update productinventory set quantity = (quantity - @amount) where productId = @productId
                `);

                await updateInventoryStatement.execute({productId: item.productId, amount: item.quantity});

                await updateInventoryStatement.unprepare();
                updateInventoryStatement = false;
            }
        }

        tx.commit();

        res.send(htmlPage(`
            <h1>Order ${order.orderId} shipped!</h1>
            <p><strong>Tracking number:</strong> ${shipmentResults.recordset[0].shipmentId}</p>

            <h2>Order Summary:</h2>
            ${orderSummaryHTML}
            <p>
                <a href="/">Return to main page</a>
            </p>
        `, `Shipment`));
    } catch(err) {
        console.dir(err);
        failed = true;
        if (err.inventory) {
            res.send(htmlPage(`
                <h1>Order ${err.orderId} was not shipped</h1>
                <p>
                    Shipment unsuccessful. Insufficient inventory for product ID: ${err.productId}
                </p>

                <h2>Order Summary:</h2>
                ${orderSummaryHTML || "Nothing to show"}

                <p>
                    <a href="/">Return to main page</a>
                </p>
            `, `Shipment`));
        } else {
            res.write(err + "")
            res.end();
        }
    } finally {
        if (validateIdStatement) await validateIdStatement.unprepare();
        if (fetchItemsStatement) await fetchItemsStatement.unprepare();
        if (createShipmentStatement) await createShipmentStatement.unprepare();
        if (checkInventoryStatement) await checkInventoryStatement.unprepare();
        if (updateInventoryStatement) await updateInventoryStatement.unprepare();
        if (failed) tx.rollback();
        if (pool) pool.close();
    }
});

module.exports = router;

