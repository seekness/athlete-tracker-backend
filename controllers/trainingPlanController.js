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
const { fetchAthletesByGroupId } = require("../models/groupMembershipModel");
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

    // 3. Collect all unique athletes for attendance
    let athleteIds = new Set();
    directAthleteIds.forEach(id => athleteIds.add(id));

    for (const groupId of groupIds) {
      const groupAthletes = await fetchAthletesByGroupId(groupId);
      groupAthletes.forEach(a => athleteIds.add(a.id));
    }

    const uniqueAthleteIds = Array.from(athleteIds);

    // 4. Create Schedules and Attendance
    if (schedules && schedules.length > 0) {
      for (const sched of schedules) {
        const scheduleId = await insertSchedule(
          sched.training_id,
          sched.datum,
          sched.vreme,
          sched.location_id,
          planId
        );

        if (uniqueAthleteIds.length > 0) {
           const values = uniqueAthleteIds.map(athleteId => [scheduleId, athleteId, 'Nije prisutan', '']);
           if (values.length > 0) {
             await dbPool.query(
               "INSERT INTO training_attendance (training_schedule_id, athlete_id, status, napomena) VALUES ?",
               [values]
             );
           }
        }
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
    let uniqueAthleteIds = [];
    if (assignments) {
      const groupIds = assignments.groups || [];
      const directAthleteIds = assignments.athletes || [];
      
      await updatePlanAssignments(id, groupIds, directAthleteIds);

      // Recalculate all participants
      let athleteIdsSet = new Set();
      directAthleteIds.forEach(aid => athleteIdsSet.add(aid));
      
      for (const groupId of groupIds) {
        const groupAthletes = await fetchAthletesByGroupId(groupId);
        groupAthletes.forEach(a => athleteIdsSet.add(a.id));
      }
      uniqueAthleteIds = Array.from(athleteIdsSet);

      // Sync Attendance for ALL schedules in this plan (existing and new)
      // Strategy: 
      // - Get all schedules for this plan
      // - For each schedule:
      //   - Add missing athletes (default 'Nije prisutan')
      //   - Remove athletes NOT in the new list (only if status is 'Nije prisutan' to preserve history?)
      //   - OR just Add missing ones. Removing is risky if they attended. 
      //   - Let's just ADD missing ones for now to be safe.
      
      const allSchedules = await fetchSchedulesByPlanId(id);
      
      for (const sched of allSchedules) {
        // Get current attendance
        const [currentAttendance] = await dbPool.query(
          "SELECT athlete_id FROM training_attendance WHERE training_schedule_id = ?",
          [sched.id]
        );
        const currentAthleteIds = currentAttendance.map(a => a.athlete_id);
        
        // Find missing
        const missingAthletes = uniqueAthleteIds.filter(aid => !currentAthleteIds.includes(aid));
        
        if (missingAthletes.length > 0) {
           const values = missingAthletes.map(athleteId => [sched.id, athleteId, 'Nije prisutan', '']);
           await dbPool.query(
             "INSERT INTO training_attendance (training_schedule_id, athlete_id, status, napomena) VALUES ?",
             [values]
           );
        }
        
        // Optional: Remove athletes who are no longer assigned AND have no status (Nije prisutan)
        // This keeps the list clean.
        const toRemove = currentAthleteIds.filter(aid => !uniqueAthleteIds.includes(aid));
        if (toRemove.length > 0) {
           await dbPool.query(
             "DELETE FROM training_attendance WHERE training_schedule_id = ? AND athlete_id IN (?) AND status = 'Nije prisutan'",
             [sched.id, toRemove]
           );
        }
      }
    } else {
      // If assignments not provided in update, we need to fetch current participants to assign to NEW schedules
      // But wait, if we are just adding schedules, we should use the current assignments.
      // Let's fetch current assignments from DB
      const currentAssignments = await getPlanAssignments(id);
      let athleteIdsSet = new Set();
      currentAssignments.athletes.forEach(aid => athleteIdsSet.add(aid));
      for (const groupId of currentAssignments.groups) {
        const groupAthletes = await fetchAthletesByGroupId(groupId);
        groupAthletes.forEach(a => athleteIdsSet.add(a.id));
      }
      uniqueAthleteIds = Array.from(athleteIdsSet);
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
        const scheduleId = await insertSchedule(
          sched.training_id,
          sched.datum,
          sched.vreme,
          sched.location_id,
          id // planId
        );

        // Assign to current participants
        if (uniqueAthleteIds.length > 0) {
           const values = uniqueAthleteIds.map(athleteId => [scheduleId, athleteId, 'Nije prisutan', '']);
           if (values.length > 0) {
             await dbPool.query(
               "INSERT INTO training_attendance (training_schedule_id, athlete_id, status, napomena) VALUES ?",
               [values]
             );
           }
        }
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
