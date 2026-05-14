import pool from "../config/db.js";

export const createSOSAlert = async (req, res) => {
    const { latitude, longitude, message } = req.body;
    const userId = req.user?.id; 

    try {
        const result = await pool.query(
            "INSERT INTO sos_alerts (user_id, latitude, longitude, message, status) VALUES ($1, $2, $3, $4, 'active') RETURNING *",
            [userId || null, latitude, longitude, message || "Emergency Help Needed!"]
        );
        res.status(201).json({ 
            success: true, 
            message: "SOS Alert sent successfully. Help is on the way.", 
            alert: result.rows[0] 
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
        res.json({ message: "SOS situation updated successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update situation" });
    }
};
