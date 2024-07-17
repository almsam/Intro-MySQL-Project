const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    if (req.session.user) {
        res.redirect('/');
    }

    res.setHeader('Content-Type', 'text/html');

    res.render('layouts/main', {
        title: "Login Screen",
        loggedIn: false,
        content: `
<div style="margin:0 auto;text-align:center;display:inline">

    <h3>Please Login to System</h3>

    <br>
    <form name="MyForm" method=post action="/validateLogin">
        <table style="display:inline">
            <tr>
                <td>
                    <div align="right">
                        <font face="Arial, Helvetica, sans-serif" size="2">Username:</font>
                    </div>
                </td>
                <td><input type="text" name="username" size=10 maxlength=10></td>
            </tr>
            <tr>
                <td>
                    <div align="right">
                        <font face="Arial, Helvetica, sans-serif" size="2">Password:</font>
                    </div>
                </td>
                <td><input type="password" name="password" size=10 maxlength="10"></td>
            </tr>
        </table>
        <br />

        <p>
            Don't have an account?
            <a href="/register">
                Register here.
            </a>
        </p>

        <input class="submit" type="submit" name="Submit2" value="Log In">
    </form>

</div>
        `,
    });
});

module.exports = router;

