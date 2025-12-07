const pool = require('./db/pool');

async function removeRecordedBy() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database.");

    // Drop recorded_by_user_id if it exists
    try {
      const [columns] = await connection.query(`SHOW COLUMNS FROM result_workout LIKE 'recorded_by_user_id'`);
      if (columns.length > 0) {
          await connection.query(`
            ALTER TABLE result_workout
            DROP FOREIGN KEY fk_result_workout_recorder;
          `);
          await connection.query(`
            ALTER TABLE result_workout
            DROP COLUMN recorded_by_user_id;
          `);
          console.log("Dropped recorded_by_user_id from result_workout.");
      } else {
          console.log("recorded_by_user_id does not exist.");
      }
    } catch (e) {
      console.error("Error dropping recorded_by_user_id:", e);
    }

    console.log("Schema update complete.");

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

removeRecordedBy();
