const dbPool = require("../db/pool");

async function fetchMuscleGroups() {
  const [rows] = await dbPool.query("SELECT * FROM muscle_groups ORDER BY naziv ASC");
  return rows;
}

module.exports = { fetchMuscleGroups };