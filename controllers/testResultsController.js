const dbPool = require("../db/pool");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

async function createTestResult(req, res) {
  const athleteId = req.body.athlete_id ?? req.body.sportista_id;
  const testExerciseId = req.body.test_exercises_id ?? req.body.test_exercise_id;
  const napomena = typeof req.body.napomena !== "undefined" ? req.body.napomena : null;

  if (!athleteId || !testExerciseId) {
    return res
      .status(400)
      .json({ error: "athlete_id i test_exercises_id su obavezni" });
  }

  const fallbackValue = buildFallbackValue(req.body);
  const { values, error } = normalizeValues(req.body.values, fallbackValue);

  if (error) {
    return res.status(400).json({ error });
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO test_results (athlete_id, test_exercises_id, napomena)
       VALUES (?, ?, ?)`,
      [athleteId, testExerciseId, napomena]
    );

    const valueIds = await insertResultValues(connection, result.insertId, values);

    await connection.commit();

    res.status(201).json({
      message: "Rezultat uspešno unet",
      id: result.insertId,
      value_ids: valueIds,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Greška pri unosu rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function createBulkTestResults(req, res) {
  const athleteId = req.body.athlete_id ?? req.body.sportista_id;
  const { rezultati } = req.body;

  if (!athleteId || !Array.isArray(rezultati) || !rezultati.length) {
    return res.status(400).json({ error: "Nedostaju athlete_id ili rezultati" });
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const insertedIds = [];

    for (const item of rezultati) {
      const testExerciseId = item.test_exercises_id ?? item.test_exercise_id;

      if (!testExerciseId) {
        throw new ValidationError("test_exercises_id je obavezan za svaki rezultat");
      }

      const fallbackValue = buildFallbackValue(item);
      const { values, error } = normalizeValues(item.values, fallbackValue);

      if (error) {
        throw new ValidationError(error);
      }

      const [result] = await connection.query(
        `INSERT INTO test_results (athlete_id, test_exercises_id, napomena)
         VALUES (?, ?, ?)`,
        [athleteId, testExerciseId, item.napomena ?? null]
      );

      await insertResultValues(connection, result.insertId, values);
      insertedIds.push(result.insertId);
    }

    await connection.commit();

    res.status(201).json({
      message: "Rezultati uspešno uneti",
      count: insertedIds.length,
      ids: insertedIds,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Greška pri unosu rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function createGroupTestResults(req, res) {
  const { rezultati } = req.body;

  if (!Array.isArray(rezultati) || !rezultati.length) {
    return res.status(400).json({ error: "Nema rezultata za unos" });
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    const insertedIds = [];

    for (const item of rezultati) {
      const athleteId = item.athlete_id ?? item.sportista_id;
      const testExerciseId = item.test_exercises_id ?? item.test_exercise_id;

      if (!athleteId || !testExerciseId) {
        throw new ValidationError(
          "athlete_id i test_exercises_id su obavezni za svaki rezultat"
        );
      }

      const fallbackValue = buildFallbackValue(item);
      const { values, error } = normalizeValues(item.values, fallbackValue);

      if (error) {
        throw new ValidationError(error);
      }

      const [result] = await connection.query(
        `INSERT INTO test_results (athlete_id, test_exercises_id, napomena)
         VALUES (?, ?, ?)`,
        [athleteId, testExerciseId, item.napomena ?? null]
      );

      await insertResultValues(connection, result.insertId, values);
      insertedIds.push(result.insertId);
    }

    await connection.commit();

    res.status(201).json({
      message: "Rezultati uspešno uneti",
      count: insertedIds.length,
      ids: insertedIds,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof ValidationError) {
      return res.status(400).json({ error: error.message });
    }

    console.error("Greška pri unosu grupnih rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu grupnih rezultata" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function updateTestResult(req, res) {
  const { id } = req.params;
  const { role, id: userId } = req.user;
  const napomena = typeof req.body.napomena !== "undefined" ? req.body.napomena : undefined;
  const providedValues = req.body.values;

  if (typeof napomena === "undefined" && typeof providedValues === "undefined" && typeof req.body.vrednost === "undefined") {
    return res.status(400).json({ error: "Nema podataka za izmenu" });
  }

  // Provera prava pristupa za sportistu
  if (role === "sportista") {
    const [athleteRows] = await dbPool.query("SELECT id FROM athletes WHERE user_id = ?", [userId]);
    if (athleteRows.length === 0) {
      return res.status(403).json({ error: "Nemate pravo pristupa" });
    }
    const athleteId = athleteRows[0].id;
    
    const [check] = await dbPool.query("SELECT id FROM test_results WHERE id = ? AND athlete_id = ?", [id, athleteId]);
    if (check.length === 0) {
      return res.status(403).json({ error: "Nemate pravo izmene ovog rezultata" });
    }
  }

  const fallbackValue = buildFallbackValue(req.body);
  const { values, error } = normalizeValues(providedValues, fallbackValue);

  if (error && typeof providedValues !== "undefined") {
    return res.status(400).json({ error });
  }

  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    if (typeof napomena !== "undefined") {
      const [updateResult] = await connection.query(
        `UPDATE test_results SET napomena = ? WHERE id = ?`,
        [napomena, id]
      );

      if (updateResult.affectedRows === 0) {
        throw new ValidationError("Rezultat nije pronađen");
      }
    } else {
      const [existing] = await connection.query(
        `SELECT id FROM test_results WHERE id = ?`,
        [id]
      );

      if (!existing.length) {
        throw new ValidationError("Rezultat nije pronađen");
      }
    }

    if (
      typeof providedValues !== "undefined" ||
      typeof fallbackValue.rezultat !== "undefined" ||
      typeof fallbackValue.rezultat_1 !== "undefined" ||
      typeof fallbackValue.rezultat_2 !== "undefined"
    ) {
      await connection.query(`DELETE FROM test_results_values WHERE test_result_id = ?`, [id]);

      if (values && values.length) {
        await insertResultValues(connection, Number(id), values);
      }
    }

    await connection.commit();

    res.json({ message: "Rezultat uspešno izmenjen" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof ValidationError) {
      return res.status(error.message === "Rezultat nije pronađen" ? 404 : 400).json({ error: error.message });
    }

    console.error("Greška pri izmeni rezultata:", error);
    res.status(500).json({ error: "Greška pri izmeni rezultata" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function deleteTestResult(req, res) {
  const { id } = req.params;
  let connection;

  try {
    connection = await dbPool.getConnection();
    await connection.beginTransaction();

    await connection.query(`DELETE FROM test_results_values WHERE test_result_id = ?`, [id]);

    const [result] = await connection.query(`DELETE FROM test_results WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      throw new ValidationError("Rezultat nije pronađen");
    }

    await connection.commit();

    res.json({ message: "Rezultat uspešno obrisan" });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    if (error instanceof ValidationError) {
      return res.status(404).json({ error: error.message });
    }

    console.error("Greška pri brisanju rezultata:", error);
    res.status(500).json({ error: "Greška pri brisanju rezultata" });
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

async function getTestResultsByAthlete(req, res) {
  const { athleteId } = req.params;

  try {
    const [rows] = await dbPool.query(
      `
        SELECT
          tr.id AS test_result_id,
          tr.athlete_id,
          tr.test_exercises_id,
          tr.napomena,
          te.test_id,
          t.naziv AS test_naziv,
          t.datum AS test_datum,
          te.vrsta_unosa,
          e.naziv AS vezba,
          trv.id AS value_id,
          trv.vrsta_rezultata_1,
          trv.rezultat_1,
          trv.jedinica_mere_1,
          trv.vrsta_rezultata_2,
          trv.rezultat_2,
          trv.jedinica_mere_2,
          trv.vrsta_rezultata_3,
          trv.rezultat_3,
          trv.jedinica_mere_3,
          trv.timestamp
        FROM test_results tr
        JOIN test_exercises te ON tr.test_exercises_id = te.id
        JOIN tests t ON te.test_id = t.id
        JOIN exercises e ON te.exercises_id = e.id
        LEFT JOIN test_results_values trv ON trv.test_result_id = tr.id
        WHERE tr.athlete_id = ?
        ORDER BY e.naziv, t.datum DESC, trv.timestamp DESC
      `,
      [athleteId]
    );

    const groupedByExercise = {};

    for (const row of rows) {
      if (!groupedByExercise[row.vezba]) {
        groupedByExercise[row.vezba] = [];
      }

      groupedByExercise[row.vezba].push({
        test_result_id: row.test_result_id,
        test_id: row.test_id,
        test_naziv: row.test_naziv,
        test_datum: row.test_datum,
        timestamp: row.timestamp,
        vrsta_unosa: row.vrsta_unosa,
        rezultat_1: row.rezultat_1,
        jedinica_mere_1: row.jedinica_mere_1,
        rezultat_2: row.rezultat_2,
        jedinica_mere_2: row.jedinica_mere_2,
        rezultat_3: row.rezultat_3,
        jedinica_mere_3: row.jedinica_mere_3,
      });
    }

    res.json(groupedByExercise);
  } catch (error) {
    console.error("Greška pri dohvaćanju istorije testiranja:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju istorije testiranja" });
  }
}

