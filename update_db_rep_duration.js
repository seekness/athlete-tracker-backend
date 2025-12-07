const dbPool = require("./db/pool");

async function runMigration() {
  const connection = await dbPool.getConnection();
  try {
    console.log("Adding rep_duration_seconds column to exercises table...");
    
    // Check if column exists first to avoid errors on re-run
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM exercises LIKE 'rep_duration_seconds'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE exercises
        ADD COLUMN rep_duration_seconds INT DEFAULT NULL COMMENT 'Vreme trajanja jednog ponavljanja u sekundama'
      `);
      console.log("Column rep_duration_seconds added successfully.");
    } else {
      console.log("Column rep_duration_seconds already exists.");
    }

    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

runMigration();
