const {
  createTrainingPlan,
  getAllTrainingPlans,
  getTrainingPlanById,
  updateTrainingPlan,
  deleteTrainingPlan,
  addPlanAssignments,
  getPlanAssignments,
  updatePlanAssignments
} = require("../models/trainingPlanModel");
const { 
  insertSchedule, 
  fetchSchedulesByPlanId, 
  deleteSchedule 
} = require("../models/trainingScheduleModel");
const dbPool = require("../db/pool");

async function createPlan(req, res) {
  const { naziv, schedules, assignments } = req.body;
  const createdBy = req.user.id;

  if (!naziv) {
    return res.status(400).send("Naziv plana je obavezan.");
  }

  try {
    // 1. Create Plan
    const planId = await createTrainingPlan(naziv, createdBy);

    // 2. Save Assignments (Groups/Athletes)
    const groupIds = assignments?.groups || [];
    const directAthleteIds = assignments?.athletes || [];
    await addPlanAssignments(planId, groupIds, directAthleteIds);

    // 3. Create Schedules
    if (schedules && schedules.length > 0) {
      console.log("Creating schedules for the plan...", schedules.length);
      for (const sched of schedules) {
        const scheduleId = await insertSchedule(
          sched.training_id,
          sched.datum,
          sched.vreme,
          sched.location_id,
          planId
        );
        console.log("Created schedule with ID:", scheduleId);
      }
    }

    res.status(201).json({ id: planId, message: "Plan uspešno kreiran i dodeljen." });
  } catch (error) {
    console.error("Greška pri kreiranju plana:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getPlans(req, res) {
  try {
    const plans = await getAllTrainingPlans();
    res.status(200).json(plans);
  } catch (error) {
    console.error("Greška pri dobijanju planova:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getPlan(req, res) {
  const { id } = req.params;
  try {
    const plan = await getTrainingPlanById(id);
    if (!plan) {
      return res.status(404).send("Plan nije pronađen.");
    }
    
    const schedules = await fetchSchedulesByPlanId(id);
    const assignments = await getPlanAssignments(id);
    
    res.status(200).json({ ...plan, schedules, assignments });
  } catch (error) {
    console.error("Greška pri dobijanju plana:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function updatePlan(req, res) {
  const { id } = req.params;
  const { naziv, newSchedules, deletedScheduleIds, assignments } = req.body;
  
  try {
    // 1. Update Plan Name
    if (naziv) {
      await updateTrainingPlan(id, naziv);
    }

    // 2. Update Assignments (if provided)
    if (assignments) {
      const groupIds = assignments.groups || [];
      const directAthleteIds = assignments.athletes || [];
      
      await updatePlanAssignments(id, groupIds, directAthleteIds);
    }

    // 3. Delete Schedules
    if (deletedScheduleIds && Array.isArray(deletedScheduleIds) && deletedScheduleIds.length > 0) {
      for (const schedId of deletedScheduleIds) {
        await deleteSchedule(schedId);
      }
    }

    // 4. Add New Schedules
    if (newSchedules && Array.isArray(newSchedules) && newSchedules.length > 0) {
      for (const sched of newSchedules) {
        await insertSchedule(
          sched.training_id,
          sched.datum,
          sched.vreme,
          sched.location_id,
          id // planId
        );
      }
    }

    res.send("Plan uspešno ažuriran.");
  } catch (error) {
    console.error("Greška pri ažuriranju plana:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deletePlan(req, res) {
  const { id } = req.params;
  try {
    await deleteTrainingPlan(id);
    res.send("Plan uspešno obrisan.");
  } catch (error) {
    console.error("Greška pri brisanju plana:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan
};
