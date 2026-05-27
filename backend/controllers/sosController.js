import pool from "../config/db.js";
import { createNotification, createAdminNotification } from "../utils/notificationUtils.js";

export const createSOSAlert = async (req, res) => {
    const { latitude, longitude, message } = req.body;
    const userId = req.user?.id; 

    try {
        const result = await pool.query(
            "INSERT INTO sos_alerts (user_id, latitude, longitude, message, status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
            [userId || null, latitude, longitude, message || "Emergency Help Needed!"]
        );
        const newAlert = result.rows[0];
        
        await createAdminNotification({
            type: "sos_alert",
            title: "🚨 SOS ALERT",
            message: `New SOS alert received from ${req.user?.name || 'a user'}.`,
            link: `/admin/sos`
        });
        
        res.status(201).json({ 
            success: true, 
            message: "SOS Alert sent successfully. Help is on the way.", 
            alert: newAlert 
        });
    } catch (err) {
        console.error("SOS Alert Error:", err);
        res.status(500).json({ error: "Failed to send SOS alert" });
    }
};

export const getAllSOSAlerts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT s.*, u.name as user_name, u.email as user_email 
            FROM sos_alerts s
            LEFT JOIN users u ON s.user_id = u.id
            ORDER BY s.created_at DESC
        `);
        res.json({ alerts: result.rows });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch SOS alerts" });
    }
};

export const resolveSOSAlert = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    try {
        await pool.query(
            "UPDATE sos_alerts SET status = 'resolved', notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [notes || "Resolved", id]
        );
        // Get user id for the alert
        const alertRes = await pool.query("SELECT user_id FROM sos_alerts WHERE id = $1", [id]);
        if (alertRes.rows.length > 0 && alertRes.rows[0].user_id) {
            await createNotification({
                userId: alertRes.rows[0].user_id,
                type: "sos_update",
                title: "SOS Resolved",
                message: "Your SOS situation has been marked as resolved by the response team.",
                link: `/sos`
            });
        }
        res.json({ message: "SOS alert marked as resolved" });
    } catch (err) {
        res.status(500).json({ error: "Failed to resolve alert" });
    }
};

export const updateSOSSituation = async (req, res) => {
    const { id } = req.params;
    const { notes } = req.body;
    try {
        await pool.query(
            "UPDATE sos_alerts SET notes = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [notes, id]
        );
        const alertRes = await pool.query("SELECT user_id FROM sos_alerts WHERE id = $1", [id]);
        if (alertRes.rows.length > 0 && alertRes.rows[0].user_id) {
            await createNotification({
                userId: alertRes.rows[0].user_id,
                type: "sos_update",
                title: "SOS Update",
                message: "The response team has added new notes to your SOS situation.",
                link: `/sos`
            });
        }
        res.json({ message: "SOS situation updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update situation" });
    }
};

export const getMySOSAlerts = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    
    try {
        const result = await pool.query(
            "SELECT * FROM sos_alerts WHERE user_id = $1 ORDER BY created_at DESC",
            [userId]
        );
        res.json({ alerts: result.rows });
    } catch (err) {
        console.error("Fetch My SOS Alerts Error:", err);
        res.status(500).json({ error: "Failed to fetch your SOS alerts" });
    }
};
