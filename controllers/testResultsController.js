const dbPool = require("../db/pool");

async function createTestResult(req, res) {
  const { test_id, sportista_id, test_exercise_id, vrednost, napomena } = req.body;

  if (!test_id || !sportista_id || !test_exercise_id || typeof vrednost === "undefined") {
    return res.status(400).json({ error: "test_id, sportista_id, test_exercise_id i vrednost su obavezni" });
  }

  try {
    const [result] = await dbPool.query(
      `
        INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        test_id,
        sportista_id,
        test_exercise_id,
        vrednost,
        typeof napomena !== "undefined" ? napomena : null,
      ]
    );

    res.status(201).json({
      message: "Rezultat uspešno unet",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Greška pri unosu rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  }
}

async function createBulkTestResults(req, res) {
  const { test_id, sportista_id, rezultati } = req.body;

  if (!test_id || !sportista_id || !Array.isArray(rezultati) || !rezultati.length) {
    return res.status(400).json({ error: "Nedostaju obavezna polja ili nema rezultata" });
  }

  const values = rezultati.map((r) => [
    test_id,
    sportista_id,
    r.test_exercise_id,
    r.vrednost,
    typeof r.napomena !== "undefined" ? r.napomena : null,
  ]);

  try {
    await dbPool.query(
      `
        INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
        VALUES ?
      `,
      [values]
    );

    res.status(201).json({
      message: "Rezultati uspešno uneti",
      count: values.length,
    });
  } catch (error) {
    console.error("Greška pri unosu rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu rezultata" });
  }
}

async function createGroupTestResults(req, res) {
  const { test_id, rezultati } = req.body;

  if (!test_id || !Array.isArray(rezultati) || !rezultati.length) {
    return res.status(400).json({ error: "Nedostaju test_id ili rezultati" });
  }

  const values = rezultati.map((r) => [
    test_id,
    r.sportista_id,
    r.test_exercise_id,
    r.vrednost,
    typeof r.napomena !== "undefined" ? r.napomena : null,
  ]);

  try {
    await dbPool.query(
      `
        INSERT INTO test_results (test_id, sportista_id, test_exercise_id, vrednost, napomena)
        VALUES ?
      `,
      [values]
    );

    res.status(201).json({
      message: "Rezultati uspešno uneti",
      count: values.length,
    });
  } catch (error) {
    console.error("Greška pri unosu grupnih rezultata:", error);
    res.status(500).json({ error: "Greška pri unosu grupnih rezultata" });
  }
}

async function updateTestResult(req, res) {
  const { id } = req.params;
  const { vrednost, napomena } = req.body;

  if (typeof vrednost === "undefined") {
    return res.status(400).json({ error: "vrednost je obavezna" });
  }

  try {
    const [result] = await dbPool.query(
      `UPDATE test_results SET vrednost = ?, napomena = ? WHERE id = ?`,
      [vrednost, typeof napomena !== "undefined" ? napomena : null, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rezultat nije pronađen" });
    }

    res.json({ message: "Rezultat uspešno izmenjen" });
  } catch (error) {
    console.error("Greška pri izmeni rezultata:", error);
    res.status(500).json({ error: "Greška pri izmeni rezultata" });
  }
}

async function deleteTestResult(req, res) {
  const { id } = req.params;

  try {
    const [result] = await dbPool.query(`DELETE FROM test_results WHERE id = ?`, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Rezultat nije pronađen" });
    }

    res.json({ message: "Rezultat uspešno obrisan" });
  } catch (error) {
    console.error("Greška pri brisanju rezultata:", error);
    res.status(500).json({ error: "Greška pri brisanju rezultata" });
  }
}

module.exports = {
  createTestResult,
  createBulkTestResults,
  createGroupTestResults,
  updateTestResult,
  deleteTestResult,
};