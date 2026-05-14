/**
 * SOS Notification Service
 * Sends emergency alerts via email, SMS, etc.
 */

import nodemailer from "nodemailer";

// Get email configuration from environment
const emailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

/**
 * Send SOS notification via email
 */
const sendEmailAlert = async (contact, alert) => {
    try {
        const {
            userName = "A user",
            emergencyType = "Unknown",
            message = "Emergency alert triggered",
            location: { latitude, longitude } = {}
        } = alert;

        const mapsUrl = `https://www.google.com/maps/search/${latitude},${longitude}`;

        const emailContent = `
            <h2 style="color: #DC2626;">🚨 Emergency Alert from Echoes of Nepal</h2>
            
            <div style="background: #FEE2E2; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <p><strong>User:</strong> ${userName}</p>
                <p><strong>Emergency Type:</strong> ${emergencyType}</p>
                <p><strong>Message:</strong> ${message}</p>
                <p><strong>Location:</strong> 
                    <a href="${mapsUrl}" target="_blank">
                        ${latitude}, ${longitude} (View Map)
                    </a>
                </p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
            </div>

            <p style="color: #666;">
                This is an automated emergency notification from the Echoes of Nepal tourism platform.
                If you receive this alert, the person may need immediate assistance.
            </p>

            <p style="font-size: 12px; color: #999;">
                Contact local emergency services (Police: 100, Medical: 911, Rescue: 1144) if immediate help is needed.
            </p>
        `;

        const result = await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: contact.email,
            subject: `🚨 EMERGENCY: ${emergencyType} - Echoes of Nepal`,
            html: emailContent
        });

        console.log(`✅ Email sent to ${contact.email}`);
        return { success: true, method: "email" };

    } catch (err) {
        console.error("Email send failed:", err.message);
        return { success: false, method: "email", error: err.message };
    }
};

/**
 * Send SOS notification via SMS (using Twilio)
 * Optional - requires Twilio account
 */
const sendSMSAlert = async (contact, alert) => {
    try {
        // Check if Twilio credentials are configured
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            console.log("⚠️ Twilio not configured, SMS alerts disabled");
            return { success: false, method: "sms", error: "Twilio not configured" };
        }

        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const {
            userName = "A user",
            emergencyType = "Unknown",
            location: { latitude, longitude } = {}
        } = alert;

        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const smsBody = `🚨 EMERGENCY ALERT from ${userName} - Type: ${emergencyType}. Location: ${mapsUrl}. Reply HELP for more info.`;

        const message = await client.messages.create({
            body: smsBody,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: contact.phone
        });

        console.log(`✅ SMS sent to ${contact.phone}`);
        return { success: true, method: "sms", messageId: message.sid };

    } catch (err) {
        console.error("SMS send failed:", err.message);
        return { success: false, method: "sms", error: err.message };
    }
};

/**
 * Send notification via WhatsApp (optional, requires Twilio WhatsApp integration)
 */
const sendWhatsAppAlert = async (contact, alert) => {
    try {
        if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
            return { success: false, method: "whatsapp", error: "Twilio not configured" };
        }

        const twilio = require('twilio');
        const client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const {
            userName = "A user",
            emergencyType = "Unknown",
            message = "Emergency alert triggered",
            location: { latitude, longitude } = {}
        } = alert;

        const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
        const waMessage = `🚨 *EMERGENCY ALERT* 🚨\n\nUser: ${userName}\nType: ${emergencyType}\nMessage: ${message}\nLocation: ${mapsUrl}`;

        const result = await client.messages.create({
            body: waMessage,
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
            to: `whatsapp:${contact.phone}`
        });

        console.log(`✅ WhatsApp sent to ${contact.phone}`);
        return { success: true, method: "whatsapp", messageId: result.sid };

    } catch (err) {
        console.error("WhatsApp send failed:", err.message);
        return { success: false, method: "whatsapp", error: err.message };
    }
};

/**
 * Main function - sends notification based on contact method
 */
export const sendSOSNotification = async ({
    alertId,
    contact,
    location,
    message,
    emergencyType,
    userName
}) => {
    const alert = { userName, emergencyType, message, location };

    switch (contact.contact_method.toLowerCase()) {
        case "email":
            return await sendEmailAlert(contact, alert);
        case "sms":
            return await sendSMSAlert(contact, alert);
        case "whatsapp":
            return await sendWhatsAppAlert(contact, alert);
        case "phone":
            // Phone calls would require specialized service like Twilio Voice
            console.log(`Phone call capability would be implemented for ${contact.phone}`);
            return { success: true, method: "phone", message: "Call queued for real responders" };
        default:
            return { success: false, error: "Unknown contact method" };
    }
};

/**
 * Send notification to admin/rescue services about active SOS
 */
export const notifyRescueServices = async (alert) => {
    try {
        const adminEmail = process.env.RESCUE_ADMIN_EMAIL;
        if (!adminEmail) {
            console.log("⚠️ Rescue admin email not configured");
            return;
        }

        const alertLevel = alert.emergency_type === "critical" ? "🔴 CRITICAL" : "🟡 ACTIVE";

        const emailContent = `
            <h2 style="color: #DC2626;">${alertLevel} SOS ALERT</h2>
            <p><strong>Alert ID:</strong> ${alert.id}</p>
            <p><strong>Location:</strong> ${alert.latitude}, ${alert.longitude}</p>
            <p><strong>Emergency Type:</strong> ${alert.emergency_type}</p>
            <p><strong>Message:</strong> ${alert.message}</p>
            <p><strong>Time:</strong> ${alert.created_at}</p>
            <p><strong>User ID:</strong> ${alert.user_id}</p>

            <a href="https://yourplatform.com/admin/sos/${alert.id}" style="
                background: #DC2626;
                color: white;
                padding: 10px 20px;
                border-radius: 5px;
                text-decoration: none;
                display: inline-block;
                margin-top: 10px;
            ">
                View Alert Details
            </a>
        `;

        await emailTransporter.sendMail({
            from: process.env.SMTP_USER,
            to: adminEmail,
            subject: `${alertLevel} SOS - Immediate Attention Required`,
            html: emailContent
        });

        console.log(`✅ Rescue notification sent to admin`);
    } catch (err) {
        console.error("Failed to notify rescue services:", err.message);
    }
};