module.exports = {
  getTestResultsByTest,
  getTestResultsByAthlete,
  createTestResult,
  createBulkTestResults,
  createGroupTestResults,
  updateTestResult,
  deleteTestResult,
};

function normalizeValues(rawValues, fallback = {}) {
  let sourceValues = [];

  if (Array.isArray(rawValues) && rawValues.length) {
    sourceValues = rawValues;
  } else if (
    typeof fallback.rezultat !== "undefined" ||
    typeof fallback.rezultat_1 !== "undefined" ||
    typeof fallback.rezultat_2 !== "undefined"
  ) {
    sourceValues = [fallback];
  }

  if (!sourceValues.length) {
    return { values: [] };
  }

  const normalized = [];

  for (const value of sourceValues) {
    const rezultat1 =
      value?.rezultat_1 ??
      value?.rezultat ??
      value?.value ??
      value?.vrednost ??
      fallback?.rezultat_1 ??
      fallback?.rezultat ??
      null;

    if (rezultat1 === undefined || rezultat1 === null || rezultat1 === "") {
      return { error: "Vrednost rezultata je obavezna" };
    }

    const rezultat2 =
      value?.rezultat_2 ??
      fallback?.rezultat_2 ??
      "";

    const rezultat3 =
      value?.rezultat_3 ??
      fallback?.rezultat_3 ??
      "";

    normalized.push({
      vrsta_rezultata_1:
        value?.vrsta_rezultata_1 ??
        value?.vrsta_rezultata ??
        fallback?.vrsta_rezultata_1 ??
        fallback?.vrsta_rezultata ??
        null,
      rezultat_1: rezultat1,
      jedinica_mere_1:
        value?.jedinica_mere_1 ??
        value?.jedinica_mere ??
        fallback?.jedinica_mere_1 ??
        fallback?.jedinica_mere ??
        null,
      vrsta_rezultata_2:
        value?.vrsta_rezultata_2 ?? fallback?.vrsta_rezultata_2 ?? "",
      rezultat_2: rezultat2 ?? "",
      jedinica_mere_2:
        value?.jedinica_mere_2 ?? fallback?.jedinica_mere_2 ?? "",
      vrsta_rezultata_3:
        value?.vrsta_rezultata_3 ?? fallback?.vrsta_rezultata_3 ?? "",
      rezultat_3: rezultat3 ?? "",
      jedinica_mere_3:
        value?.jedinica_mere_3 ?? fallback?.jedinica_mere_3 ?? "",
      timestamp: value?.timestamp ?? fallback?.timestamp ?? null,
    });
  }

  return { values: normalized };
}

