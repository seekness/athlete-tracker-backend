const path = require("path");
const fs = require("fs");
const dbPool = require("../db/pool");

async function fetchMuscleGroups() {
  const [rows] = await dbPool.query("SELECT * FROM muscle_groups ORDER BY naziv ASC");
  return rows;
}

async function fetchMuscleGroupById(id) {
  const [rows] = await dbPool.query("SELECT * FROM muscle_groups WHERE id = ?", [id]);
  return rows[0];
}

async function insertMuscleGroup({ naziv, opis, ikona }) {
  const [result] = await dbPool.query(
    "INSERT INTO muscle_groups (naziv, opis, ikona) VALUES (?, ?, ?)",
    [naziv, opis, ikona]
  );

  return result.insertId;
}

async function updateMuscleGroupById(id, { naziv, opis, ikona }) {
  await dbPool.query(
    "UPDATE muscle_groups SET naziv = ?, opis = ?, ikona = ? WHERE id = ?",
    [naziv, opis, ikona, id]
  );
}

async function updateMuscleGroupIconPath(id, iconPath) {
  await dbPool.query("UPDATE muscle_groups SET ikona = ? WHERE id = ?", [iconPath, id]);
}

async function deleteMuscleGroupById(id) {
  const [rows] = await dbPool.query("SELECT ikona FROM muscle_groups WHERE id = ?", [id]);
  const iconPath = rows[0]?.ikona;

  if (iconPath) {
    const relativeIconPath = iconPath.startsWith("/") ? iconPath.slice(1) : iconPath;
    const fullPath = path.join(__dirname, "..", relativeIconPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }

  const [result] = await dbPool.query("DELETE FROM muscle_groups WHERE id = ?", [id]);
  return result.affectedRows > 0;
}

module.exports = {
  fetchMuscleGroups,
  fetchMuscleGroupById,
  insertMuscleGroup,
  updateMuscleGroupById,
  updateMuscleGroupIconPath,
  deleteMuscleGroupById
};