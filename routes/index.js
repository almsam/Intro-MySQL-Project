const express = require('express');
const router = express.Router();
const { getUser } = require('../util.js');

// Rendering the main page
router.get('/', function (req, res) {
    console.log(getUser(req));
    res.render('layouts/main', {
        title: "Nat & Sami's Rare Earth Metals",
        loggedIn: getUser(req) != null,
        user: getUser(req),

        content: `
            <form action='/listprod' class="product-search-container">
                <div class="product-search">
                    <h1 align="center">Nat &amp; Sami's Rare Earth Metals</h1>
                    <input type='text' name='productName' id='productNameInput' placeholder="Find what you're looking for..."/><br>
                    <input type='submit' value='Search'/>
                    <button type='button' onclick='document.getElementById("productNameInput").value = "";'>
                        Reset
                    </button>
                </div>
            </form>
        `,
    });
})

module.exports = router;

