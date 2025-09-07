const {
  getAthletesByCoachId,
  getGroupsByCoachId,
  getAthletesByUserId,
  getGroupsByUserId,
  assignAthlete,
  assignGroup,
  assignBulk,
  unassignAthlete,
  unassignGroup
} = require("../models/coachAssignmentModel");

async function getAssignedAthletesByCoachId(req, res) {
  try {
    const { coachId } = req.params;
    const athletes = await getAthletesByCoachId(coachId);
    res.status(200).json(athletes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dobijanju dodeljenih sportista." });
  }
}

async function getAssignedGroupsByCoachId(req, res) {
  try {
    const { coachId } = req.params;
    const groups = await getGroupsByCoachId(coachId);
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dobijanju dodeljenih grupa." });
  }
}

async function getAssignedAthletesByUserId(req, res) {
  try {
    const { userId } = req.params;
    const athletes = await getAthletesByUserId(userId);
    res.status(200).json(athletes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dobijanju dodeljenih sportista." });
  }
}

async function getAssignedGroupsByUserId(req, res) {
  try {
    const { userId } = req.params;
    const groups = await getGroupsByUserId(userId);
    res.status(200).json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dobijanju dodeljenih grupa." });
  }
}

async function assignAthleteToCoach(req, res) {
  const { athleteId } = req.body;
  const coachId = req.user.id;

  try {
    const alreadyAssigned = await assignAthlete(coachId, athleteId);
    res.status(alreadyAssigned ? 200 : 201).json({
      message: alreadyAssigned
        ? "Sportista je već dodat treneru."
        : "Sportista je uspešno dodat treneru."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dodeli sportiste treneru." });
  }
}

async function assignGroupToCoach(req, res) {
  const { groupId } = req.body;
  const coachId = req.user.id;

  try {
    const alreadyAssigned = await assignGroup(coachId, groupId);
    res.status(alreadyAssigned ? 200 : 201).json({
      message: alreadyAssigned
        ? "Grupa je već dodata treneru."
        : "Grupa je uspešno dodata treneru."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Greška pri dodeli grupe treneru." });
  }
}

async function assignMultipleToCoachAdmin(req, res) {
  const { coach_id, athlete_ids, group_ids } = req.body;

  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Samo administrator može vršiti dodele." });
  }

  if (!coach_id) {
    return res.status(400).json({ message: "ID trenera je obavezan." });
  }

  try {
    await assignBulk(coach_id, athlete_ids, group_ids);
    res.status(200).json({ message: "Sportisti i grupe su uspešno dodeljeni." });
  } catch (error) {
    console.error("Greška pri dodeli:", error);
    res.status(500).json({ message: "Greška pri dodeli. Molimo pokušajte ponovo." });
  }
}

async function unassignAthleteFromCoach(req, res) {
  const { coach_id, athlete_id } = req.body;

  if (!coach_id || !athlete_id) {
    return res.status(400).json({ message: "Oba ID-a su obavezna." });
  }

  try {
    const success = await unassignAthlete(coach_id, athlete_id);
    if (!success) {
      return res.status(404).json({ message: "Dodela nije pronađena." });
    }
    res.status(200).json({ message: "Sportista je uspešno uklonjen sa trenera." });
  } catch (error) {
    console.error("Greška pri uklanjanju sportiste:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function unassignGroupFromCoach(req, res) {
  const { coach_id, group_id } = req.body;

  if (!coach_id || !group_id) {
    return res.status(400).json({ message: "Oba ID-a su obavezna." });
  }

  try {
    const success = await unassignGroup(coach_id, group_id);
    if (!success) {
      return res.status(404).json({ message: "Dodela nije pronađena." });
    }
    res.status(200).json({ message: "Grupa je uspešno uklonjena sa trenera." });
  } catch (error) {
    console.error("Greška pri uklanjanju grupe:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

//Dobijanje svih sportista dodeljenih treneru i svih grupa
async function getCoachAssignmentsSummary(req, res) {
  const { userId } = req.params;
  try {
    const athletes = await fetchAssignedAthletesByUserId(userId);
    const groups = await fetchAssignedGroupsByUserId(userId);
    res.status(200).json({ athletes, groups });
  } catch (error) {
    console.error("Greška pri dobijanju dodela:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

module.exports = {
  getAssignedAthletesByCoachId,
  getAssignedGroupsByCoachId,
  getAssignedAthletesByUserId,
  getAssignedGroupsByUserId,
  getCoachAssignmentsSummary,
  assignAthleteToCoach,
  assignGroupToCoach,
  assignMultipleToCoachAdmin,
  unassignAthleteFromCoach,
  unassignGroupFromCoach
};