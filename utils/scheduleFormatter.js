const dayjs = require("dayjs");

function generateWeeklyScheduleData(trainings, weekStartDate) {
  const start = dayjs(weekStartDate);
  const end = start.add(6, "day");

  const days = ["ponedeljak", "utorak", "sreda", "četvrtak", "petak", "subota", "nedelja"];
  const schedule = {};

  for (let i = 0; i < 7; i++) {
    schedule[days[i]] = { prepodne: [], popodne: [] };
  }

  for (const training of trainings) {
    const date = dayjs(training.datum);
    if (date.isBefore(start) || date.isAfter(end)) continue;

    const dayIndex = date.day() === 0 ? 6 : date.day() - 1; // dayjs: 0 = nedelja
    const vreme = training.vreme;
    const hour = parseInt(vreme.split(":")[0], 10);

    const slot = hour < 14 ? "prepodne" : "popodne";
    schedule[days[dayIndex]][slot].push(training);
  }

  return schedule;
}

module.exports = { generateWeeklyScheduleData };