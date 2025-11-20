const path = require("path");
const fs = require("fs");
const {
  getCategories,
  getCategoryById,
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
    const id = await insertCategory({ naziv, opis, ikonica: null });

    let iconPath = null;
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const finalName = `${id}${ext}`;
      const finalPath = path.join(req.file.destination, finalName);
      await fs.promises.rename(req.file.path, finalPath);
      iconPath = `/uploads/exercise-categories/${finalName}`;
      await updateCategoryById(id, { naziv, opis, ikonica: iconPath });
    }

    res.status(201).json({ id, naziv, opis, ikonica: iconPath });
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
    let iconPath = null;
    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ error: "Kategorija nije pronađena." });
    }

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const finalName = `${id}${ext}`;
      const finalPath = path.join(req.file.destination, finalName);

      if (existing.ikonica) {
        const existingPath = path.join(__dirname, "..", existing.ikonica);
        if (fs.existsSync(existingPath)) {
          await fs.promises.unlink(existingPath);
        }
      }

      await fs.promises.rename(req.file.path, finalPath);
      iconPath = `/uploads/exercise-categories/${finalName}`;
    } else {
      iconPath = existing.ikonica;
    }

    await updateCategoryById(id, { naziv, opis, ikonica: iconPath });
    res.json({ message: "Kategorija vežbi uspešno ažurirana.", ikonica: iconPath });
  } catch (error) {
    console.error("Greška pri ažuriranju kategorije vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteExerciseCategory(req, res) {
  const { id } = req.params;
  try {
    const existing = await getCategoryById(id);
    if (!existing) {
      return res.status(404).json({ error: "Kategorija nije pronađena." });
    }

    if (existing.ikonica) {
      const iconDiskPath = path.join(__dirname, "..", existing.ikonica);
      if (fs.existsSync(iconDiskPath)) {
        await fs.promises.unlink(iconDiskPath);
      }
    }

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