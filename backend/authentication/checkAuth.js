const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const User = require("../schema/User");

module.exports = async function checkAuth(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id); // Use ID in payload
    if (!user) throw new Error("User not found");

    req.user = user; // Attach full user or just userId
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
