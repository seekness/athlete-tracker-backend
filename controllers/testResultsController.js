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
  const napomena = typeof req.body.napomena !== "undefined" ? req.body.napomena : undefined;
  const providedValues = req.body.values;

  if (typeof napomena === "undefined" && typeof providedValues === "undefined" && typeof req.body.vrednost === "undefined") {
    return res.status(400).json({ error: "Nema podataka za izmenu" });
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

    if (typeof providedValues !== "undefined" || typeof fallbackValue.rezultat !== "undefined") {
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

module.exports = {
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
  } else if (typeof fallback.rezultat !== "undefined") {
    sourceValues = [fallback];
  }

  if (!sourceValues.length) {
    return { values: [] };
  }

  const normalized = [];

  for (const value of sourceValues) {
    const rezultat =
      value?.rezultat ?? value?.value ?? value?.vrednost ?? fallback?.rezultat;

    if (rezultat === undefined || rezultat === null || rezultat === "") {
      return { error: "Svaka vrednost mora sadržati rezultat" };
    }

    normalized.push({
      vrsta_rezultata:
        value?.vrsta_rezultata ?? fallback?.vrsta_rezultata ?? null,
      rezultat,
      jedinica_mere: value?.jedinica_mere ?? fallback?.jedinica_mere ?? null,
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
      `INSERT INTO test_results_values (test_result_id, vrsta_rezultata, rezultat, jedinica_mere, timestamp)
       VALUES (?, ?, ?, ?, ?)`,
      [
        testResultId,
        value.vrsta_rezultata ?? null,
        value.rezultat,
        value.jedinica_mere ?? null,
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
  }

  if (typeof payload.rezultat !== "undefined") {
    fallback.rezultat = payload.rezultat;
  }

  if (typeof payload.vrsta_rezultata !== "undefined") {
    fallback.vrsta_rezultata = payload.vrsta_rezultata;
  }

  if (typeof payload.jedinica_mere !== "undefined") {
    fallback.jedinica_mere = payload.jedinica_mere;
  }

  if (typeof payload.timestamp !== "undefined") {
    fallback.timestamp = payload.timestamp;
  }

  return fallback;
}