const { validationResult } = require("express-validator");
const merenjeModel = require("../models/merenjeModel");

async function dodajMerenje(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ poruka: "Validacija nije prošla", greske: errors.array() });
  }

  try {
    const data = req.body;
    let fizickeId = 0;
    let napredneId = 0;
    // Provera da li već postoji merenje za datog sportistu na dati datum
    const postojiF = await merenjeModel.nadjiMerenjeFizickePoDatumu(
      data.athlete_id,
      data.datum_merenja
    );
    if (postojiF) {
      await merenjeModel.updateFizickeMere(postojiF, data);
      // isto za napredne mere ako ih imaš
    } else {
      fizickeId = await merenjeModel.dodajFizickeMere(data);
    }

    // Provera da li već postoji napredne mere za datog sportistu na dati datum
    const postojiN = await merenjeModel.nadjiMerenjeNaprednePoDatumu(
      data.athlete_id,
      data.datum_merenja
    );
    if (postojiN) {
      await merenjeModel.updateNapredneMere(postojiN, data);
      // isto za napredne mere ako ih imaš
    } else {
      napredneId = await merenjeModel.dodajNapredneMere(data);
    }

    const akcija = postojiF || postojiN ? "azurirano" : "dodato";

    res.status(201).json({
      poruka: `Merenje uspešno ${akcija}`,
      fizicke_mere_id: fizickeId,
      napredne_mere_id: napredneId,
    });
  } catch (err) {
    console.error("Greška pri dodavanju merenja:", err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
}

async function getMerenja(req, res) {
  const athlete_id = req.params.athlete_id;

  try {
    const podaci = await merenjeModel.getMerenjaZaSportistu(athlete_id);

    res.status(200).json({
      poruka: "Merenja uspešno dohvaćena",
      fizicke_mere: podaci.fizicke,
      napredne_mere: podaci.napredne,
    });
  } catch (err) {
    console.error("Greška pri dohvatanju merenja:", err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
}

async function obrisiMerenje(req, res) {
  const id = req.params.id;

  try {
    const fizickeObrisano = await merenjeModel.obrisiFizickeMere(id);
    const napredneObrisano = await merenjeModel.obrisiNapredneMere(id);

    if (fizickeObrisano === 0 && napredneObrisano === 0) {
      return res.status(404).json({ poruka: "Merenje nije pronađeno" });
    }

    res.status(200).json({ poruka: "Merenje uspešno obrisano" });
  } catch (err) {
    console.error("Greška pri brisanju merenja:", err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
}

async function izmeniMerenje(req, res) {
  const id = req.params.id;
  const data = req.body;

  try {
    const fizickeIzmenjeno = await merenjeModel.izmeniFizickeMere(id, data);
    const napredneIzmenjeno = await merenjeModel.izmeniNapredneMere(id, data);

    if (fizickeIzmenjeno === 0 && napredneIzmenjeno === 0) {
      return res.status(404).json({ poruka: "Merenje nije pronađeno" });
    }

    res.status(200).json({ poruka: "Merenje uspešno izmenjeno" });
  } catch (err) {
    console.error("Greška pri izmeni merenja:", err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
}

async function getMerenjeZaDatum(req, res) {
  const { athlete_id, datum } = req.params;

  try {
    const fizickeId = await merenjeModel.nadjiMerenjeFizickePoDatumu(athlete_id, datum);
    const napredneId = await merenjeModel.nadjiMerenjeNaprednePoDatumu(athlete_id, datum);

    const fizicke = fizickeId
      ? await merenjeModel.getFizickeMereById(fizickeId)
      : null;

    const napredne = napredneId
      ? await merenjeModel.getNapredneMereById(napredneId)
      : null;

    res.status(200).json({ fizicke, napredne });
  } catch (err) {
    console.error("Greška pri dohvatanju merenja za datum:", err);
    res.status(500).json({ poruka: "Greška na serveru" });
  }
}

module.exports = {
  dodajMerenje,
  getMerenja,
  obrisiMerenje,
  izmeniMerenje,
  getMerenjeZaDatum
};
