const { validationResult } = require('express-validator');
const merenjeModel = require('../models/merenjeModel');

async function dodajMerenje(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ poruka: 'Validacija nije prošla', greske: errors.array() });
  }

  try {
    const data = req.body;

    const fizickeId = await merenjeModel.dodajFizickeMere(data);
    const napredneId = await merenjeModel.dodajNapredneMere(data);

    res.status(201).json({
      poruka: 'Merenje uspešno dodato',
      fizicke_mere_id: fizickeId,
      napredne_mere_id: napredneId
    });
  } catch (err) {
    console.error('Greška pri dodavanju merenja:', err);
    res.status(500).json({ poruka: 'Greška na serveru' });
  }
}

async function getMerenja(req, res) {
  const athlete_id = req.params.athlete_id;

  try {
    const podaci = await merenjeModel.getMerenjaZaSportistu(athlete_id);

    res.status(200).json({
      poruka: 'Merenja uspešno dohvaćena',
      fizicke_mere: podaci.fizicke,
      napredne_mere: podaci.napredne
    });
  } catch (err) {
    console.error('Greška pri dohvatanju merenja:', err);
    res.status(500).json({ poruka: 'Greška na serveru' });
  }
}

async function obrisiMerenje(req, res) {
  const id = req.params.id;

  try {
    const fizickeObrisano = await merenjeModel.obrisiFizickeMere(id);
    const napredneObrisano = await merenjeModel.obrisiNapredneMere(id);

    if (fizickeObrisano === 0 && napredneObrisano === 0) {
      return res.status(404).json({ poruka: 'Merenje nije pronađeno' });
    }

    res.status(200).json({ poruka: 'Merenje uspešno obrisano' });
  } catch (err) {
    console.error('Greška pri brisanju merenja:', err);
    res.status(500).json({ poruka: 'Greška na serveru' });
  }
}

async function izmeniMerenje(req, res) {
  const id = req.params.id;
  const data = req.body;

  try {
    const fizickeIzmenjeno = await merenjeModel.izmeniFizickeMere(id, data);
    const napredneIzmenjeno = await merenjeModel.izmeniNapredneMere(id, data);

    if (fizickeIzmenjeno === 0 && napredneIzmenjeno === 0) {
      return res.status(404).json({ poruka: 'Merenje nije pronađeno' });
    }

    res.status(200).json({ poruka: 'Merenje uspešno izmenjeno' });
  } catch (err) {
    console.error('Greška pri izmeni merenja:', err);
    res.status(500).json({ poruka: 'Greška na serveru' });
  }
}

module.exports = {
  dodajMerenje,
  getMerenja,
  obrisiMerenje,
  izmeniMerenje
};