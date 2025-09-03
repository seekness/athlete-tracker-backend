const db = require("../db/pool");

async function dodajFizickeMere(data) {
  const vrednosti = [
    data.athlete_id ?? null,
    data.datum_merenja ?? null,
    data.visina_cm ?? null,
    data.tezina_kg ?? null,
    data.obim_struka_cm ?? null,
    data.obim_kukova_cm ?? null,
    data.obim_grudi_cm ?? null,
    data.obim_nadlaktice_cm ?? null,
    data.obim_podlaktice_cm ?? null,
    data.obim_ramena_cm ?? null,
    data.obim_butine_cm ?? null,
    data.obim_vrata_cm ?? null,
  ];

  const [rezultat] = await db.execute(
    `
  INSERT INTO fizicke_mere (
    athlete_id, datum_merenja,
    visina_cm, tezina_kg, obim_struka_cm, obim_kukova_cm,
    obim_grudi_cm, obim_nadlaktice_cm, obim_podlaktice_cm,
    obim_ramena_cm, obim_butine_cm, obim_vrata_cm
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`,
    vrednosti
  );

  return rezultat.insertId;
}

async function dodajNapredneMere(data) {
  const vrednosti = [
    data.athlete_id ?? null,
    data.datum_merenja ?? null,
    data.body_fat_percent ?? null,
    data.lean_mass_kg ?? null,
    data.bmr ?? null,
    data.vo2_max ?? null,
  ];

  const [rezultat] = await db.execute(
    `
    INSERT INTO napredne_mere (
      athlete_id, datum_merenja,
      body_fat_percent, lean_mass_kg, bmr, vo2_max
    ) VALUES (?, ?, ?, ?, ?, ?)
`,
    vrednosti
  );

  return rezultat.insertId;
}

async function getMerenjaZaSportistu(athlete_id) {
  const [fizicke] = await db.execute(
    `
    SELECT * FROM fizicke_mere
    WHERE athlete_id = ?
    ORDER BY datum_merenja DESC
  `,
    [athlete_id]
  );

  const [napredne] = await db.execute(
    `
    SELECT * FROM napredne_mere
    WHERE athlete_id = ?
    ORDER BY datum_merenja DESC
  `,
    [athlete_id]
  );

  return { fizicke, napredne };
}

async function getFizickeMereById(fizicke_mere_id) {
  const [rows] = await db.execute(
    `SELECT * FROM fizicke_mere WHERE id = ?`,
    [fizicke_mere_id]
  );

  return rows[0] ?? null;
}

async function getNapredneMereById(napredne_mere_id) {
  const [rows] = await db.execute(
    `SELECT * FROM napredne_mere WHERE id = ?`,
    [napredne_mere_id]
  );

  return rows[0] ?? null;
}

async function obrisiFizickeMere(id) {
  const [rezultat] = await db.execute(
    `
    DELETE FROM fizicke_mere WHERE id = ?
  `,
    [id]
  );
  return rezultat.affectedRows;
}

async function obrisiNapredneMere(id) {
  const [rezultat] = await db.execute(
    `
    DELETE FROM napredne_mere WHERE id = ?
  `,
    [id]
  );
  return rezultat.affectedRows;
}

async function izmeniFizickeMere(id, data) {
  const [rezultat] = await db.execute(
    `
    UPDATE fizicke_mere SET
      datum_merenja = ?,
      visina_cm = ?, tezina_kg = ?, obim_struka_cm = ?, obim_kukova_cm = ?,
      obim_grudi_cm = ?, obim_nadlaktice_cm = ?, obim_podlaktice_cm = ?,
      obim_ramena_cm = ?, obim_butine_cm = ?, obim_vrata_cm = ?
    WHERE id = ?
  `,
    [
      data.datum_merenja,
      data.visina_cm,
      data.tezina_kg,
      data.obim_struka_cm,
      data.obim_kukova_cm,
      data.obim_grudi_cm,
      data.obim_nadlaktice_cm,
      data.obim_podlaktice_cm,
      data.obim_ramena_cm,
      data.obim_butine_cm,
      data.obim_vrata_cm,
      id,
    ]
  );

  return rezultat.affectedRows;
}

async function izmeniNapredneMere(id, data) {
  const [rezultat] = await db.execute(
    `
    UPDATE napredne_mere SET
      datum_merenja = ?,
      body_fat_percent = ?, lean_mass_kg = ?, bmr = ?, vo2_max = ?
    WHERE id = ?
  `,
    [
      data.datum_merenja,
      data.body_fat_percent,
      data.lean_mass_kg,
      data.bmr,
      data.vo2_max,
      id,
    ]
  );

  return rezultat.affectedRows;
}

async function nadjiMerenjeFizickePoDatumu(athlete_id, datum_merenja) {
  const [rows] = await db.execute(
    `SELECT id FROM fizicke_mere WHERE athlete_id = ? AND datum_merenja = ?`,
    [athlete_id, datum_merenja]
  );
  return rows.length > 0 ? rows[0].id : null;
}

async function nadjiMerenjeNaprednePoDatumu(athlete_id, datum_merenja) {
  const [rows] = await db.execute(
    `SELECT id FROM napredne_mere WHERE athlete_id = ? AND datum_merenja = ?`,
    [athlete_id, datum_merenja]
  );
  return rows.length > 0 ? rows[0].id : null;
}

async function updateFizickeMere(id, data) {
  const fields = [];
  const values = [];
  const dozvoljenaPolja = [
    "visina_cm",
    "tezina_kg",
    "obim_struka_cm",
    "obim_kukova_cm",
    "obim_grudi_cm",
    "obim_nadlaktice_cm",
    "obim_podlaktice_cm",
    "obim_ramena_cm",
    "obim_butine_cm",
    "obim_vrata_cm",
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (dozvoljenaPolja.includes(key) && value !== null) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  values.push(id); // za WHERE

  await db.execute(
    `UPDATE fizicke_mere SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

async function updateNapredneMere(id, data) {
  const fields = [];
  const values = [];
  const dozvoljenaPolja = [
    "body_fat_percent",
    "lean_mass_kg",
    "bmr",
    "vo2_max",
  ];

  Object.entries(data).forEach(([key, value]) => {
    if (dozvoljenaPolja.includes(key) && value !== null) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (fields.length === 0) return;

  values.push(id); // za WHERE

  await db.execute(
    `UPDATE napredne_mere SET ${fields.join(", ")} WHERE id = ?`,
    values
  );
}

module.exports = {
  dodajFizickeMere,
  dodajNapredneMere,
  getMerenjaZaSportistu,
  nadjiMerenjeFizickePoDatumu,
  nadjiMerenjeNaprednePoDatumu,
  obrisiFizickeMere,
  obrisiNapredneMere,
  updateFizickeMere,
  updateNapredneMere,
  izmeniFizickeMere,
  izmeniNapredneMere,
  getFizickeMereById,
  getNapredneMereById
};
