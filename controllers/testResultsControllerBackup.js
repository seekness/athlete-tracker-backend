const dbPool = require("../db/pool");

async function createTestResult(req, res) {
  const { test_id, sportista_id, test_exercise_id, vrednost, napomena } =
    req.body;

  if (!test_id || !sportista_id || !test_exercise_id || !vrednost) {
    return res.status(400).json({ error: "Nedostaju obavezna polja" });
  }

  try {
    const [result] = await db.query(
      `
      INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
      VALUES (?, ?, ?, ?, ?)
      `,
      [test_id, sportista_id, test_exercise_id, vrednost, napomena || null]
    );

    res
      .status(201)
      .json({ message: "Rezultat uspešno unet", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  }
}

async function createBulkTestResults(req, res) {
  const { test_id, sportista_id, rezultati } = req.body;

  if (
    !test_id ||
    !sportista_id ||
    !Array.isArray(rezultati) ||
    rezultati.length === 0
  ) {
    return res
      .status(400)
      .json({ error: "Nedostaju obavezna polja ili rezultati" });
  }

  const values = rezultati.map((r) => [
    test_id,
    sportista_id,
    r.test_exercise_id,
    r.vrednost,
    r.napomena || null,
  ]);

  try {
    await db.query(
      `
      INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
      VALUES ?
      `,
      [values]
    );

    res
      .status(201)
      .json({ message: "Rezultati uspešno uneti", count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  }
}

async function createGroupTestResults(req, res) {
  const { test_id, rezultati } = req.body;

  if (!test_id || !Array.isArray(rezultati) || rezultati.length === 0) {
    return res.status(400).json({ error: "Nedostaju test_id ili rezultati" });
  }

  const values = rezultati.map((r) => [
    test_id,
    r.sportista_id,
    r.test_exercise_id,
    r.vrednost,
    r.napomena || null,
  ]);

  try {
    await db.query(
      `
      INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
      VALUES ?
      `,
      [values]
    );

    res
      .status(201)
      .json({ message: "Rezultati uspešno uneti", count: values.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri unosu grupnih rezultata" });
  }
}

async function deleteTestResult(req, res) {
  const { id } = req.params;

  try {
    await db.query(`DELETE FROM test_results WHERE id = ?`, [id]);
    res.json({ message: "Rezultat uspešno obrisan" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Greška pri brisanju rezultata" });
  }
}

async function updateTestResult(req, res) {
  const { id } = req.params;
  const { vrednost, napomena } = req.body;

  if (!vrednost) {
    return res.status(400).json({ error: 'Vrednost je obavezna' });
  }

  try {
    await db.query(
      `UPDATE test_results SET vrednost = ?, napomena = ? WHERE id = ?`,
      [vrednost, napomena || null, id]
    );

    res.json({ message: 'Rezultat uspešno izmenjen' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Greška pri izmeni rezultata' });
  }
}

module.exports = {
  createBulkTestResults,
  createTestResult,
  createGroupTestResults,
  deleteTestResult,
  updateTestResult,
};
