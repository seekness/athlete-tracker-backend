const {
  fetchPrograms,
  insertProgram,
  updateProgramById,
  deleteProgramById,
  fetchTrainingsByProgramId,
  insertTrainingWithExercises,
  fetchProgramCreator,
} = require("../models/programModel");

const { generateWeeklyScheduleData } = require("../utils/scheduleFormatter");
const path = require("path");

const PDFDocument = require("pdfkit");

async function getAllPrograms(req, res) {
  const { role, id } = req.user;
  try {
    const programs = await fetchPrograms(role, id);
    res.status(200).json(programs);
  } catch (error) {
    console.error("Greška pri dobijanju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function createProgram(req, res) {
  const { naziv, opis } = req.body;
  const userId = req.user.id;
  try {
    await insertProgram(naziv, opis, userId);
    res.status(201).json({ message: "Program uspešno kreiran." });
  } catch (error) {
    console.error("Greška pri kreiranju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function updateProgram(req, res) {
  const { id } = req.params;
  const { naziv, opis } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const creatorId = await fetchProgramCreator(id);
    if (!creatorId)
      return res.status(404).json({ message: "Program nije pronađen." });

    if (userRole !== "admin" && creatorId !== userId) {
      return res
        .status(403)
        .json({ message: "Nemate dozvolu za izmenu ovog programa." });
    }

    await updateProgramById(id, naziv, opis);
    res.status(200).json({ message: "Program uspešno ažuriran." });
  } catch (error) {
    console.error("Greška pri ažuriranju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function deleteProgram(req, res) {
  const { id } = req.params;
  try {
    await deleteProgramById(id);
    res.send("Program uspešno obrisan.");
  } catch (error) {
    console.error("Greška pri brisanju programa:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getProgramTrainings(req, res) {
  const { programId } = req.params;
  try {
    const trainings = await fetchTrainingsByProgramId(programId);
    res.json(trainings);
  } catch (error) {
    console.error("Greška pri dobijanju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

async function getWeeklySchedule(req, res) {
  const { programId } = req.params;
  const { weekStart } = req.query; // format: YYYY-MM-DD

  try {
    const allTrainings = await fetchTrainingsByProgramId(programId);
    const structured = generateWeeklyScheduleData(allTrainings, weekStart);
    res.status(200).json(structured);
  } catch (error) {
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function generateWeeklySchedulePDF(req, res) {
  const { programId } = req.params;
  const { weekStart } = req.query;
  console.log("📥 Backend PDF ruta pozvana:", programId, weekStart);

  try {
    const trainings = await fetchTrainingsByProgramId(programId);
    //console.log("Broj treninga:", trainings.length);
    const schedule = generateWeeklyScheduleData(trainings, weekStart);
    //console.log("Schedule:", JSON.stringify(schedule, null, 2));

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
      "inline; filename=nedeljni-raspored.pdf"
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

  // Intenziteti
  const sveJacine = grupa.map((g) => g.jacina_izvodjenja).filter(Boolean);
  const jedinstvenaJacina =
    sveJacine.length > 0 &&
    sveJacine.every((j) => j === sveJacine[0]) &&
    sveJacine.length === grupa.length;

  // Težine
  const sveTezine = grupa.map((g) => g.tezina_kg).filter(Boolean);
  const jedinstvenaTezina =
    sveTezine.length > 0 &&
    sveTezine.every((t) => t === sveTezine[0]) &&
    sveTezine.length === grupa.length;

  let razlaganje = "";

  if (vrstaUnosa === "težina_ponavljanja") {
    if (sveJacine.length > 0 && sveTezine.length === 0) {
      // Samo RPE
      razlaganje = jedinstvenaJacina
        ? `${sveJacine[0]} RPE`
        : `${sveJacine.join("-")} RPE`;
      return `${naziv} ${brojSerija}x${brojPonavljanja}(${razlaganje})`;
    }

    if (sveTezine.length > 0 && sveJacine.length === 0) {
      // Samo težine
      razlaganje = jedinstvenaTezina
        ? `${sveTezine[0]}kg`
        : `${sveTezine.join("-")}kg`;
      return `${naziv} ${brojSerija}x${brojPonavljanja}(${razlaganje})`;
    }

    if (sveTezine.length > 0 && sveJacine.length > 0) {
      // Težina + RPE
      razlaganje = grupa
        .map((g) => {
          const t = g.tezina_kg || "?";
          const j = g.jacina_izvodjenja || "?";
          return `${t}kg-${j} RPE`;
        })
        .join("+");
      return `${naziv} ${brojSerija}x${brojPonavljanja}(${razlaganje})`;
    }

    // Fallback
    return `${naziv} ${brojSerija}x${brojPonavljanja}`;
  }

  // Ostale vrste unosa (vreme, duzina...) ostaju kao pre
  const ukupnoSekunde = grupa.reduce((sum, g) => {
    const s = parseInt(g.vreme_sekunde, 10);
    return sum + (isNaN(s) ? 0 : s);
  }, 0);
  const ukupnoVreme = formatSekundeCompact(ukupnoSekunde);

  const razlaganjeVremena = grupa
    .map((g) => {
      const trajanje = formatSekundeCompact(g.vreme_sekunde);
      const jacina = g.jacina_izvodjenja ? `${g.jacina_izvodjenja}%` : "";
      return `${trajanje}${jacina ? "-" + jacina : ""}`;
    })
    .join("+");

  return `${naziv} ${brojSerija}x${ukupnoVreme}/${pauza} pauza (${razlaganjeVremena})`;
}

function formatOdmorIzmedjuVežbi(vežba) {
  const sek = parseInt(vežba.rest_after_exercise_seconds, 10);
  if (isNaN(sek) || sek === 0) return "";
  return `Odmor ${formatSekundeCompact(sek)}`;
}

async function addTrainingToProgram(req, res) {
  const { programId } = req.params;
  const {
    opis,
    datum,
    vreme,
    predicted_duration_minutes,
    location_id,
    exercises,
  } = req.body;

  if (!opis || !datum || !vreme) {
    return res.status(400).send("Opis, datum i vreme treninga su obavezni.");
  }

  try {
    await insertTrainingWithExercises(programId, {
      opis,
      datum,
      vreme,
      predicted_duration_minutes,
      location_id,
      exercises,
    });
    res.status(201).send("Trening uspešno dodat.");
  } catch (error) {
    console.error("Greška pri dodavanju treninga:", error);
    res.status(500).send("Došlo je do greške na serveru.");
  }
}

module.exports = {
  getAllPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getProgramTrainings,
  addTrainingToProgram,
  getWeeklySchedule,
  generateWeeklySchedulePDF,
};
