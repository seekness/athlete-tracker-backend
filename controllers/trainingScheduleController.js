const {
  insertSchedule,
  fetchSchedulesByProgramId,
  fetchSchedulesByPlanId,
  fetchSchedulesByCreator,
  updateSchedule,
  deleteSchedule
} = require("../models/trainingScheduleModel");
const { generateWeeklyScheduleData } = require("../utils/scheduleFormatter");
const PDFDocument = require("pdfkit");
const path = require("path");

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

async function getMySchedule(req, res) {
  const { id } = req.user;
  const { weekStart } = req.query;

  try {
    const schedules = await fetchSchedulesByCreator(id);
    const structured = generateWeeklyScheduleData(schedules, weekStart);
    res.status(200).json(structured);
  } catch (error) {
    console.error("Greška pri dobijanju rasporeda za trenera:", error);
    res.status(500).json({ message: "Greška na serveru." });
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

async function generateMySchedulePDF(req, res) {
  const { id } = req.user;
  const { weekStart } = req.query;
  console.log("📥 Backend PDF ruta pozvana za trenera:", id, weekStart);

  try {
    const schedules = await fetchSchedulesByCreator(id);
    const schedule = generateWeeklyScheduleData(schedules, weekStart);

    const doc = new PDFDocument({
      size: "A4",
      margin: 20,
      layout: "landscape",
    });
    try {
      doc.registerFont(
        "Serbian",
        path.join(__dirname, "../fonts/Roboto-Regular.ttf")
      );
      doc.font("Serbian");
      doc.registerFont(
        "SerbianBold",
        path.join(__dirname, "../fonts/Roboto-Bold.ttf")
      );
    } catch (err) {
      console.error("❌ Font nije učitan:", err.message);
      doc.font("Helvetica"); // fallback
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "inline; filename=moj-nedeljni-raspored.pdf"
    );

    doc.pipe(res);

    const hasTrainings = Object.values(schedule).some(
      (day) => day.prepodne.length > 0 || day.popodne.length > 0
    );

    if (!hasTrainings) {
      const centerY = doc.page.height / 2;
      doc
        .fontSize(14)
        .text("Nema zakazanih treninga u ovoj nedelji.", 0, centerY, {
          align: "center",
        });
      doc.end();
      return;
    }

    doc.fontSize(20).text("Nedeljni raspored treninga", { align: "center" });
    doc.moveDown();

    const days = Object.keys(schedule);
    const columnWidth = (doc.page.width - 80) / 7;
    const rowHeight = 210;

    // Header

    days.forEach((day, i) => {
      doc
        .fillColor("#f0f0f0")
        .rect(40 + i * columnWidth, 90, columnWidth, 30)
        .fill();
      doc.fillColor("#000000");
      doc.font("SerbianBold");
      doc.fontSize(12).text(day.toUpperCase(), 40 + i * columnWidth, 100, {
        width: columnWidth,
        align: "center",
      });
    });
    doc.font("Serbian");
    ["prepodne", "popodne"].forEach((slot, rowIndex) => {
      days.forEach((day, colIndex) => {
        const trainings = schedule[day][slot];
        let x = 40 + colIndex * columnWidth;
        let y = 130 + rowIndex * rowHeight;

        // Crtaj okvir ćelije
        doc.rect(x, y, columnWidth, rowHeight).stroke();

        // Ispiši treninge
        trainings.forEach((t, i) => {
          doc
            .fillColor("#99ccaa")
            .rect(x + 1, y + i * 30 + 1, columnWidth - 2, 10)
            .fill();
          doc.fillColor("#000000");
          doc
            .fontSize(9)
            .text(
              `${t.vreme} - ${t.opis}\n${
                t.location_name || "Lokacija nije definisana"
              }`,
              x + 5,
              y + i * 30,
              { width: columnWidth - 10 }
            );

          // Vežbe za taj trening
          if (t.exercises && t.exercises.length > 0) {
            const grupisaneVezbe = grupisiSupersete(t.exercises);

            grupisaneVezbe.forEach((grupa, vi) => {
              const v = grupa[0]; // prva vežba u grupi
              let linija = formatSupersetGrupa(grupa);

              // Dodaj "Odmor" ako sledeća vežba nije u supersetu
              const jePoslednja = vi === grupisaneVezbe.length - 1;
              const sledecaGrupa = !jePoslednja ? grupisaneVezbe[vi + 1] : null;
              const trenutnaZadnja = grupa[grupa.length - 1];

              const trebaDodatiOdmor =
                sledecaGrupa &&
                sledecaGrupa[0].superset === 0 &&
                trenutnaZadnja.rest_after_exercise_seconds &&
                parseInt(trenutnaZadnja.rest_after_exercise_seconds, 10) > 0;

              if (trebaDodatiOdmor) {
                const odmor = formatSekundeCompact(trenutnaZadnja.rest_after_exercise_seconds);
                linija += ` • Odmor ${odmor}`;
              }

              doc
                .font("Serbian")
                .fontSize(8)
                .text(`• ${linija}`, x + 5, y + i * 30 + 30 + vi * 30, {
                  width: columnWidth - 10,
                });
            });
          }
        });
      });
    });

    doc.end();
  } catch (error) {
    console.error("Greška pri generisanju PDF-a:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

function formatSekunde(sekunde) {
  const total = parseInt(sekunde, 10);
  if (isNaN(total)) return sekunde; // fallback ako nije broj

  const min = Math.floor(total / 60);
  const sec = total % 60;

  return `${min}'${sec.toString().padStart(2, "0")}''`;
}

function formatSekundeCompact(sekunde) {
  const total = parseInt(sekunde, 10);
  if (isNaN(total)) return sekunde;

  const min = Math.floor(total / 60);
  const sec = total % 60;

  if (min > 0 && sec > 0) return `${min}'${sec}''`;
  if (min > 0) return `${min}'`;
  return `${sec}''`;
}

function grupisiSupersete(exercises) {
  const grupisano = [];
  let i = 0;

  while (i < exercises.length) {
    const grupa = [exercises[i]];
    let j = i + 1;

    while (
      j < exercises.length &&
      exercises[j].superset &&
      exercises[j].exercise_name === exercises[i].exercise_name
    ) {
      grupa.push(exercises[j]);
      j++;
    }

    grupisano.push(grupa);
    i = j;
  }

  return grupisano;
}

function formatSupersetGrupa(grupa) {
  const vrstaUnosa = grupa[0].vrsta_unosa;
  const brojSerija = grupa[0].broj_serija || "-";
  const brojPonavljanja = grupa[0].broj_ponavljanja || "?";
  const naziv = grupa[0].exercise_name;
  const pauza = formatSekundeCompact(
    grupa[grupa.length - 1].rest_duration_seconds
  );

  if (vrstaUnosa === "vreme") {
    const vreme = formatSekundeCompact(grupa[0].vreme_sekunde);
    return `${brojSerija}x ${naziv} (${vreme}) - P: ${pauza}`;
  } else if (vrstaUnosa === "duzina") {
    const duzina = grupa[0].duzina_metri + "m";
    return `${brojSerija}x ${naziv} (${duzina}) - P: ${pauza}`;
  } else {
    // ponavljanja
    const tezina = grupa[0].tezina_kg ? ` @ ${grupa[0].tezina_kg}kg` : "";
    return `${brojSerija}x${brojPonavljanja} ${naziv}${tezina} - P: ${pauza}`;
  }
}

module.exports = {
  createSchedule,
  getSchedules,
  getSchedulesByPlan,
  getMySchedule,
  generateMySchedulePDF,
  updateScheduleDetails,
  deleteScheduleById
};
