import pool from "../config/db.js";
import { getIO } from "../socket.js";

export const createNotification = async ({ userId, type, title, message, link, metadata = {} }) => {
    try {
        const query = `
            INSERT INTO notifications (user_id, type, title, message, link, metadata)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        const result = await pool.query(query, [userId, type, title, message, link, metadata]);
        const notification = result.rows[0];

        const io = getIO();
        if (io) {
            // Emit to specific user room
            io.to(`user_${userId}`).emit('new_notification', notification);
        }

        return notification;
    } catch (error) {
        console.error("Error creating notification:", error);
    }
};

export const createAdminNotification = async ({ type, title, message, link, metadata = {} }) => {
    try {
        const adminRes = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        const admins = adminRes.rows;

        const io = getIO();

        for (const admin of admins) {
            const query = `
                INSERT INTO notifications (user_id, type, title, message, link, metadata)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `;
            const result = await pool.query(query, [admin.id, type, title, message, link, metadata]);
            
            if (io) {
                io.to(`user_${admin.id}`).emit('new_notification', result.rows[0]);
                // We also emit a generic admin_alert for critical things like SOS
                io.to(`admin_room`).emit('admin_alert', result.rows[0]);
            }
        }
    } catch (error) {
        console.error("Error creating admin notification:", error);
    }
};
