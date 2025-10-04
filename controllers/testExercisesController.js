const dbPool = require("../db/pool");

const VALID_INPUT_TYPES = new Set([
  "tezina-vreme",
  "duzina-vreme",
  "vreme-duzina",
  "vreme-ponavljanje",
  "vreme-duzina,ponavljanje",
  "ponavljanje",
  "ponavljanje-max",
]);

async function createTestExercise(req, res) {
  const {
    test_id,
    exercises_id,
    exercise_id,
    vezba_id,
    vrsta_unosa,
    zadata_vrednost_unosa,
  } = req.body;

  const exerciseId = exercises_id ?? exercise_id ?? vezba_id;

  if (!test_id || !exerciseId || !vrsta_unosa) {
    return res
      .status(400)
      .json({ error: "test_id, exercises_id i vrsta_unosa su obavezni" });
  }

  if (!VALID_INPUT_TYPES.has(vrsta_unosa)) {
    return res.status(400).json({
      error: `vrsta_unosa mora biti jedna od: ${Array.from(VALID_INPUT_TYPES).join(", ")}`,
    });
  }

  try {
    const [result] = await dbPool.query(
      `
        INSERT INTO test_exercises (test_id, exercises_id, vrsta_unosa, zadata_vrednost_unosa)
        VALUES (?, ?, ?, ?)
      `,
      [test_id, exerciseId, vrsta_unosa, zadata_vrednost_unosa ?? null]
    );

    res.status(201).json({
      message: "Vežba uspešno dodata u test",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Greška pri dodavanju vežbe u test:", error);
    res.status(500).json({ error: "Greška pri dodavanju vežbe u test" });
  }
}

async function deleteTestExercise(req, res) {
  const { id } = req.params;

  try {
    const [result] = await dbPool.query(`DELETE FROM test_exercises WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vežba nije pronađena" });
    }

    res.json({ message: "Vežba uspešno obrisana iz testa" });
  } catch (error) {
    console.error("Greška pri brisanju vežbe iz testa:", error);
    res.status(500).json({ error: "Greška pri brisanju vežbe iz testa" });
  }
}

module.exports = {
  createTestExercise,
  deleteTestExercise,
};