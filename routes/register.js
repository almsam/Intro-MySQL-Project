const express = require('express');
const router = express.Router();
const sql = require('mssql');
const { getUser } = require('../util.js');

router.get('/', async (req, res) => {

    if (getUser(req) != null) {
        res.redirect('/');
    }

    res.render('layouts/main', {
            title: 'Register',
        content: `
<div style="margin:0 auto;text-align:center;display:inline">

    <h1>Register</h1>

    <br>
    <form method=post action="/register">
        <table style="display:inline">
            <tr>
                <td>
                    <div align="right">
                        <label for="firstName">First name:</label>
                    </div>
                </td>
                <td><input type="text" name="firstName" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="lastName">Last name:</label>
                    </div>
                </td>
                <td><input type="text" name="lastName" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="email">Email:</label>
                    </div>
                </td>
                <td><input type="email" name="email" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="phonenum">Phone Number:</label>
                    </div>
                </td>
                <td><input type="tel" name="phonenum" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="address">Address:</label>
                    </div>
                </td>
                <td><input type="text" name="address" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="city">City:</label>
                    </div>
                </td>
                <td><input type="text" name="city" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="state">State:</label>
                    </div>
                </td>
                <td><input type="text" name="state" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="country">Country:</label>
                    </div>
                </td>
                <td><input type="text" name="country" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="postalCode">postalCode:</label>
                    </div>
                </td>
                <td><input type="text" name="postalCode" required size=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="userid">Username:</font>
                    </div>
                </td>
                <td><input type="text" name="userid" required size=10 maxlength=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <label for="password">Password:</label>
                    </div>
                </td>
                <td><input type="password" name="password" required size=10 maxlength="10"></td>
            </tr>
        </table>
        <br />

        <p>
            Already have an account?
            <a href="/login">
                Login
            </a>
        </p>

        <input class="submit" type="submit" name="Submit" value="Register">
    </form>

</div>
        `,
    });
});

router.post('/', async (req, res) => {
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
        stmt.input('password', sql.VarChar);

        await stmt.prepare(`
            insert into customer(userid, firstName, lastName, email, phonenum, address, city, state, postalCode, country, password)
                values (@userid, @firstName, @lastName, @email, @phonenum, @address, @city, @state, @postalCode, @country, @password)
        `);

        await stmt.execute({...req.body});

        res.redirect('/login');
    } catch (err) {
        console.error(err);
        res.send("Failed to register user: " + err.toString());
    } finally {
        if (stmt) stmt.unprepare();
        if (pool) pool.close();
    }
});

module.exports = router;
