const dbPool = require("../db/pool");

async function getCategories() {
  const [rows] = await dbPool.query(
    "SELECT * FROM exercise_categories ORDER BY naziv ASC"
  );
  return rows;
}

async function insertCategory({ naziv, opis }) {
  const [result] = await dbPool.query(
    "INSERT INTO exercise_categories (naziv, opis) VALUES (?, ?)",
    [naziv, opis]
  );
  return result.insertId;
}

async function updateCategoryById(id, { naziv, opis }) {
  await dbPool.query(
    "UPDATE exercise_categories SET naziv = ?, opis = ? WHERE id = ?",
    [naziv, opis, id]
  );
}

async function deleteCategoryById(id) {
  await dbPool.query("DELETE FROM exercise_categories WHERE id = ?", [id]);
}

module.exports = {
  getCategories,
  insertCategory,
  updateCategoryById,
  deleteCategoryById
};