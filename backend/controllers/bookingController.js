import pool from "../config/db.js";

// ==========================================
// USER BOOKING REQUESTS
// ==========================================

export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message } = req.body;

        // Ensure the listing is active and vendor is verified
        const validRes = await pool.query(
            "SELECT l.id FROM vendor_listings l JOIN vendors v ON l.vendor_id = v.id WHERE l.id = $1 AND l.vendor_id = $2 AND l.is_active = true AND v.is_verified = true",
            [listing_id, vendor_id]
        );
        if (validRes.rows.length === 0) {
            return res.status(400).json({ error: "Listing or Vendor is unavailable for booking." });
        }

        const insertQuery = `
            INSERT INTO bookings (user_id, vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [userId, vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message]);

        res.status(201).json({ message: "Booking request submitted successfully.", booking: result.rows[0] });
    } catch (err) {
        console.error("createBooking error:", err);
        res.status(500).json({ error: "Failed to create booking request" });
    }
};

export const getMyBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT b.*, l.title as listing_title, l.image_url as listing_image, v.business_name
            FROM bookings b
            JOIN vendor_listings l ON b.listing_id = l.id
            JOIN vendors v ON b.vendor_id = v.id
            WHERE b.user_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await pool.query(query, [userId]);
        res.json({ bookings: result.rows });
    } catch (err) {
        console.error("getMyBookings error:", err);
        res.status(500).json({ error: "Failed to fetch your bookings" });
    }
};

// ==========================================
// VENDOR BOOKING MANAGEMENT
// ==========================================

export const getVendorBookings = async (req, res) => {
    try {
        const userId = req.user.id;
        // Verify this user owns a verified vendor
        const vendorRes = await pool.query("SELECT id FROM vendors WHERE owner_user_id = $1", [userId]);
        if (vendorRes.rows.length === 0) return res.status(403).json({ error: "Not a vendor." });
        
        const vendorId = vendorRes.rows[0].id;
        const query = `
            SELECT b.*, l.title as listing_title, u.name as requestor_name, u.email as requestor_registered_email
            FROM bookings b
            JOIN vendor_listings l ON b.listing_id = l.id
            LEFT JOIN users u ON b.user_id = u.id
            WHERE b.vendor_id = $1
            ORDER BY b.created_at DESC
        `;
        const result = await pool.query(query, [vendorId]);
        res.json({ bookings: result.rows });
    } catch (err) {
        console.error("getVendorBookings error:", err);
        res.status(500).json({ error: "Failed to fetch vendor bookings" });
    }
};

export const updateBookingStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { status } = req.body; // 'confirmed', 'rejected', 'completed'

        // Verify vendor ownership of booking
        const checkRes = await pool.query(
            "SELECT b.id FROM bookings b JOIN vendors v ON b.vendor_id = v.id WHERE b.id = $1 AND v.owner_user_id = $2",
            [id, userId]
        );
        if (checkRes.rows.length === 0) return res.status(403).json({ error: "Not allowed or booking not found." });

        const result = await pool.query(
            "UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *",
            [status, id]
        );

        res.json({ message: "Booking status updated", booking: result.rows[0] });
    } catch (err) {
        console.error("updateBookingStatus error:", err);
        res.status(500).json({ error: "Failed to update booking status" });
    }
};
