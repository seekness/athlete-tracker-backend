const dbPool = require("../db/pool");

async function getAllTests(req, res) {
  const { trener_id } = req.query;

  const filters = [];
  const params = [];

  if (trener_id) {
    filters.push("t.trener_id = ?");
    params.push(trener_id);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          t.id,
          t.naziv,
          t.datum,
          t.trener_id,
          t.napomena,
          t.created_at,
          COUNT(DISTINCT te.id) AS exercise_count,
          COUNT(DISTINCT tr.id) AS result_count
        FROM tests t
        LEFT JOIN test_exercises te ON te.test_id = t.id
        LEFT JOIN test_results tr ON tr.test_id = t.id
        ${whereClause}
        GROUP BY t.id
        ORDER BY t.datum DESC, t.id DESC
      `,
      params
    );

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju testova:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju testova" });
  }
}

async function getTestById(req, res) {
  const { id } = req.params;

  try {
    const [tests] = await dbPool.query(
      `SELECT id, naziv, datum, trener_id, napomena, created_at FROM tests WHERE id = ?`,
      [id]
    );

    if (!tests.length) {
      return res.status(404).json({ error: "Test nije pronađen" });
    }

    res.json(tests[0]);
  } catch (error) {
    console.error("Greška pri dohvaćanju testa:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju testa" });
  }
}

async function createTest(req, res) {
  const { naziv, datum, trener_id, napomena } = req.body;

  if (!naziv || !datum) {
    return res.status(400).json({ error: "Naziv i datum su obavezni" });
  }

  const values = [
    naziv,
    datum,
    typeof trener_id !== "undefined" ? trener_id : null,
    typeof napomena !== "undefined" ? napomena : null,
  ];

  try {
    const [result] = await dbPool.query(
      `INSERT INTO tests (naziv, datum, trener_id, napomena) VALUES (?, ?, ?, ?)`,
      values
    );

    res.status(201).json({
      message: "Test uspešno kreiran",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Greška pri kreiranju testa:", error);
    res.status(500).json({ error: "Greška pri kreiranju testa" });
  }
}

async function updateTest(req, res) {
  const { id } = req.params;
  const { naziv, datum, trener_id, napomena } = req.body;

  if (!naziv || !datum) {
    return res.status(400).json({ error: "Naziv i datum su obavezni" });
  }

  try {
    const [result] = await dbPool.query(
      `UPDATE tests SET naziv = ?, datum = ?, trener_id = ?, napomena = ? WHERE id = ?`,
      [naziv, datum, typeof trener_id !== "undefined" ? trener_id : null, typeof napomena !== "undefined" ? napomena : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Test nije pronađen" });
    }

    res.json({ message: "Test uspešno izmenjen" });
  } catch (error) {
    console.error("Greška pri izmeni testa:", error);
    res.status(500).json({ error: "Greška pri izmeni testa" });
  }
}

async function deleteTest(req, res) {
  const { id } = req.params;

  try {
    const [result] = await dbPool.query(`DELETE FROM tests WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Test nije pronađen" });
    }

    res.json({ message: "Test uspešno obrisan" });
  } catch (error) {
    console.error("Greška pri brisanju testa:", error);
    res.status(500).json({ error: "Greška pri brisanju testa" });
  }
}

async function getTestResultsBySportista(req, res) {
  const { test_id } = req.params;
  const { sportista_id } = req.query;

  if (!sportista_id) {
    return res.status(400).json({ error: "sportista_id je obavezan" });
  }

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          tr.id AS rezultat_id,
          tr.test_id,
          tr.sportista_id,
          tr.test_exercise_id,
          tr.vrednost,
          tr.napomena,
          tr.timestamp,
          e.naziv AS vezba
        FROM test_results tr
        JOIN test_exercises te ON tr.test_exercise_id = te.id
        JOIN exercises e ON te.vezba_id = e.id
        WHERE tr.test_id = ? AND tr.sportista_id = ?
        ORDER BY tr.timestamp ASC
      `,
      [test_id, sportista_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju rezultata:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju rezultata" });
  }
}

async function getGroupResultsForTest(req, res) {
  const { test_id } = req.params;

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          tr.id AS rezultat_id,
          tr.sportista_id,
          a.ime,
          a.prezime,
          tr.test_exercise_id,
          e.naziv AS vezba,
          tr.vrednost,
          tr.napomena,
          tr.timestamp
        FROM test_results tr
        JOIN athletes a ON tr.sportista_id = a.id
        JOIN test_exercises te ON tr.test_exercise_id = te.id
        JOIN exercises e ON te.vezba_id = e.id
        WHERE tr.test_id = ?
        ORDER BY tr.sportista_id, te.id
      `,
      [test_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju grupnih rezultata:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju grupnih rezultata" });
  }
}

async function getExercisesForTest(req, res) {
  const { test_id } = req.params;

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          te.id AS test_exercise_id,
          te.test_id,
          te.vezba_id,
          e.naziv AS vezba,
          te.vrsta_unosa,
          te.jedinica,
          te.broj_serija,
          te.broj_ponavljanja,
          te.created_at
        FROM test_exercises te
        JOIN exercises e ON te.vezba_id = e.id
        WHERE te.test_id = ?
        ORDER BY te.id
      `,
      [test_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("Greška pri dohvaćanju vežbi za test:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju vežbi za test" });
  }
}

module.exports = {
  getAllTests,
  getTestById,
  createTest,
  updateTest,
  deleteTest,
  getTestResultsBySportista,
  getGroupResultsForTest,
  getExercisesForTest,
};