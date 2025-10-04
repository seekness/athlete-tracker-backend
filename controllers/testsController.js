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
          COUNT(DISTINCT tr.id) AS result_count,
          COUNT(DISTINCT trv.id) AS value_count
        FROM tests t
        LEFT JOIN test_exercises te ON te.test_id = t.id
        LEFT JOIN test_results tr ON tr.test_exercises_id = te.id
        LEFT JOIN test_results_values trv ON trv.test_result_id = tr.id
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
  const athleteId = req.query.athlete_id ?? req.query.sportista_id;

  if (!athleteId) {
    return res.status(400).json({ error: "athlete_id je obavezan" });
  }

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          tr.id AS test_result_id,
          tr.athlete_id,
          tr.test_exercises_id,
          tr.napomena,
          te.test_id,
          te.vrsta_unosa,
          te.zadata_vrednost_unosa,
          e.naziv AS vezba,
          trv.id AS value_id,
          trv.vrsta_rezultata,
          trv.rezultat,
          trv.jedinica_mere,
          trv.timestamp
        FROM test_results tr
        JOIN test_exercises te ON tr.test_exercises_id = te.id
        JOIN exercises e ON te.exercises_id = e.id
        LEFT JOIN test_results_values trv ON trv.test_result_id = tr.id
        WHERE te.test_id = ? AND tr.athlete_id = ?
        ORDER BY te.id, trv.timestamp ASC, trv.id ASC
      `,
      [test_id, athleteId]
    );

    res.json(mapResultsWithValues(rows));
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
          tr.id AS test_result_id,
          tr.athlete_id,
          a.ime,
          a.prezime,
          tr.test_exercises_id,
          tr.napomena,
          te.test_id,
          te.vrsta_unosa,
          te.zadata_vrednost_unosa,
          e.naziv AS vezba,
          trv.id AS value_id,
          trv.vrsta_rezultata,
          trv.rezultat,
          trv.jedinica_mere,
          trv.timestamp
        FROM test_results tr
        JOIN athletes a ON tr.athlete_id = a.id
        JOIN test_exercises te ON tr.test_exercises_id = te.id
        JOIN exercises e ON te.exercises_id = e.id
        LEFT JOIN test_results_values trv ON trv.test_result_id = tr.id
        WHERE te.test_id = ?
        ORDER BY a.prezime, a.ime, te.id, trv.timestamp ASC, trv.id ASC
      `,
      [test_id]
    );

    res.json(mapResultsWithValues(rows, { includeAthlete: true }));
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
          te.exercises_id,
          e.naziv AS vezba,
          te.vrsta_unosa,
          te.zadata_vrednost_unosa
        FROM test_exercises te
        JOIN exercises e ON te.exercises_id = e.id
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

function mapResultsWithValues(rows, options = {}) {
  const { includeAthlete = false } = options;
  const results = new Map();

  for (const row of rows) {
    if (!results.has(row.test_result_id)) {
      results.set(row.test_result_id, {
        test_result_id: row.test_result_id,
        athlete_id: row.athlete_id,
        test_exercises_id: row.test_exercises_id,
        test_id: row.test_id,
        vezba: row.vezba,
        vrsta_unosa: row.vrsta_unosa,
        zadata_vrednost_unosa: row.zadata_vrednost_unosa,
        napomena: row.napomena,
        values: [],
        ...(includeAthlete
          ? {
              athlete: {
                id: row.athlete_id,
                ime: row.ime,
                prezime: row.prezime,
              },
            }
          : {}),
      });
    }

    if (row.value_id) {
      results.get(row.test_result_id).values.push({
        id: row.value_id,
        vrsta_rezultata: row.vrsta_rezultata,
        rezultat: row.rezultat,
        jedinica_mere: row.jedinica_mere,
        timestamp: row.timestamp,
      });
    }
  }

  return Array.from(results.values());
}