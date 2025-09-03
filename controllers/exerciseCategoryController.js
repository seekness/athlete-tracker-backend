const {
  getCategories,
  insertCategory,
  updateCategoryById,
  deleteCategoryById
} = require("../models/exerciseCategoryModel");

async function getAllExerciseCategories(req, res) {
  try {
    const categories = await getCategories();
    res.json(categories);
  } catch (error) {
    console.error("Greška pri dobijanju kategorija vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createExerciseCategory(req, res) {
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv kategorije je obavezan." });
  }
  try {
    const id = await insertCategory({ naziv, opis });
    res.status(201).json({ id, naziv, opis });
  } catch (error) {
    console.error("Greška pri dodavanju kategorije vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateExerciseCategory(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  if (!naziv) {
    return res.status(400).json({ error: "Naziv kategorije je obavezan." });
  }
  try {
    await updateCategoryById(id, { naziv, opis });
    res.json({ message: "Kategorija vežbi uspešno ažurirana." });
  } catch (error) {
    console.error("Greška pri ažuriranju kategorije vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteExerciseCategory(req, res) {
  const { id } = req.params;
  try {
    // Ovde možeš dodati proveru da li je kategorija u upotrebi
    await deleteCategoryById(id);
    res.json({ message: "Kategorija vežbi uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju kategorije vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getAllExerciseCategories,
  createExerciseCategory,
  updateExerciseCategory,
  deleteExerciseCategory
};