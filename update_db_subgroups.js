const dbPool = require("./db/pool");

async function migrate() {
  const connection = await dbPool.getConnection();
  try {
    await connection.beginTransaction();

    console.log("Creating 'muscle_sub_groups' table...");
    await connection.query(`
      CREATE TABLE IF NOT EXISTS muscle_sub_groups (
        id INT AUTO_INCREMENT PRIMARY KEY,
        muscle_group_id INT NOT NULL,
        naziv VARCHAR(255) NOT NULL,
        opis TEXT,
        FOREIGN KEY (muscle_group_id) REFERENCES muscle_groups(id) ON DELETE CASCADE
      )
    `);

    console.log("Adding 'muscle_sub_group_id' to 'exercise_muscle_groups'...");
    // Check if column exists first
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME FROM information_schema.COLUMNS 
      WHERE TABLE_NAME = 'exercise_muscle_groups' AND COLUMN_NAME = 'muscle_sub_group_id' AND TABLE_SCHEMA = DATABASE()
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE exercise_muscle_groups
        ADD COLUMN muscle_sub_group_id INT DEFAULT NULL,
        ADD CONSTRAINT fk_emg_subgroup FOREIGN KEY (muscle_sub_group_id) REFERENCES muscle_sub_groups(id) ON DELETE CASCADE
      `);
    } else {
      console.log("Column 'muscle_sub_group_id' already exists.");
    }

    // Optional: Insert some default sub-groups if table is empty
    const [subGroups] = await connection.query("SELECT COUNT(*) as count FROM muscle_sub_groups");
    if (subGroups[0].count === 0) {
        console.log("Seeding initial sub-groups...");
        // Get IDs for common groups
        const [groups] = await connection.query("SELECT id, naziv FROM muscle_groups");
        const groupMap = {};
        groups.forEach(g => groupMap[g.naziv] = g.id);

        const seeds = [];
        if (groupMap['Leđa']) {
            seeds.push([groupMap['Leđa'], 'Latisimus', 'Široki leđni mišić']);
            seeds.push([groupMap['Leđa'], 'Trapezius', 'Gornji deo leđa']);
            seeds.push([groupMap['Leđa'], 'Donja leđa', 'Erector spinae']);
        }
        if (groupMap['Grudi']) {
            seeds.push([groupMap['Grudi'], 'Gornje grudi', 'Clavicular head']);
            seeds.push([groupMap['Grudi'], 'Srednje grudi', 'Sternal head']);
            seeds.push([groupMap['Grudi'], 'Donje grudi', 'Abdominal head']);
        }
        if (groupMap['Ramena']) {
            seeds.push([groupMap['Ramena'], 'Prednje rame', 'Anterior deltoid']);
            seeds.push([groupMap['Ramena'], 'Srednje rame', 'Lateral deltoid']);
            seeds.push([groupMap['Ramena'], 'Zadnje rame', 'Posterior deltoid']);
        }
        if (groupMap['Noge'] || groupMap['Kvadriceps']) { // Assuming Kvadriceps is a main group based on previous context
             const legId = groupMap['Noge'] || groupMap['Kvadriceps'];
             seeds.push([legId, 'Vastus Lateralis', '']);
             seeds.push([legId, 'Vastus Medialis', '']);
             seeds.push([legId, 'Rectus Femoris', '']);
        }

        if (seeds.length > 0) {
            await connection.query("INSERT INTO muscle_sub_groups (muscle_group_id, naziv, opis) VALUES ?", [seeds]);
        }
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
