const dbPool = require("../db/pool");

async function createTestExercise(req, res) {
  const { test_id, vezba_id, vrsta_unosa, jedinica, broj_serija, broj_ponavljanja } = req.body;

  if (!test_id || !vezba_id || !vrsta_unosa || !jedinica) {
    return res.status(400).json({ error: "test_id, vezba_id, vrsta_unosa i jedinica su obavezni" });
  }

  try {
    const [result] = await dbPool.query(
      `
        INSERT INTO test_exercises (test_id, vezba_id, vrsta_unosa, jedinica, broj_serija, broj_ponavljanja)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        test_id,
        vezba_id,
        vrsta_unosa,
        jedinica,
        typeof broj_serija !== "undefined" ? broj_serija : null,
        typeof broj_ponavljanja !== "undefined" ? broj_ponavljanja : null,
      ]
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