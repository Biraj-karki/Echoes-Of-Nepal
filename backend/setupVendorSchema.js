import pool from "./config/db.js";

const setupVendorSchema = async () => {
    try {
        await pool.query('BEGIN');

        console.log("Creating vendors table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendors (
                id SERIAL PRIMARY KEY,
                owner_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                business_name VARCHAR(255) NOT NULL,
                vendor_type VARCHAR(100) NOT NULL,
                district_slug VARCHAR(100) NOT NULL,
                description TEXT,
                phone VARCHAR(50),
                email VARCHAR(255),
                pan_number VARCHAR(100),
                registration_number VARCHAR(100),
                document_url TEXT,
                document_public_id VARCHAR(255),
                image_url TEXT,
                verification_status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
                rejection_reason TEXT,
                is_verified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating vendor_listings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS vendor_listings (
                id SERIAL PRIMARY KEY,
                vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                listing_type VARCHAR(100) NOT NULL,
                district_slug VARCHAR(100),
                destination_id INTEGER, -- nullable
                trek_id INTEGER, -- nullable
                description TEXT,
                price VARCHAR(100), -- string to allow "Rs 5000/day" or similar
                image_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        console.log("Creating bookings table...");
        await pool.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                vendor_id INTEGER REFERENCES vendors(id) ON DELETE CASCADE,
                listing_id INTEGER REFERENCES vendor_listings(id) ON DELETE CASCADE,
                travel_date DATE,
                people_count INTEGER,
                contact_name VARCHAR(255),
                contact_phone VARCHAR(50),
                contact_email VARCHAR(255),
                message TEXT,
                status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, rejected, completed
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query('COMMIT');
        console.log("✅ Vendor Module Schema created successfully!");
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error("❌ Error creating vendor schema:", err);
    } finally {
        pool.end();
    }
};

setupVendorSchema();
