const express = require('express');
const router = express.Router();
const sql = require('mssql');
const fs = require('fs');

const dbConfigWithoutDB = {
  server: 'cosc304_sqlserver',
  authentication: {
      type: 'default',
      options: {
          userName: 'sa',
          password: '304#sa#pw'
      }
  },
  options: {
    encrypt: false,
    enableArithAbort:false,
  }
}

router.get('/', function(req, res, next) {
    (async function() {
        try {
            let pool = await sql.connect(dbConfigWithoutDB);

            res.setHeader('Content-Type', 'text/html');
            res.write('<title>Data Loader</title>');
            res.write('<h1>Connecting to database.</h1><p>');

            let data = fs.readFileSync("./ddl/SQLServer_orderdb.ddl", { encoding: 'utf8' });
            let commands = data.split(";");
            for (let i = 0; i < commands.length; i++) {
                let command = commands[i];
                let result = await pool.request()
                    .query(command);
                res.write('<p>' + JSON.stringify(result) + '</p>')
            }

            res.write('"<h2>Database loading complete!</h2>')
            res.end()
        } catch(err) {
            console.dir(err);
            res.send(err)
        }
    })();
});

module.exports = router;
