const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getUser, getCustomerRecord } = require('../util.js');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const profile = await getCustomerRecord(pool, getUser(req).id);

        res.render('layouts/main', {
            loggedIn: getUser(req) != null,
            user: getUser(req),
            spacer: true,
            content: `
                <h1>${profile.firstName} ${profile.lastName}'s Profile</h1>

                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <td>${profile.customerId}</td>
                        </tr>
                        <tr>
                            <th>Username</th>
                            <td>${profile.userid}</td>
                        </tr>
                        <tr>
                            <th>First Name</th>
                            <td>${profile.firstName}</td>
                        </tr>
                        <tr>
                            <th>Last Name</th>
                            <td>${profile.lastName}</td>
                        </tr>
                        <tr>
                            <th>email</th>
                            <td>${profile.email}</td>
                        </tr>
                        <tr>
                            <th>Phone Number</th>
                            <td>${profile.phonenum}</td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td>${profile.address}</td>
                        </tr>
                        <tr>
                            <th>City</th>
                            <td>${profile.city}</td>
                        </tr>
                        <tr>
                            <th>State</th>
                            <td>${profile.state}</td>
                        </tr>
                        <tr>
                            <th>Postal Code</th>
                            <td>${profile.postalCode}</td>
                        </tr>
                        <tr>
                            <th>Country</th>
                            <td>${profile.country}</td>
                        </tr>
                    </tbody>
                </table>

                <ul>
                    <li>
                        <a href="/listorder">
                            Show all orders
                        </a>
                    </li>
                    <li>
                        <a href="/customer/update">
                            Edit account details
                        </a>
                    </li>
                    <li>
                        <a href="/logout">
                            Log out
                        </a>
                    </li>
                </ul>
            `,
        });
    } catch(err) {
        console.dir(err);
        res.write(err + "")
        res.end();
    } finally {
        if (pool) pool.close();
    }
});

router.get('/update', async (req, res) => {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        const profile = await getCustomerRecord(pool, getUser(req).id);

        res.render('layouts/main', {
            title: 'Update your Profile',
            loggedIn: getUser(req) != null,
            user: getUser(req),
            spacer: true,
            content: `
                <h1>${profile.firstName} ${profile.lastName}'s Profile</h1>

                <form action='/customer/update' method='post'>
                <table>
                    <tbody>
                        <tr>
                            <th>ID</th>
                            <td>${profile.customerId}</td>
                        </tr>
                        <tr>
                            <th>Username</th>
                            <td>
                                <input type='text' name='userid' required minlength="2" maxlength="50" value='${profile.userid}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>First Name</th>
                            <td>
                                <input type='text' name='firstName' required minlength="2" maxlength="50" value='${profile.firstName}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>Last Name</th>
                            <td>
                                <input type='text' name='lastName' required minlength="2" maxlength="50" value='${profile.lastName}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>email</th>
                            <td>
                                <input type='email' name='email' required value='${profile.email}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>Phone Number</th>
                            <td>
                                <input type='tel' name='phonenum' required maxlength="15" value='${profile.phonenum}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>Address</th>
                            <td>
                                <input type='text' name='address' required value='${profile.address}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>City</th>
                            <td>
                                <input type='text' name='city' required value='${profile.city}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>State</th>
                            <td>
                                <input type='text' name='state' required value='${profile.state}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>Postal Code</th>
                            <td>
                                <input type='text' name='postalCode' required value='${profile.postalCode}'/>
                            </td>
                        </tr>
                        <tr>
                            <th>Country</th>
                            <td>
                                <input type='text' name='country' required value='${profile.country}'/>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <input type="submit" value="Update"/>
                <button onclick="e.preventDefault(); history.back();">
                    Cancel
                </button>
                </form>
            `,
        });
    } finally {
        if (pool) pool.close();
    }
});

router.post('/update', async (req, res) => {
    let pool;
    let stmt;
    try {
        pool = await sql.connect(dbConfig);

        stmt = new sql.PreparedStatement(pool);
        stmt.input('userid', sql.VarChar);
        stmt.input('firstName', sql.VarChar);
        stmt.input('lastName', sql.VarChar);
        stmt.input('email', sql.VarChar);
        stmt.input('phonenum', sql.VarChar);
        stmt.input('address', sql.VarChar);
        stmt.input('city', sql.VarChar);
        stmt.input('state', sql.VarChar);
        stmt.input('postalCode', sql.VarChar);
        stmt.input('country', sql.VarChar);
        stmt.input('customerId', sql.Int);

        await stmt.prepare(`
            update customer set
                userid = @userid,
                firstName = @firstName,
                lastName = @lastName,
                email = @email,
                phonenum = @address,
                city = @city,
                state = @state,
                postalCode = @postalCode,
                country = @country
                where customerId = @customerId
        `);

        await stmt.execute({...req.body, customerId: getUser(req).id});

        res.redirect('/customer');
    } catch (err) {
        console.error(err);
        res.write("Failed to update user");
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

module.exports = router;

