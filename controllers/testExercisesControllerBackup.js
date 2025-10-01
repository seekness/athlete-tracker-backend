const dbPool = require("../db/pool");

async function createTestExercise(req, res) {
  const { test_id, vezba_id, vrsta_unosa, jedinica, broj_serija, broj_ponavljanja } = req.body;

  if (!test_id || !vezba_id || !vrsta_unosa || !jedinica) {
    return res.status(400).json({ error: 'Nedostaju obavezna polja' });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO test_exercises (test_id, vezba_id, vrsta_unosa, jedinica, broj_serija, broj_ponavljanja)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [test_id, vezba_id, vrsta_unosa, jedinica, broj_serija || null, broj_ponavljanja || null]
    );

    res.status(201).json({ message: 'Vežba uspešno dodata u test', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dodavanju vežbe u test' });
  }
}

async function deleteTestExercise(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM test_exercises WHERE id = ?`, [id]);
    res.json({ message: 'Vežba uspešno obrisana iz testa' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri brisanju vežbe' });
  }
}

module.exports = { createTestExercise, deleteTestExercise };