import pool from "../config/db.js";

const migrateListingGallery = async () => {
    try {
        console.log("Adding image gallery support to vendor_listings...");
        await pool.query(`
            ALTER TABLE vendor_listings
            ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]';
        `);

        await pool.query(`
            UPDATE vendor_listings
            SET image_urls = CASE
                WHEN image_url IS NOT NULL AND image_url <> '' THEN jsonb_build_array(image_url)
                ELSE '[]'::jsonb
            END
            WHERE image_urls IS NULL OR image_urls = '[]'::jsonb;
        `);

        console.log("Migration successful.");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit();
    }
};

migrateListingGallery();