async function insertResultValues(connection, testResultId, values = []) {
  const insertedIds = [];

  for (const value of values) {
    let timestamp = value.timestamp ? new Date(value.timestamp) : new Date();

    if (!(timestamp instanceof Date) || Number.isNaN(timestamp.getTime())) {
      timestamp = new Date();
    }

    const [result] = await connection.query(
      `INSERT INTO test_results_values (
         test_result_id,
         vrsta_rezultata_1,
         rezultat_1,
         jedinica_mere_1,
         vrsta_rezultata_2,
         rezultat_2,
         jedinica_mere_2,
         vrsta_rezultata_3,
         rezultat_3,
         jedinica_mere_3,
         timestamp
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        testResultId,
        value.vrsta_rezultata_1 ?? null,
        value.rezultat_1,
        value.jedinica_mere_1 ?? null,
        value.vrsta_rezultata_2 ?? "",
        value.rezultat_2 ?? "",
        value.jedinica_mere_2 ?? "",
        value.vrsta_rezultata_3 ?? "",
        value.rezultat_3 ?? "",
        value.jedinica_mere_3 ?? "",
        timestamp,
      ]
    );

    insertedIds.push(result.insertId);
  }

  return insertedIds;
}

function buildFallbackValue(payload = {}) {
  const fallback = {};

  if (typeof payload.vrednost !== "undefined") {
    fallback.rezultat = payload.vrednost;
    fallback.rezultat_1 = payload.vrednost;
  }

  if (typeof payload.rezultat !== "undefined") {
    fallback.rezultat = payload.rezultat;
    fallback.rezultat_1 = payload.rezultat;
  }

  if (typeof payload.rezultat_1 !== "undefined") {
    fallback.rezultat_1 = payload.rezultat_1;
  }

  if (typeof payload.rezultat_2 !== "undefined") {
    fallback.rezultat_2 = payload.rezultat_2;
  }

  if (typeof payload.rezultat_3 !== "undefined") {
    fallback.rezultat_3 = payload.rezultat_3;
  }

  if (typeof payload.vrsta_rezultata !== "undefined") {
    fallback.vrsta_rezultata = payload.vrsta_rezultata;
    fallback.vrsta_rezultata_1 = payload.vrsta_rezultata;
  }

  if (typeof payload.vrsta_rezultata_1 !== "undefined") {
    fallback.vrsta_rezultata_1 = payload.vrsta_rezultata_1;
  }

  if (typeof payload.vrsta_rezultata_2 !== "undefined") {
    fallback.vrsta_rezultata_2 = payload.vrsta_rezultata_2;
  }

  if (typeof payload.vrsta_rezultata_3 !== "undefined") {
    fallback.vrsta_rezultata_3 = payload.vrsta_rezultata_3;
  }

  if (typeof payload.jedinica_mere !== "undefined") {
    fallback.jedinica_mere = payload.jedinica_mere;
    fallback.jedinica_mere_1 = payload.jedinica_mere;
  }

  if (typeof payload.jedinica_mere_1 !== "undefined") {
    fallback.jedinica_mere_1 = payload.jedinica_mere_1;
  }

  if (typeof payload.jedinica_mere_2 !== "undefined") {
    fallback.jedinica_mere_2 = payload.jedinica_mere_2;
  }

  if (typeof payload.jedinica_mere_3 !== "undefined") {
    fallback.jedinica_mere_3 = payload.jedinica_mere_3;
  }

  if (typeof payload.timestamp !== "undefined") {
    fallback.timestamp = payload.timestamp;
  }

  return fallback;
}

async function getTestResultsByTest(req, res) {
  const { test_id: testId } = req.params;

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
          e.naziv AS vezba,
          trv.id AS value_id,
          trv.vrsta_rezultata_1,
          trv.rezultat_1,
          trv.jedinica_mere_1,
          trv.vrsta_rezultata_2,
          trv.rezultat_2,
          trv.jedinica_mere_2,
          trv.vrsta_rezultata_3,
          trv.rezultat_3,
          trv.jedinica_mere_3,
          trv.timestamp
        FROM test_results tr
        JOIN athletes a ON tr.athlete_id = a.id
        JOIN test_exercises te ON tr.test_exercises_id = te.id
        JOIN exercises e ON te.exercises_id = e.id
        LEFT JOIN test_results_values trv ON trv.test_result_id = tr.id
        WHERE te.test_id = ?
        ORDER BY a.prezime, a.ime, te.id, trv.timestamp ASC, trv.id ASC
      `,
      [testId]
    );

    res.json(mapResultsForGroup(rows));
  } catch (error) {
    console.error("Greška pri dohvaćanju rezultata testa:", error);
    res.status(500).json({ error: "Greška pri dohvaćanju rezultata testa" });
  }
}

function mapResultsForGroup(rows = []) {
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
        napomena: row.napomena,
        values: [],
        athlete: {
          id: row.athlete_id,
          ime: row.ime,
          prezime: row.prezime,
        },
      });
    }

    if (row.value_id) {
      results.get(row.test_result_id).values.push({
        id: row.value_id,
        vrsta_rezultata_1: row.vrsta_rezultata_1,
        rezultat_1: row.rezultat_1,
        jedinica_mere_1: row.jedinica_mere_1,
        vrsta_rezultata_2: row.vrsta_rezultata_2,
        rezultat_2: row.rezultat_2,
        jedinica_mere_2: row.jedinica_mere_2,
        vrsta_rezultata_3: row.vrsta_rezultata_3,
        rezultat_3: row.rezultat_3,
        jedinica_mere_3: row.jedinica_mere_3,
        timestamp: row.timestamp,
      });
    }
  }

  return Array.from(results.values());
}