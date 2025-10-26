const {
  createIndividual,
  getAllIndividuals,
  getIndividualById,
  getIndividualByUserId,
  updateIndividualById,
  removeIndividualById,
} = require("../models/individualModel");

const ALLOWED_GENDERS = new Set(["musko", "zensko", "drugo"]);

function normalizeGender(value) {
  if (value == null || value === "") {
    return { value: null, error: null };
  }

  const lower = String(value).toLowerCase();
  if (ALLOWED_GENDERS.has(lower)) {
    return { value: lower, error: null };
  }

  return {
    value: null,
    error: "Dozvoljene vrednosti za pol su 'musko', 'zensko' ili 'drugo'.",
  };
}

function validateRequiredFields(body) {
  if (body.user_id == null) {
    return "Polje user_id je obavezno.";
  }
  if (!body.ime || !body.ime.toString().trim()) {
    return "Ime je obavezno.";
  }
  if (!body.prezime || !body.prezime.toString().trim()) {
    return "Prezime je obavezno.";
  }
  return null;
}

async function handleCreate(req, res) {
  const { value: normalizedGender, error: genderError } = normalizeGender(req.body.pol);
  if (genderError) {
    return res.status(400).json({ error: genderError });
  }

  const userId = Number(req.body.user_id);
  if (!Number.isInteger(userId) || userId <= 0) {
    return res.status(400).json({ error: "Polje user_id mora biti pozitivan ceo broj." });
  }

  const payload = {
    ...req.body,
    user_id: userId,
    ime: req.body.ime?.toString().trim(),
    prezime: req.body.prezime?.toString().trim(),
    cilj: req.body.cilj?.toString().trim() || null,
    pol: normalizedGender,
    email: req.body.email?.toString().trim() || null,
  };

  const validationError = validateRequiredFields(payload);
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  try {
    const insertId = await createIndividual(payload);
    res.status(201).json({ message: "Individualac je uspešno kreiran.", id: insertId });
  } catch (error) {
    console.error("Greška pri kreiranju individualca:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Za ovog korisnika već postoji individualni profil." });
    }
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function handleGetAll(req, res) {
  try {
    const individuals = await getAllIndividuals();
    res.status(200).json(individuals);
  } catch (error) {
    console.error("Greška pri dobijanju liste individualaca:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function handleGetById(req, res) {
  try {
    const individual = await getIndividualById(req.params.id);
    if (!individual) {
      return res.status(404).json({ error: "Individualac nije pronađen." });
    }
    res.status(200).json(individual);
  } catch (error) {
    console.error("Greška pri dobijanju individualca:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function handleGetByUserId(req, res) {
  try {
    const individual = await getIndividualByUserId(req.params.userId);
    if (!individual) {
      return res.status(404).json({ error: "Individualac nije pronađen za prosleđenog korisnika." });
    }
    res.status(200).json(individual);
  } catch (error) {
    console.error("Greška pri dobijanju individualca po korisniku:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function handleUpdate(req, res) {
  try {
    const existing = await getIndividualById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: "Individualac nije pronađen." });
    }

    const merged = {
      ...existing,
      ...req.body,
    };

    const userId = Number(merged.user_id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Polje user_id mora biti pozitivan ceo broj." });
    }

    const { value: normalizedGender, error: genderError } = normalizeGender(merged.pol);
    if (genderError) {
      return res.status(400).json({ error: genderError });
    }

    const payload = {
      ...merged,
      user_id: userId,
      ime: merged.ime?.toString().trim(),
      prezime: merged.prezime?.toString().trim(),
      cilj: merged.cilj?.toString().trim() || null,
      pol: normalizedGender,
      email: merged.email?.toString().trim() || null,
    };

    const validationError = validateRequiredFields(payload);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const affectedRows = await updateIndividualById(req.params.id, payload);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Individualac nije pronađen." });
    }
    res.status(200).json({ message: "Podaci individualca su uspešno ažurirani." });
  } catch (error) {
    console.error("Greška pri ažuriranju individualca:", error);
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Za ovog korisnika već postoji individualni profil." });
    }
    res.status(500).json({ error: "Greška na serveru." });
  }
}

async function handleDelete(req, res) {
  try {
    const affectedRows = await removeIndividualById(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: "Individualac nije pronađen." });
    }
    res.status(200).json({ message: "Individualac je uspešno obrisan." });
  } catch (error) {
    console.error("Greška pri brisanju individualca:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  handleCreate,
  handleGetAll,
  handleGetById,
  handleGetByUserId,
  handleUpdate,
  handleDelete,
};
