const express = require('express');
const router = express.Router();
const { getUser } = require('../util.js');

router.get('/', function(req, res, next) {
    res.render('layouts/main', {
        title: 'Grocery Checkout Line',
        loggedIn: true,
        user: getUser(req),
        spacer: true,
        content: `
            <h1> Verify your credentials to continue. </h1>

            <form method="get" action="/order">
                <input type="text" name="userid" size="50" required placeholder="Username"><br>
                <input type="password" name="password" size="50" required placeholder="Password"><br>
                <input type="submit" value="Submit"><input type="reset" value="Reset">
            </form>
        `,
    });
});

module.exports = router;
