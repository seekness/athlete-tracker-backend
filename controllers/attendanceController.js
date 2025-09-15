const {
  fetchAttendanceByTrainingId,
  upsertAttendanceRecords
} = require("../models/attendanceModel");

async function getTrainingAttendance(req, res) {
  const { id: trainingIdParam } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const trainingId = parseInt(trainingIdParam, 10);

  if (isNaN(trainingId)) {
    console.error("INVALID TRAINING ID:", trainingIdParam);
    return res.status(400).json({ message: "ID treninga nije validan." });
  }

  try {
    const results = await fetchAttendanceByTrainingId(trainingId, userRole, userId);

    // Uklanjanje duplikata
    const uniqueResults = Object.values(
      results.reduce((acc, current) => {
        acc[current.athlete_id] = current;
        return acc;
      }, {})
    );

    res.status(200).json(uniqueResults);
  } catch (error) {
    console.error("GREŠKA pri dobijanju prisutnosti:", error);
    res.status(500).json({ message: "Došlo je do greške na serveru." });
  }
}

async function saveTrainingAttendance(req, res) {
  const { id: trainingIdParam } = req.params;
  const trainingId = parseInt(trainingIdParam, 10);
  const attendanceRecords = req.body;

  if (isNaN(trainingId) || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    await upsertAttendanceRecords(trainingId, attendanceRecords);
    res.status(200).json({ message: "Attendance records saved successfully." });
  } catch (error) {
    console.error("Error saving attendance records:", error);
    res.status(500).json({ message: "An error occurred on the server." });
  }
}

module.exports = {
  getTrainingAttendance,
  saveTrainingAttendance
};