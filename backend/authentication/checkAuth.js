const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../schema/User");

module.exports = async function checkAuth(req, res, next) {
  // Get token from Authorization header or query string
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : req.query.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) throw new Error("User not found");

    req.user = user; // Attach user for downstream use
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
