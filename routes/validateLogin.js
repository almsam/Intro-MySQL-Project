const express = require('express');
const router = express.Router();
const auth = require('../auth.js');
const sql = require('mssql');

router.post('/', async function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.

    let authenticatedUser = await validateLogin(req);
    console.log(authenticatedUser);
    if (authenticatedUser === false) {
        res.redirect("/login");
    } else {
        req.session.user = authenticatedUser;
        res.redirect("/");
    }
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    let username = req.body.username;
    let password = req.body.password;
    let authenticatedUser =  await (async function() {
        let pool;
        let stmt;
        try {
            pool = await sql.connect(dbConfig);

        	// TO/DO: Check if userId and password match some customer account. 
	        // If so, set authenticatedUser to be the username.

            stmt = new sql.PreparedStatement(pool);
            stmt.input('userid', sql.VarChar)
            await stmt.prepare(`select password, userid, customerId from customer where userid = @userid`);
            const queryResults = await stmt.execute({userid: req.body.username});

            if (queryResults.recordset.length === 0) {
                return false;
            }

            const foundUser = queryResults.recordset[0];

            if (foundUser.password != req.body.password) {
                return false;
            }

            return {
                username: foundUser.userid,
                isAdmin: foundUser.customerId === 1,
                id: foundUser.customerId,
            };
        } catch(err) {
            console.dir(err);
            return false;
        } finally {
            if (stmt) stmt.unprepare();
            if (pool) pool.close();
        }
    })();

    return authenticatedUser;
}

module.exports = router;

