import nodemailer from "nodemailer";
import { BrevoClient } from "@getbrevo/brevo";

const getSenderEmail = () =>
  process.env.BREVO_SENDER_EMAIL ||
  process.env.SMTP_USER ||
  process.env.EMAIL_USER;

const getSenderName = () =>
  process.env.BREVO_SENDER_NAME || "Echoes of Nepal";

const sendWithBrevo = async ({ to, subject, html }) => {
  if (!process.env.BREVO_API_KEY) {
    return false;
  }

  const senderEmail = getSenderEmail();
  if (!senderEmail) {
    throw new Error("BREVO_SENDER_EMAIL or EMAIL_USER is required");
  }

  const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
  });

  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: getSenderName(),
    },
    to: [
      {
        email: to,
      },
    ],
    subject,
    htmlContent: html,
  });

  return true;
};

const sendWithSmtp = async ({ to, subject, html }) => {
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
    from:
      process.env.EMAIL_FROM ||
      `${getSenderName()} <${getSenderEmail() || process.env.SMTP_USER || process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const senderEmail = getSenderEmail();
  if (!senderEmail) {
    throw new Error("A sender email is required for sending mail");
  }

  if (process.env.BREVO_API_KEY) {
    await sendWithBrevo({ to, subject, html });
    return;
  }

  await sendWithSmtp({ to, subject, html });
};
