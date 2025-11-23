const {
  insertSchedule,
  fetchSchedulesByProgramId,
  fetchSchedulesByPlanId,
  updateSchedule,
  deleteSchedule
} = require("../models/trainingScheduleModel");

async function createSchedule(req, res) {
  const { training_id, datum, vreme, location_id, training_plan_id } = req.body;
  if (!training_id || !datum || !vreme || !training_plan_id) {
    return res.status(400).send("Trening, datum, vreme i plan su obavezni.");
  }
  try {
    await insertSchedule(training_id, datum, vreme, location_id, training_plan_id);
    res.status(201).send("Termin uspešno zakazan.");
  } catch (error) {
    console.error("Greška pri zakazivanju termina:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getSchedules(req, res) {
  const { programId } = req.params;
  try {
    const schedules = await fetchSchedulesByProgramId(programId);
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Greška pri dobijanju rasporeda:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getSchedulesByPlan(req, res) {
  const { planId } = req.params;
  try {
    const schedules = await fetchSchedulesByPlanId(planId);
    res.status(200).json(schedules);
  } catch (error) {
    console.error("Greška pri dobijanju rasporeda za plan:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function updateScheduleDetails(req, res) {
  const { id } = req.params;
  const { datum, vreme, location_id } = req.body;
  try {
    await updateSchedule(id, datum, vreme, location_id);
    res.send("Termin uspešno ažuriran.");
  } catch (error) {
    console.error("Greška pri ažuriranju termina:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteScheduleById(req, res) {
  const { id } = req.params;
  try {
    await deleteSchedule(id);
    res.send("Termin uspešno obrisan.");
  } catch (error) {
    console.error("Greška pri brisanju termina:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  createSchedule,
  getSchedules,
  getSchedulesByPlan,
  updateScheduleDetails,
  deleteScheduleById
};
