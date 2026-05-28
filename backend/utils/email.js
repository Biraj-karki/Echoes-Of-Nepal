import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port,
    secure,
    requireTLS: !secure,
    family: 4,
    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};
