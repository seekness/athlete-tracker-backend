const db = require('../db');

async function dodajFizickeMere(data) {
  const [rezultat] = await db.execute(`
    INSERT INTO fizicke_mere (
      athlete_id, datum_merenja,
      visina_cm, tezina_kg, obim_struka_cm, obim_kukova_cm,
      obim_grudi_cm, obim_nadlaktice_cm, obim_podlaktice_cm,
      obim_ramena_cm, obim_butine_cm, obim_vrata_cm
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    data.athlete_id, data.datum_merenja,
    data.visina_cm, data.tezina_kg, data.obim_struka_cm, data.obim_kukova_cm,
    data.obim_grudi_cm, data.obim_nadlaktice_cm, data.obim_podlaktice_cm,
    data.obim_ramena_cm, data.obim_butine_cm, data.obim_vrata_cm
  ]);

  return rezultat.insertId;
}

async function dodajNapredneMere(data) {
  const [rezultat] = await db.execute(`
    INSERT INTO napredne_mere (
      athlete_id, datum_merenja,
      body_fat_percent, lean_mass_kg, bmr, vo2_max
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    data.athlete_id, data.datum_merenja,
    data.body_fat_percent, data.lean_mass_kg, data.bmr, data.vo2_max
  ]);

  return rezultat.insertId;
}

async function getMerenjaZaSportistu(athlete_id) {
  const [fizicke] = await db.execute(`
    SELECT * FROM fizicke_mere
    WHERE athlete_id = ?
    ORDER BY datum_merenja DESC
  `, [athlete_id]);

  const [napredne] = await db.execute(`
    SELECT * FROM napredne_mere
    WHERE athlete_id = ?
    ORDER BY datum_merenja DESC
  `, [athlete_id]);

  return { fizicke, napredne };
}

async function obrisiFizickeMere(id) {
  const [rezultat] = await db.execute(`
    DELETE FROM fizicke_mere WHERE id = ?
  `, [id]);
  return rezultat.affectedRows;
}

async function obrisiNapredneMere(id) {
  const [rezultat] = await db.execute(`
    DELETE FROM napredne_mere WHERE id = ?
  `, [id]);
  return rezultat.affectedRows;
}

async function izmeniFizickeMere(id, data) {
  const [rezultat] = await db.execute(`
    UPDATE fizicke_mere SET
      datum_merenja = ?,
      visina_cm = ?, tezina_kg = ?, obim_struka_cm = ?, obim_kukova_cm = ?,
      obim_grudi_cm = ?, obim_nadlaktice_cm = ?, obim_podlaktice_cm = ?,
      obim_ramena_cm = ?, obim_butine_cm = ?, obim_vrata_cm = ?
    WHERE id = ?
  `, [
    data.datum_merenja,
    data.visina_cm, data.tezina_kg, data.obim_struka_cm, data.obim_kukova_cm,
    data.obim_grudi_cm, data.obim_nadlaktice_cm, data.obim_podlaktice_cm,
    data.obim_ramena_cm, data.obim_butine_cm, data.obim_vrata_cm,
    id
  ]);

  return rezultat.affectedRows;
}

async function izmeniNapredneMere(id, data) {
  const [rezultat] = await db.execute(`
    UPDATE napredne_mere SET
      datum_merenja = ?,
      body_fat_percent = ?, lean_mass_kg = ?, bmr = ?, vo2_max = ?
    WHERE id = ?
  `, [
    data.datum_merenja,
    data.body_fat_percent, data.lean_mass_kg, data.bmr, data.vo2_max,
    id
  ]);

  return rezultat.affectedRows;
}

module.exports = {
  dodajFizickeMere,
  dodajNapredneMere,
  getMerenjaZaSportistu,
  obrisiFizickeMere,
  obrisiNapredneMere,
  izmeniFizickeMere,
  izmeniNapredneMere
};
