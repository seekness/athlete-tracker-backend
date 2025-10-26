function checkRole(role) {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({
        message: "Pristup zabranjen: Nemate potrebne privilegije."
      });
    }
  };
}

function isTrener(req, res, next) {
  if (req.user.role !== "trener") {
    return res.status(403).json({ error: "Pristup dozvoljen samo trenerima." });
  }
  next();
}

function isSportista(req, res, next) {
  if (req.user.role !== "sportista") {
    return res.status(403).json({ error: "Pristup dozvoljen samo sportistima." });
  }
  next();
}

function isIndividual(req, res, next) {
  if (req.user.role !== "individual") {
    return res.status(403).json({ error: "Pristup dozvoljen samo individualnim korisnicima." });
  }
  next();
}

module.exports = {
  isTrener,
  isSportista,
  isIndividual,
  checkRole
};
