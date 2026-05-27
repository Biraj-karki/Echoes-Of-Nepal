import pool from "../config/db.js";

export const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(
            "SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
            [userId]
        );
        res.json({ notifications: result.rows });
    } catch (err) {
        console.error("getMyNotifications error:", err);
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2",
            [id, userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("markAsRead error:", err);
        res.status(500).json({ error: "Failed to mark as read" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        const userId = req.user.id;
        await pool.query(
            "UPDATE notifications SET is_read = true WHERE user_id = $1",
            [userId]
        );
        res.json({ success: true });
    } catch (err) {
        console.error("markAllAsRead error:", err);
        res.status(500).json({ error: "Failed to mark all as read" });
    }
};
