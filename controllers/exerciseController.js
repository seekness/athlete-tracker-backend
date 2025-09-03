const path = require("path");
const fs = require("fs");
const dbPool = require("../db/pool");

const {
  fetchExercisesWithDetails,
  insertExercise,
  updateExerciseById,
  updateExerciseImagePath,
  deleteExerciseById,
  fetchExerciseById
} = require("../models/exerciseModel");

async function getAllExercises(req, res) {
  try {
    const exercises = await fetchExercisesWithDetails();
    res.json(exercises);
  } catch (error) {
    console.error("Greška pri dobijanju vežbi:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createExercise(req, res) {
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link,
    slika
  } = req.body;

  if (!naziv || !muscle_group_id || !exercise_category_id) {
    return res.status(400).json({
      error: "Naziv vežbe, mišićna grupa i kategorija su obavezni."
    });
  }

  try {
    const id = await insertExercise({
      naziv,
      opis,
      muscle_group_id,
      exercise_category_id,
      other_muscle_group_id,
      oprema,
      unilateral,
      video_link,
      slika
    });

    res.status(201).json({
      id,
      naziv,
      opis,
      muscle_group_id,
      exercise_category_id,
      other_muscle_group_id,
      oprema,
      unilateral,
      video_link,
      slika
    });
  } catch (error) {
    console.error("Greška pri dodavanju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateExercise(req, res) {
  const { id } = req.params;
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link,
    slika
  } = req.body;

  if (!naziv || !muscle_group_id || !exercise_category_id) {
    return res.status(400).json({
      error: "Naziv vežbe, mišićna grupa i kategorija su obavezni."
    });
  }

  try {
    await updateExerciseById(id, {
      naziv,
      opis,
      muscle_group_id,
      exercise_category_id,
      other_muscle_group_id,
      oprema,
      unilateral,
      video_link,
      slika
    });

    res.json({ message: "Vežba uspešno ažurirana." });
  } catch (error) {
    console.error("Greška pri ažuriranju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteExercise(req, res) {
  const { id } = req.params;
  try {
    await deleteExerciseById(id);
    res.json({ message: "Vežba uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function createExerciseWithImage(req, res) {
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link
  } = req.body;

  if (!naziv || !muscle_group_id || !exercise_category_id) {
    return res.status(400).json({ error: "Obavezna polja nisu uneta." });
  }

  try {
    const newExerciseId = await insertExercise({
      naziv,
      opis,
      muscle_group_id: parseInt(muscle_group_id),
      exercise_category_id: parseInt(exercise_category_id),
      other_muscle_group_id: other_muscle_group_id ? parseInt(other_muscle_group_id) : null,
      oprema,
      unilateral: unilateral === 'true' || unilateral === true,
      video_link,
      slika: "" // Postaviti na prazno, ažuriraće se kasnije ako ima sliku
    });

    let imagePath = "";

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${newExerciseId}${ext}`;
      const newPath = path.join(req.file.destination, newName);
      fs.renameSync(req.file.path, newPath);
      imagePath = `/uploads/exercises/${newName}`;
      await updateExerciseImagePath(newExerciseId, imagePath);
    }

    res.status(201).json({
      id: newExerciseId,
      naziv,
      opis,
      muscle_group_id: parseInt(muscle_group_id),
      exercise_category_id: parseInt(exercise_category_id),
      other_muscle_group_id: other_muscle_group_id ? parseInt(other_muscle_group_id) : null,
      oprema,
      unilateral: unilateral === 'true' || unilateral === true,
      video_link,
      slika: imagePath
    });
  } catch (error) {
    console.error("Greška pri dodavanju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateExerciseWithImage(req, res) {
  const { id } = req.params;
  const {
    naziv,
    opis,
    muscle_group_id,
    exercise_category_id,
    other_muscle_group_id,
    oprema,
    unilateral,
    video_link
  } = req.body;

  if (!naziv || !muscle_group_id || !exercise_category_id) {
    return res.status(400).json({ error: "Obavezna polja nisu uneta." });
  }

  try {
    let imagePath = "";

    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newName = `${id}${ext}`;
      const newPath = path.join(req.file.destination, newName);

      // obriši staru sliku ako postoji
      const existing = await fetchExerciseById(id);
      if (existing?.slika) {
        const oldPath = path.join(__dirname, "..", existing.slika);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      fs.renameSync(req.file.path, newPath);
      imagePath = `/uploads/exercises/${newName}`;
    } else {
      const existing = await fetchExerciseById(id);
      imagePath = existing?.slika || "";
    }

    await updateExerciseById(id, {
      naziv,
      opis,
      muscle_group_id: parseInt(muscle_group_id),
      exercise_category_id: parseInt(exercise_category_id),
      other_muscle_group_id: other_muscle_group_id ? parseInt(other_muscle_group_id) : null,
      oprema,
      unilateral: unilateral === 'true' || unilateral === true,
      video_link,
      slika: imagePath
    });

    res.json({ message: "Vežba uspešno ažurirana.", slika: imagePath });
  } catch (error) {
    console.error("Greška pri ažuriranju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}


async function deleteExerciseWithImage(req, res) {
  const { id } = req.params;

  try {
    const exercise = await fetchExerciseById(id);
    if (!exercise) {
      return res.status(404).json({ error: "Vežba nije pronađena." });
    }

    const success = await deleteExerciseById(id);
    if (!success) {
      return res.status(500).json({ error: "Brisanje nije uspelo." });
    }

    res.json({ message: "Vežba i slika su uspešno obrisani." });
  } catch (error) {
    console.error("Greška pri brisanju vežbe:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getAllExercises,
  createExercise,
  updateExercise,
  deleteExercise,
  createExerciseWithImage,
  updateExerciseWithImage,
  deleteExerciseWithImage
};