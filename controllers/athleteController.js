const {
  insertAthlete,
  fetchAllAthletesWithGroups,
  fetchGroupsByAthleteId,
  fetchAthleteById,
  removeAthleteById,
  updateAthleteById,
  fetchAllAthletes,
  fetchAllCompetitors

} = require("../models/athleteModel");

async function createAthlete(req, res) {
  const {
    ime, prezime, username, ime_roditelja, jmbg, datum_rodenja,
    mesto_rodenja, adresa_stanovanja, mesto_stanovanja,
    broj_telefona, email, aktivan, broj_knjizice,
    datum_poslednjeg_sportskog_pregleda, is_paying_member, payment_start_date
  } = req.body;

  if (!username) return res.status(400).json({ error: "Korisničko ime je obavezno." });
  if (jmbg && jmbg.length !== 13) return res.status(400).json({ error: "JMBG mora imati 13 cifara." });

  try {
    await insertAthlete({
      ime, prezime, username, ime_roditelja, jmbg, datum_rodenja,
      mesto_rodenja, adresa_stanovanja, mesto_stanovanja,
      broj_telefona, email, aktivan, broj_knjizice,
      datum_poslednjeg_sportskog_pregleda, is_paying_member, payment_start_date
    });
    res.status(201).json({ message: "Sportista je uspešno dodat." });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Korisničko ime već postoji." });
    }
    console.error("Greška pri dodavanju sportiste:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function getAllAthletes(req, res) {
  try {
    const activeOnly = req.query.activeOnly === 'true';
    const athletes = await fetchAllAthletesWithGroups(activeOnly);
    res.status(200).json(athletes);
  } catch (error) {
    console.error("Greška pri dobijanju sportista:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function getAthleteGroups(req, res) {
  const { athleteId } = req.params;
  try {
    const groups = await fetchGroupsByAthleteId(athleteId);
    if (groups === null) {
      return res.status(404).json({ error: "Sportista nije pronađen." });
    }
    res.status(200).json(groups);
  } catch (error) {
    console.error("Greška pri dobijanju grupa za sportistu:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function deleteAthlete(req, res) {
  const { id } = req.params;
  try {
    const athlete = await fetchAthleteById(id);
    if (!athlete) {
      return res.status(404).json({ error: "Sportista nije pronađen." });
    }

    await removeAthleteById(id);
    res.status(200).json({ message: "Sportista je uspešno obrisan." });
  } catch (error) {
    console.error("Greška pri brisanju sportiste:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function updateAthlete(req, res) {
  const { athleteId } = req.params;
  const athleteData = req.body;

  try {
    await updateAthleteById(athleteId, athleteData);
    res.status(200).json({ message: "Sportista je uspešno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju sportiste:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getAllAthletes2(req, res) {
  try {
    const athletes = await fetchAllAthletes();
    res.json(athletes);
  } catch (error) {
    console.error("Greška pri dobijanju spiska svih sportista:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getAllCompetitors(req, res) {
  try {
    const competitors = await fetchAllCompetitors();
    res.status(200).json(competitors);
  } catch (error) {
    console.error("Greška pri dobijanju liste takmičara:", error);
    res.status(500).json({ message: "Greška pri dobijanju liste takmičara." });
  }
}

module.exports = {
  createAthlete,
  getAllAthletes,
  getAthleteGroups,
  deleteAthlete,
  updateAthlete,
  getAllAthletes2,
  getAllCompetitors
};