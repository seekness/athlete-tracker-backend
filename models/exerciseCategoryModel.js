const dbPool = require("../db/pool");

async function getCategories() {
  const [rows] = await dbPool.query(
    "SELECT id, naziv, opis, ikonica FROM exercise_categories ORDER BY naziv ASC"
  );
  return rows;
}

async function getCategoryById(id) {
  const [rows] = await dbPool.query(
    "SELECT id, naziv, opis, ikonica FROM exercise_categories WHERE id = ?",
    [id]
  );
  return rows[0] || null;
}

async function insertCategory({ naziv, opis, ikonica }) {
  const [result] = await dbPool.query(
    "INSERT INTO exercise_categories (naziv, opis, ikonica) VALUES (?, ?, ?)",
    [naziv, opis, ikonica || null]
  );
  return result.insertId;
}

async function updateCategoryById(id, { naziv, opis, ikonica }) {
  await dbPool.query(
    "UPDATE exercise_categories SET naziv = ?, opis = ?, ikonica = ? WHERE id = ?",
    [naziv, opis, ikonica || null, id]
  );
}

async function deleteCategoryById(id) {
  await dbPool.query("DELETE FROM exercise_categories WHERE id = ?", [id]);
}

module.exports = {
  getCategories,
  getCategoryById,
  insertCategory,
  updateCategoryById,
  deleteCategoryById
};