const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("Greška: Nema tokena u zaglavlju.");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log(
        "Greška: Token nije validan ili je istekao. Detalji:",
        err.message
      );
      return res.sendStatus(403);
    }

    req.user = user;

    next();
  });
}

module.exports = { authenticateToken };
