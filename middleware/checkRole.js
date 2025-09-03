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

module.exports = { checkRole };