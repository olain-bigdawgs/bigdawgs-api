const jwt = require("jsonwebtoken");

/**
 * Verifies passed JWT is valid to authorized actions in app
 */
exports.verifyToken = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    return res.status(400).json({
      message: "Authentication failed",
      errors: [
        {
          msg: "Access token is required"
        }
      ]
    });
  } else {
    jwt.verify(
      token.split("Bearer ")[1],
      process.env.APP_JWT_SECRET || "d9171cea2711a69ec413537c2424c310",
      (err, decoded) => {
        if (err) {
          return res.status(403).json({
            message: "Authentication failed",
            errors: [
              {
                msg: "Failed to authenticate token"
              }
            ]
          });
        } else {
          req.decoded = decoded;
          next();
        }
      }
    );
  }
};
