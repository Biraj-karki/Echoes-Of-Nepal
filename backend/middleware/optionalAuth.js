import jwt from "jsonwebtoken";

export const optionalAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) return next();

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id, name, email }
    next();
  } catch (e) {
    // if token invalid, just treat as guest
    next();
  }
};
