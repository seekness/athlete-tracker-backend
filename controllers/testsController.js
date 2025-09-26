// controllers/tests.js
const db = require('../db'); // tvoj konektor ka MySQL

async function getTestResultsBySportista(req, res) {
  const { test_id } = req.params;
  const { sportista_id } = req.query;

  if (!sportista_id) {
    return res.status(400).json({ error: 'sportista_id je obavezan' });
  }

  try {
    const [rows] = await db.query(
      `
      SELECT
        tr.id AS rezultat_id,
        te.id AS test_exercise_id,
        e.naziv AS vezba,
        tr.vrednost,
        tr.napomena,
        tr.timestamp
      FROM test_results tr
      JOIN test_exercises te ON tr.test_exercise_id = te.id
      JOIN exercises e ON te.vezba_id = e.id
      WHERE tr.test_id = ? AND tr.sportista_id = ?
      ORDER BY tr.timestamp ASC
      `,
      [test_id, sportista_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dohvaćanju rezultata' });
  }
}


async function getGroupResultsForTest(req, res) {
  const { test_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT
        tr.sportista_id,
        a.ime,
        a.prezime,
        te.test_id,
        e.naziv AS vezba,
        tr.vrednost,
        tr.napomena,
        tr.timestamp
      FROM test_results tr
      JOIN athletes a ON tr.sportista_id = a.id
      JOIN test_exercises te ON tr.test_exercise_id = te.id
      JOIN exercises e ON te.vezba_id = e.id
      WHERE te.test_id = ?
      ORDER BY tr.sportista_id, te.id
      `,
      [test_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dohvaćanju grupnih rezultata' });
  }
}

async function getExercisesForTest(req, res) {
  const { test_id } = req.params;

  try {
    const [rows] = await db.query(
      `
      SELECT
        te.id AS test_exercise_id,
        e.naziv AS vezba,
        te.vrsta_unosa,
        te.jedinica,
        te.broj_serija,
        te.broj_ponavljanja
      FROM test_exercises te
      JOIN exercises e ON te.vezba_id = e.id
      WHERE te.test_id = ?
      ORDER BY te.id
      `,
      [test_id]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri dohvaćanju vežbi za test' });
  }
}

module.exports = { getGroupResultsForTest, getTestResultsBySportista, getExercisesForTest };