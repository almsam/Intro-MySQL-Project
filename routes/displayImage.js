const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let id = req.query.id;
    let idVal = parseInt(id);
    if (isNaN(idVal)) {
        res.end();
        return;
    }

    try {
        let pool = await sql.connect(dbConfig);

        let sqlQuery = "select productName, productImage from product where productId = @id";

        result = await pool.request()
            .input('id', sql.Int, idVal)
            .query(sqlQuery);

        if (result.recordset.length === 0) {
            console.log("No image record");
            res.end();
            return;
        } else {
            let productImage = result.recordset[0].productImage;

            res.write(productImage);
        }

        res.end()
    } catch(err) {
        console.dir(err);
        res.write(err + "")
        res.end();
    }
});

module.exports = router;

