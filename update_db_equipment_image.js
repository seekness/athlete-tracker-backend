const dbPool = require("./db/pool");

async function migrate() {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Checking 'equipment' table for 'slika' column...");
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'equipment' AND COLUMN_NAME = 'slika' AND TABLE_SCHEMA = DATABASE()
    `);

    if (columns.length === 0) {
      console.log("Adding 'slika' column to 'equipment' table...");
      await connection.query(`
        ALTER TABLE equipment
        ADD COLUMN slika VARCHAR(255) DEFAULT NULL
      `);
    } else {
      console.log("Column 'slika' already exists.");
    }

    await connection.commit();
    console.log("Migration completed successfully.");
  } catch (error) {
    await connection.rollback();
    console.error("Migration failed:", error);
  } finally {
    connection.release();
    process.exit();
  }
}

migrate();
