const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const { getUser } = require('../util.js');
const multer  = require('multer');
const storage = multer.memoryStorage();
const uploadFile = multer({ dest: 'public/img' });
const uploadDB = multer({ storage });

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    if (!req.session.user.isAdmin) {
        res.send(htmlPage(`
            <p>404: Not Found</p>
        `, `404: Not Found`));
        return;
    }

    let pool;
    try {
        let pool = await sql.connect(dbConfig);
	    // TO/DO: Write SQL query that prints out total order amount by day
        let results = await pool.request().query(`
            select cast(orderDate as date) as dateOfOrder, sum(totalAmount) as valueOfOrders
                from ordersummary
                group by cast(orderDate as date)
        `);

        const chartData = JSON.stringify({
            type: 'bar',
            data: {
                labels: results.recordset.map(r => r.dateOfOrder),
                datasets: [{
                    label: 'Income',
                    data: results.recordset.map(r => r.valueOfOrders),
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        res.render('layouts/main', {
            loggedIn: getUser(req) != null,
            user: getUser(req),
            spacer: true,
            content: `
                <h1>Administrator Panel</h2>

                <ul>
                    <li>
                        <a href="/admin/listCustomers">
                            Customer Directory
                        </a>
                    </li>
                    <li>
                        <a href="/admin/addProduct">
                            Add New Product
                        </a>
                    </li>
                    <li>
                        <a href="/admin/productDirectory">
                            Edit Products
                        </a>
                    </li>
                </ul>

                <h2> Fulfill an order </h2>
                <form method="get" action="/ship">
                    <input type="number" name="orderId" placeholder="Order#"><br>
                    <input type="submit">
                </form>

                <h2>Sales By Day</h2>

                <table>
                    <tbody>
                        <tr>
                            <th>Order Date</th>
                            <th>Income</th>
                        </tr>
                        ${results.recordset.map(row =>`
                            <tr>
                                <td>${(new Date(row.dateOfOrder)).toDateString()}</td>
                                <td>$${Number(row.valueOfOrders).toFixed(2)}</td>
                            </tr>
                        `).join("\n")}
                    </tbody>
                </table>

                <div>
                    <canvas id="salesChart"></canvas>
                </div>

                <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

                <script>
                    const chart = document.getElementById("salesChart");
                    const chartData = JSON.parse('${chartData}');
                    console.log(chartData);
                    new Chart(chart, chartData);
                </script>
            `,
        });

    } catch(err) {
        console.dir(err);
        res.write(err + "");
        res.end();
    } finally {
        if (pool) pool.close();
    }
});

router.get('/listCustomers', async (req, res) => {
    let pool;
    try {
        let pool = await sql.connect(dbConfig);
        let customers = (await pool.request().query(`
            select * from customer
        `)).recordset;

        res.render('layouts/main', {
            title: 'Registered Customers',
            loggedIn: getUser(req) != null,
            user: getUser(req),
            spacer: true,
            content: `
                <h1> Customer Directory </h1>
                <table>
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Username</th>
                            <th>Email</th>
                        </tr>
                        ${customers.map(customer =>`
                            <tr>
                                <td>
                                    ${customer.firstName} ${customer.lastName}
                                </td>
                                <td>
                                    ${customer.userid}
                                </td>
                                <td>
                                    ${customer.email}
                                </td>
                                <td>
                                    ${customer.password}
                                </td>
                            </tr>
                        `).join("\n")}
                    </tbody>
                </table>
            `,
        });
    } catch (err) {
        console.error(err);
        res.send("Unable to retrieve customer list");
    } finally {
        if (pool) pool.close();
    }
});

router.get('/productDirectory', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const products = (await pool.request().query(`
            select * from product
        `)).recordset;

        res.render('layouts/main', {
            title: 'Admin Product Directory',
            spacer: true,
            loggedIn: true,
            user: getUser(req),
            content: `
                <h1> Admin Product Directory </h1>
                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                        </tr>
                        ${products.map(p => `
                            <tr>
                                <td>${p.productId}</td>
                                <td>${p.productName}</td>
                                <td>
                                    <a href="/admin/productUpdate?id=${p.productId}">
                                        Update
                                    </a>
                                </td>
                                <td>
                                    <a href="/admin/productAddImage?id=${p.productId}">
                                        Add Image
                                    </a>
                                </td>
                                <td>
                                    <a href="/admin/productDelete?id=${p.productId}">
                                        X
                                    </a>
                                </td>
                            </tr>
                        `).join('\n')}
                    </tbody>
                </table>
            `,
        });
    } catch (err) {
        res.send("Could not retrieve categories: " + err.toString());
        console.error(err);
    } finally {
        if (pool) pool.close();
    }
});

router.get('/productDelete', async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('productId', sql.VarChar);
        await stmt.prepare(`
            delete from product where productId = @productId
        `);

        await stmt.execute({productId: req.query.id});
        res.redirect('/admin/productDirectory');

    } catch (err) {
        res.send("Could not retrieve categories: " + err.toString());
        console.error(err);
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

router.get('/productUpdate', async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('productId', sql.VarChar);

        await stmt.prepare(`
            select * from product where productId = @productId
        `);

        const product = (await stmt.execute({productId: req.query.id})).recordset[0];

        const categories = (await pool.request().query(`
            select * from category
        `)).recordset;

        res.render('layouts/main', {
            title: 'Add a New Product',
            loggedIn: true,
            user: getUser(req),
            spacer: true,
            content: `
                <h1>Update Product</h1>
                <form method="post" action="/admin/productUpdate?id=${product.productId}">
                    <label for="productName">Name: </label>
                    <input type="text" name="productName" value="${product.productName}" required><br>

                    <label for="productPrice">Price: </label>
                    <input type="number" name="productPrice" value="${product.productPrice}" required><br>

                    <label for="categoryId">Category: </label>
                    <select name="categoryId">
                        ${categories.map(cat =>`
                            <option value="${cat.categoryId}" ${cat.categoryId == product.categoryId ? 'selected="selected"' : ''}>${cat.categoryName}</option>
                        `).join("\n")}
                    </select><br>

                    <label for="productDesc">Description: </label><br>
                    <textarea name="productDesc">${product.productDesc}</textarea><br>

                    <input type="submit" value="Submit">
                </form>
            `,
        });
    } catch (err) {
        res.send("Could not retrieve data: " + err.toString());
        console.error(err);
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

router.post('/productUpdate', async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);

        stmt = new sql.PreparedStatement(pool);
        stmt.input('productName', sql.VarChar);
        stmt.input('productPrice', sql.Decimal(10, 2));
        stmt.input('productDesc', sql.VarChar);
        stmt.input('categoryId', sql.Int);
        stmt.input('productId', sql.Int);

        await stmt.prepare(`
            update product set
                productName = @productName,
                productPrice = @productPrice,
                productDesc = @productDesc,
                categoryId = @categoryId
                where productId = @productId
        `);

        console.log(req.query.id);
        await stmt.execute({...req.body, productId: req.query.id});

        res.redirect(`/admin/productDirectory`);
    } catch (err) {
        console.error(err);
        res.send("Could not add product: " + err.toString());
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

router.get('/productAddImage', async (req, res) => {
    res.render('layouts/main', {
        title: 'Add a New Product',
        loggedIn: true,
        user: getUser(req),
        spacer: true,
        content: `
            <h1> Add an image to this product</h1>
            <form onsubmit="onSubmit(event)" id="imageForm">
                <label for="productImage">Image: </label>
                <input type="file" name="productImage" id="fileInput"><br>

                <p>
                    Save this file in:
                </p>

                <input type="radio" id="storeFile" name="storageLocation" value="file" checked>
                <label for="storeFile">The filesystem</label><br>

                <input type="radio" id="storeDB" name="storageLocation" value="db">
                <label for="storeDB">The DB</label><br>

                <input type="submit" value="Submit">
            </form>

            <script>
                function onSubmit(e) {
                    e.preventDefault();
                    const storageLocation = document.querySelector('input[name="storageLocation"]:checked').value;

                    const input = document.getElementById('fileInput');
                    let dest = 'productAddDBImage';
                    if (storageLocation == "file") {
                        dest = 'productAddFileImage';
                    }

                    const data = new FormData(document.getElementById("imageForm"));
                    
                    fetch('/admin/' + dest + '?id=' + ${req.query.id}, {
                        method: 'POST',
                        body: data
                    }).then(res => {
                        window.location = "/admin/productDirectory";
                    });

                    return false;
                } 
            </script>
        `,
    });
});

router.post('/productAddFileImage', uploadFile.single('productImage'), async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('productId', sql.Int);
        stmt.input('productImageURL', sql.VarChar);

        await stmt.prepare(`
            update product set
                productImageURL = @productImageURL
                where productId = @productId
        `);

        await stmt.execute({productId: req.query.id, productImageURL: `img/${req.file.filename}`});
        res.redirect('/admin/productDirectory');
    } catch (err) {
        res.send("Could not update product: " + err.toString());
        console.error(err);
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

router.post('/productAddDBImage', uploadDB.single('productImage'), async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);
        stmt = new sql.PreparedStatement(pool);
        stmt.input('productId', sql.Int);
        stmt.input('productImage', sql.VarBinary);

        await stmt.prepare(`
            update product set
                productImage = @productImage
                where productId = @productId
        `);

        await stmt.execute({productId: req.query.id, productImage: req.file.buffer});
        res.redirect('/admin/productDirectory');
    } catch (err) {
        res.send("Could not update product: " + err.toString());
        console.error(err);
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

router.get('/addProduct', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const categories = (await pool.request().query(`
            select * from category
        `)).recordset;

        res.render('layouts/main', {
            title: 'Add a New Product',
            loggedIn: true,
            user: getUser(req),
            spacer: true,
            content: `
                <h1>Add a New Product</h1>
                <form method="post" action="/admin/addProduct" enctype="multipart/form-data">
                    <label for="productName">Name: </label>
                    <input type="text" name="productName" required><br>

                    <label for="productPrice">Price: </label>
                    <input type="number" name="productPrice" required><br>

                    <label for="categoryId">Category: </label>
                    <select name="categoryId">
                        ${categories.map(cat =>`
                            <option value="${cat.categoryId}">${cat.categoryName}</option>
                        `).join("\n")}
                    </select><br>

                    <label for="productImage">Image: </label>
                    <input type="file" name="productImage"><br>

                    <label for="productDesc">Description: </label><br>
                    <textarea name="productDesc"></textarea><br>

                    <input type="submit" value="Submit">
                </form>
            `,
        });
    } catch (err) {
        res.send("Could not retrieve categories: " + err.toString());
        console.error(err);
    } finally {
        if (pool) pool.close();
    }
});

router.post('/addProduct', uploadDB.single('productImage'), async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);

        stmt = new sql.PreparedStatement(pool);
        stmt.input('productName', sql.VarChar);
        stmt.input('productPrice', sql.Decimal(10, 2));
        stmt.input('productDesc', sql.VarChar);
        stmt.input('categoryId', sql.Int);

        stmt.input('image', sql.VarBinary);
        await stmt.prepare(`
            insert into product(productName, productPrice, productDesc, productImage, categoryId)
                output inserted.productId
                values (@productName, @productPrice, @productDesc, @image, @categoryId)
        `);

        const recordToInsert = {
            ...req.body,
            image: req.body.storageLocation == "file" ? `img/${req.file.filename}` : req.file.buffer,
        };

        const stmtResults = await stmt.execute(recordToInsert);

        res.redirect(`/product/?id=${stmtResults.recordset[0].productId}`);
    } catch (err) {
        console.error(err);
        res.send("Could not add product: " + err.toString());
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

module.exports = router;
