const {
  fetchAttendanceByScheduleId,
  upsertScheduleAttendanceRecords
} = require("../models/attendanceModel");

async function getScheduleAttendance(req, res) {
  const { id: scheduleIdParam } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const scheduleId = parseInt(scheduleIdParam, 10);

  if (isNaN(scheduleId)) {
    console.error("INVALID SCHEDULE ID:", scheduleIdParam);
    return res.status(400).json({ message: "ID termina nije validan." });
  }

  try {
    const results = await fetchAttendanceByScheduleId(scheduleId, userRole, userId);

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

async function saveScheduleAttendance(req, res) {
  const { id: scheduleIdParam } = req.params;
  const scheduleId = parseInt(scheduleIdParam, 10);
  const attendanceRecords = req.body;

  if (isNaN(scheduleId) || !Array.isArray(attendanceRecords)) {
    return res.status(400).json({ message: "Invalid request data." });
  }

  try {
    await upsertScheduleAttendanceRecords(scheduleId, attendanceRecords);
    res.status(200).json({ message: "Attendance records saved successfully." });
  } catch (error) {
    console.error("Error saving attendance records:", error);
    res.status(500).json({ message: "An error occurred on the server." });
  }
}

module.exports = {
  getScheduleAttendance,
  saveScheduleAttendance
};