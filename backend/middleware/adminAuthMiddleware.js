import jwt from "jsonwebtoken";

export const adminProtect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Admin not authorized, no token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // ✅ We will sign tokens like { adminId, email }
    if (!decoded?.adminId) {
      return res.status(401).json({ error: "Invalid admin token" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Admin token failed" });
  }
};
