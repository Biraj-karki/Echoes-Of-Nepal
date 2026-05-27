import bcrypt from "bcrypt";

const password = "Admin@123";
const hash = await bcrypt.hash(password, 10);

console.log("PASSWORD_HASH =", hash);
process.exit(0);
