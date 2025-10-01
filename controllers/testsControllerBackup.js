const dbPool = require("../db/pool");

async function createTest(req, res) {
  const { naziv, datum, trener_id } = req.body;

  if (!naziv || !datum || !trener_id) {
    return res
      .status(400)
      .json({ error: "Naziv, datum i trener_id su obavezni" });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO tests (naziv, datum, trener_id) VALUES (?, ?, ?)`,
      [naziv, datum, trener_id]
    );

    res
      .status(201)
      .json({ message: "Test uspešno kreiran", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri kreiranju testa" });
  }
}

async function getAllTests(req, res) {
  const { trener_id } = req.query;

  try {
    const [rows] = await db.query(
      trener_id
        ? `SELECT t.*, COUNT(te.id) as exercise_count
          FROM tests t
          LEFT JOIN test_exercises te ON t.id = te.test_id
          GROUP BY t.id
          WHERE trener_id = ? 
          ORDER BY t.datum DESC`
        : `SELECT t.*, COUNT(te.id) as exercise_count
          FROM tests t
          LEFT JOIN test_exercises te ON t.id = te.test_id
          GROUP BY t.id
          ORDER BY t.datum DESC`,
      trener_id ? [trener_id] : []
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri dohvaćanju testova" });
  }
}

async function getTestResultsBySportista(req, res) {
  const { test_id } = req.params;
  const { sportista_id } = req.query;

  if (!sportista_id) {
    return res.status(400).json({ error: "sportista_id je obavezan" });
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
    res.status(500).json({ error: "Greška pri dohvaćanju rezultata" });
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
    res.status(500).json({ error: "Greška pri dohvaćanju grupnih rezultata" });
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
    res.status(500).json({ error: "Greška pri dohvaćanju vežbi za test" });
  }
}

async function updateTest(req, res) {
  const { id } = req.params;
  const { naziv, datum } = req.body;

  try {
    await db.query(`UPDATE tests SET naziv = ?, datum = ? WHERE id = ?`, [
      naziv,
      datum,
      id,
    ]);

    res.json({ message: "Test uspešno izmenjen" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri izmeni testa" });
  }
}

async function deleteTest(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM tests WHERE id = ?`, [id]);
    res.json({ message: "Test uspešno obrisan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri brisanju testa" });
  }
}

module.exports = {
  getGroupResultsForTest,
  getTestResultsBySportista,
  getExercisesForTest,
  updateTest,
  deleteTest,
  createTest,
  getAllTests,
};
