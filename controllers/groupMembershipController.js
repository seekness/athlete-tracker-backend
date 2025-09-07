const {
  fetchAthletesByGroupId,
  updateGroupMembers,
  removeGroup
} = require("../models/groupMembershipModel");

async function getGroupAthletes(req, res) {
  const { groupId } = req.params;
  try {
    const athletes = await fetchAthletesByGroupId(groupId);
    res.status(200).json(athletes);
  } catch (error) {
    console.error("Greška pri dobijanju sportista za grupu:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function updateGroupAthletes(req, res) {
  const { groupId } = req.params;
  const { athlete_ids } = req.body;

  if (!athlete_ids) {
    return res.status(400).send("Niz ID-jeva sportista je obavezan.");
  }

  try {
    await updateGroupMembers(groupId, athlete_ids);
    res.status(200).send("Članovi grupe su uspešno ažurirani.");
  } catch (error) {
    console.error("Greška pri ažuriranju članova grupe:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteGroup(req, res) {
  const { groupId } = req.params;
  try {
    const success = await removeGroup(groupId);
    if (!success) {
      return res.status(404).send("Grupa nije pronađena.");
    }
    res.status(200).send("Grupa je uspešno obrisana.");
  } catch (error) {
    console.error("Greška pri brisanju grupe:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  getGroupAthletes,
  updateGroupAthletes,
  deleteGroup
};