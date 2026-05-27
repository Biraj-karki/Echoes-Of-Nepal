import pool from "../config/db.js";
import { createNotification } from "../utils/notificationUtils.js";

// ==========================================
// USER BOOKING REQUESTS
// ==========================================

export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message } = req.body;

        // Basic validation
        if (!vendor_id || !listing_id || !travel_date || !people_count || !contact_name || !contact_phone || !contact_email) {
            return res.status(400).json({ error: "All mandatory fields are required." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(contact_email)) {
            return res.status(400).json({ error: "Please provide a valid email address." });
        }

        const selectedDate = new Date(travel_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return res.status(400).json({ error: "Booking date cannot be in the past." });
        }

        if (people_count < 1) {
            return res.status(400).json({ error: "Guest count must be at least 1." });
        }

        // Ensure the listing is active and vendor is verified
        const validRes = await pool.query(
            "SELECT l.id, l.price FROM vendor_listings l JOIN vendors v ON l.vendor_id = v.id WHERE l.id = $1 AND l.vendor_id = $2 AND l.is_active = true AND v.is_verified = true",
            [listing_id, vendor_id]
        );
        if (validRes.rows.length === 0) {
            return res.status(400).json({ error: "Listing or Vendor is unavailable for booking." });
        }

        // Parse price (e.g., "Rs 5000/night" -> 5000)
        const priceStr = validRes.rows[0].price || "0";
        const numericPrice = parseInt(priceStr.replace(/[^0-9]/g, "")) || 0;
        const totalAmount = numericPrice * (parseInt(people_count) || 1);

        const insertQuery = `
            INSERT INTO bookings (user_id, vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message, amount, status, payment_status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', 'pending')
            RETURNING *
        `;
        const result = await pool.query(insertQuery, [userId, vendor_id, listing_id, travel_date, people_count, contact_name, contact_phone, contact_email, message, totalAmount]);

        // Get vendor owner_user_id
        const vendorRes = await pool.query("SELECT owner_user_id FROM vendors WHERE id = $1", [vendor_id]);
        if (vendorRes.rows.length > 0) {
            await createNotification({
                userId: vendorRes.rows[0].owner_user_id,
                type: "booking_request",
                title: "New Booking Request",
                message: `You have a new booking request from ${contact_name}.`,
                link: `/vendor/bookings`
            });
        }
        res.status(201).json({ message: "Booking request submitted successfully.", booking: result.rows[0] });
    } catch (err) {
        console.error("createBooking error:", err);
        res.status(500).json({ error: "Failed to create booking request. Please try again later." });
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

        const updatedBooking = result.rows[0];
        await createNotification({
            userId: updatedBooking.user_id,
            type: "booking_status",
            title: "Booking Update",
            message: `Your booking request has been ${status}.`,
            link: `/my-bookings`
        });
        res.json({ message: "Booking status updated", booking: updatedBooking });
    } catch (err) {
        console.error("updateBookingStatus error:", err);
        res.status(500).json({ error: "Failed to update booking status" });
    }
};

export const initiateKhaltiPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
        if (!KHALTI_SECRET_KEY) return res.status(500).json({ error: "Khalti setup incomplete" });

        // Get booking 
        const result = await pool.query(
            "SELECT b.*, l.title as listing_title, u.name as customer_name, u.email as customer_email FROM bookings b JOIN vendor_listings l ON b.listing_id = l.id LEFT JOIN users u ON b.user_id = u.id WHERE b.id = $1",
            [id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Booking not found" });
        const booking = result.rows[0];

        // Ensure not already paid
        if (booking.payment_status === 'paid') return res.status(400).json({ error: "Booking already paid" });

        const amountInPaisa = booking.amount * 100;
        
        // Frontend URL for return
        const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

        const khaltiPayload = {
            "return_url": `${FRONTEND_URL}/booking/${id}/verify`,
            "website_url": FRONTEND_URL,
            "amount": amountInPaisa,
            "purchase_order_id": booking.id.toString(),
            "purchase_order_name": booking.listing_title,
            "customer_info": {
                "name": booking.customer_name || booking.contact_name,
                "email": booking.customer_email || booking.contact_email,
                "phone": booking.contact_phone || "9800000000"
            }
        };

        const khaltiRes = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
            method: "POST",
            headers: {
                "Authorization": `Key ${KHALTI_SECRET_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(khaltiPayload)
        });

        const khaltiData = await khaltiRes.json();
        
        if (khaltiRes.ok) {
            res.json({ success: true, payment_url: khaltiData.payment_url, pidx: khaltiData.pidx });
        } else {
            console.error("Khalti initiate error:", khaltiData);
            res.status(400).json({ success: false, error: "Failed to initiate payment", details: khaltiData });
        }
    } catch (err) {
        console.error("initiateKhaltiPayment error:", err);
        res.status(500).json({ error: "Internal server error during initiation" });
    }
};

export const verifyKhaltiPayment = async (req, res) => {
    try {
        const { pidx, bookingId } = req.body;
        
        const KHALTI_SECRET_KEY = process.env.KHALTI_SECRET_KEY;
        if (!KHALTI_SECRET_KEY) {
            return res.status(500).json({ success: false, error: "Server configuration error: Khalti Secret Key missing." });
        }

        // Call Khalti Lookup API
        const khaltiRes = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Key ${KHALTI_SECRET_KEY}`
            },
            body: JSON.stringify({ pidx })
        });

        const khaltiData = await khaltiRes.json();

        if (khaltiRes.ok && khaltiData.status === "Completed") {
            // Update booking status
            const updateQuery = `
                UPDATE bookings 
                SET payment_status = 'paid',
                    payment_method = 'khalti',
                    payment_id = $1,
                    status = 'confirmed',
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *
            `;
            const result = await pool.query(updateQuery, [khaltiData.transaction_id || pidx, bookingId]);
            
            const confirmedBooking = result.rows[0];
            const vendorOwnerRes = await pool.query("SELECT owner_user_id FROM vendors WHERE id = $1", [confirmedBooking.vendor_id]);
            if (vendorOwnerRes.rows.length > 0) {
                await createNotification({
                    userId: vendorOwnerRes.rows[0].owner_user_id,
                    type: "booking_payment",
                    title: "Payment Received",
                    message: `Payment verified for booking #${confirmedBooking.id}.`,
                    link: `/vendor/bookings`
                });
            }
            res.json({ success: true, message: "Payment verified and booking confirmed.", booking: confirmedBooking });
        } else {
            console.error("Khalti lookup fail/error:", khaltiData);
            res.status(400).json({ success: false, error: "Payment verification failed or not completed." });
        }
    } catch (err) {
        console.error("verifyKhaltiPayment error:", err);
        res.status(500).json({ error: "Internal server error during payment verification." });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const query = `
            SELECT b.*, l.title as listing_title, l.image_url as listing_image, l.price as listing_price, v.business_name, v.district_slug as vendor_district
            FROM bookings b
            JOIN vendor_listings l ON b.listing_id = l.id
            JOIN vendors v ON b.vendor_id = v.id
            WHERE b.id = $1
        `;
        const result = await pool.query(query, [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: "Booking not found" });
        res.json({ booking: result.rows[0] });
    } catch (err) {
        console.error("getBookingById error:", err);
        res.status(500).json({ error: "Failed to fetch booking details" });
    }
};
