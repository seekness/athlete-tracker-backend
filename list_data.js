const dbPool = require('./db/pool');

async function listData() {
  try {
    const [muscleGroups] = await dbPool.query("SELECT * FROM muscle_groups");
    const [subGroups] = await dbPool.query("SELECT * FROM muscle_sub_groups");
    const [equipment] = await dbPool.query("SELECT * FROM equipment");
    const [categories] = await dbPool.query("SELECT * FROM exercise_categories");

    console.log("--- Muscle Groups ---");
    muscleGroups.forEach(mg => console.log(`${mg.id}: ${mg.naziv}`));

    console.log("\n--- Muscle Sub Groups ---");
    subGroups.forEach(sg => console.log(`${sg.id}: ${sg.naziv} (Parent: ${sg.muscle_group_id})`));

    console.log("\n--- Equipment ---");
    equipment.forEach(eq => console.log(`${eq.id}: ${eq.naziv}`));

    console.log("\n--- Categories ---");
    categories.forEach(c => console.log(`${c.id}: ${c.naziv}`));

  } catch (error) {
    console.error(error);
  } process.exit();
}

listData();
