function adminWelcome(req, res) {
  res.json({ message: "Dobrodošli, admin!" });
}

module.exports = { adminWelcome };