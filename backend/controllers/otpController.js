import pool from "../config/db.js";
import { sendEmail } from "../utils/email.js";

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required to send validation code." });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    // Clear old OTPs for this email to keep table clean
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

    // Store new OTP
    await pool.query(
      "INSERT INTO otp_verifications (email, otp, expires_at) VALUES ($1, $2, $3)",
      [email, otp, expiresAt]
    );

    // Send email
    await sendEmail({
      to: email,
      subject: "Verification Code for Echoes of Nepal",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #2563eb; text-align: center;">Echoes of Nepal</h2>
          <p>Hello,</p>
          <p>Your verification code for the booking request is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">
            ${otp}
          </div>
          <p style="color: #64748b; font-size: 14px; margin-top: 20px;">
            This code will expire in 5 minutes. If you did not request this, please ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: "Verification code sent to your email." });
  } catch (err) {
    console.error("sendOtp error:", err);
    res.status(500).json({ error: "Failed to send verification code. Please try again." });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and OTP are required." });
    }

    const result = await pool.query(
      "SELECT * FROM otp_verifications WHERE email = $1 AND otp = $2 AND expires_at > NOW()",
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired verification code." });
    }

    // Optional: Delete after success to prevent reuse
    await pool.query("DELETE FROM otp_verifications WHERE email = $1", [email]);

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error("verifyOtp error:", err);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};
