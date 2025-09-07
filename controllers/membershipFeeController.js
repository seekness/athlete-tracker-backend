const {
  insertFee,
  fetchAllFees,
  fetchLatestFee,
  updateFeeById,
  deleteFeeById
} = require("../models/membershipFeeModel");

async function createFee(req, res) {
  const { amount_first, amount_second, amount_third, valid_from } = req.body;
  try {
    const id = await insertFee({ amount_first, amount_second, amount_third, valid_from });
    res.status(201).json({ message: "Nova visina članarine uspešno definisana.", feeId: id });
  } catch (error) {
    console.error("Greška pri definisanju članarine:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function getAllFees(req, res) {
  try {
    const fees = await fetchAllFees();
    res.status(200).json(fees);
  } catch (error) {
    console.error("Greška pri dobijanju svih članarina:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function getCurrentFee(req, res) {
  try {
    const fee = await fetchLatestFee();
    res.status(200).json(fee || {});
  } catch (error) {
    console.error("Greška pri dobijanju cena članarina:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function updateFee(req, res) {
  const { id } = req.params;
  const { amount_first, amount_second, amount_third, valid_from } = req.body;
  try {
    await updateFeeById(id, { amount_first, amount_second, amount_third, valid_from });
    res.status(200).json({ message: "Članarina uspešno izmenjena." });
  } catch (error) {
    console.error("Greška pri izmeni članarine:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

async function deleteFee(req, res) {
  const { id } = req.params;
  try {
    await deleteFeeById(id);
    res.status(200).json({ message: "Članarina uspešno obrisana." });
  } catch (error) {
    console.error("Greška pri brisanju članarine:", error);
    res.status(500).json({ message: "Greška na serveru." });
  }
}

module.exports = {
  createFee,
  getAllFees,
  getCurrentFee,
  updateFee,
  deleteFee
};