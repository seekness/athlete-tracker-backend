const mysql = require("mysql2/promise");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "athlete_tracker",
};

async function updateDb() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log("Connected to database.");

    // Check if columns exist
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM test_exercises LIKE 'default_value'"
    );

    if (columns.length === 0) {
      console.log("Adding default_value and default_unit columns to test_exercises...");
      await connection.query(`
        ALTER TABLE test_exercises
        ADD COLUMN default_value VARCHAR(255) DEFAULT NULL,
        ADD COLUMN default_unit VARCHAR(50) DEFAULT NULL
      `);
      console.log("Columns added successfully.");
    } else {
      console.log("Columns already exist.");
    }

  } catch (error) {
    console.error("Error updating database:", error);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateDb();
