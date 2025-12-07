const pool = require('./db/pool');

async function checkSchema() {
  try {
    const [columns] = await pool.query(`DESCRIBE result_workout`);
    console.log(columns.map(c => `${c.Field}: ${c.Type}`));
    process.exit();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

checkSchema();
