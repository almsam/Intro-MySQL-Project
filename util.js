const sql = require('mssql');

module.exports.htmlPage = (body, title='Nat & Sami\'s Grocery Services') => `
  <!DOCTYPE html>
  <html lang='en'>
    <head>
      <title>${title}</title>
    </head>
    <body>
      ${body}
    </body>
  </html>
`;

module.exports.getUser = (req) => {
  return req.session.user;
};

module.exports.getCustomerRecord = async (pool, id) => {
  let stmt;
  try {
    stmt = new sql.PreparedStatement(pool);
    stmt.input('id', sql.Int);
    await stmt.prepare(`
        select * from customer where customerId = @id
    `);
    const results = await stmt.execute({id: id});

    return results.recordset[0];
  } catch (err) {
    console.error(err);
    return null;
  } finally {
    if (stmt) stmt.unprepare();
  }
};
