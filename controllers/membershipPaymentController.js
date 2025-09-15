const {
  fetchEligibleAthletes,
  fetchMonthlyPayments,
  insertPayment,
  deletePaymentById,
  fetchMembershipStatusForAdmin,
  fetchTrainerAthleteIds,
  fetchMembershipStatusForTrainer,
  fetchPaymentById
} = require("../models/membershipPaymentModel");

async function getEligibleAthletes(req, res) {
  try {
    const athletes = await fetchEligibleAthletes(req.user.id, req.user.role);
    res.status(200).json(athletes);
  } catch (error) {
    console.error("Greška pri dobijanju sportista:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function getMonthlyPayments(req, res) {
  try {
    const raw = await fetchMonthlyPayments(req.user.id, req.user.role);
    const aggregated = aggregatePayments(raw);
    res.status(200).json(aggregated);
  } catch (error) {
    console.error("Greška pri dobijanju mesečnih uplata:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

function aggregatePayments(results) {
  const monthly = results.reduce((acc, current) => {
    const date = new Date(current.payment_month);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const athleteId = current.athlete_id;
    const name = `${current.ime} ${current.prezime}`;

    if (!acc[athleteId]) acc[athleteId] = { id: athleteId, name, payments: {} };
    if (!acc[athleteId].payments[key]) acc[athleteId].payments[key] = [];

    acc[athleteId].payments[key].push({
      date: current.payment_date,
      amount: current.amount_paid,
      child_order: current.child_order,
      note: current.note
    });

    return acc;
  }, {});

  return Object.values(monthly);
}

async function createPayment(req, res) {
  const { athlete_id, amount_paid, child_order, note, payment_month } = req.body;
  try {
    const id = await insertPayment({ athlete_id, amount_paid, child_order, note, payment_month });
    res.status(201).json({ message: "Uplata uspešno zabeležena.", paymentId: id });
  } catch (error) {
    console.error("Greška pri snimanju uplate:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function getAthletesMembershipStatus(req, res) {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let athletes;

    if (userRole === "admin") {
      athletes = await fetchMembershipStatusForAdmin();
    } else {
      const athleteIds = await fetchTrainerAthleteIds(userId);

      if (athleteIds.length === 0) {
        return res.status(200).json([]);
      }

      athletes = await fetchMembershipStatusForTrainer(athleteIds);
    }

    res.status(200).json(athletes);
  } catch (error) {
    console.error("Greška pri dobijanju liste sportista za članarinu:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function deletePayment(req, res) {
  const { id } = req.params;

  try {
    const existing = await fetchPaymentById(id);
    if (!existing) {
      return res.status(404).json({ error: "Uplata nije pronađena." });
    }

    await deletePaymentById(id);
    res.status(200).json({ message: "Uplata uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju uplate:", error);
    res.status(500).json({ error: "Greška na serveru." });
  }
}

module.exports = {
  getEligibleAthletes,
  getMonthlyPayments,
  createPayment,
  deletePayment,
  getAthletesMembershipStatus
};