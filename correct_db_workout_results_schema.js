const pool = require('./db/pool');

async function correctSchema() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("Connected to database.");

    // 1. Drop athlete_id if it exists
    try {
      // Check if column exists first to avoid error? Or just try DROP.
      // MySQL DROP COLUMN throws if not exists.
      const [columns] = await connection.query(`SHOW COLUMNS FROM result_workout LIKE 'athlete_id'`);
      if (columns.length > 0) {
          await connection.query(`
            ALTER TABLE result_workout
            DROP FOREIGN KEY fk_result_workout_athlete;
          `);
          await connection.query(`
            ALTER TABLE result_workout
            DROP COLUMN athlete_id;
          `);
          console.log("Dropped athlete_id from result_workout.");
      } else {
          console.log("athlete_id does not exist.");
      }
    } catch (e) {
      console.error("Error dropping athlete_id:", e);
    }

    // 2. Ensure recorded_by_user_id exists
    try {
       const [columns] = await connection.query(`SHOW COLUMNS FROM result_workout LIKE 'recorded_by_user_id'`);
       if (columns.length === 0) {
          await connection.query(`
            ALTER TABLE result_workout
            ADD COLUMN recorded_by_user_id INT NULL,
            ADD CONSTRAINT fk_result_workout_recorder FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE SET NULL;
          `);
          console.log("Added recorded_by_user_id to result_workout.");
       } else {
           console.log("recorded_by_user_id already exists.");
       }
    } catch (e) {
      console.error("Error adding recorded_by_user_id:", e);
    }

    console.log("Schema correction complete.");

  } catch (error) {
    console.error("Fatal error:", error);
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

correctSchema();
