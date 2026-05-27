import pool from "../../config/db.js";

async function seedVendors() {
    try {
        console.log("Seeding real vendors...");

        // Get some IDs
        const phewaRes = await pool.query("SELECT id FROM destinations WHERE name = 'Phewa Lake'");
        const ebcRes = await pool.query("SELECT id FROM treks WHERE name = 'Everest Base Camp'");
        
        if (phewaRes.rows.length > 0) {
            const destId = phewaRes.rows[0].id;
            await pool.query(
                `INSERT INTO vendor_listings (vendor_id, destination_id, title, description, listing_type, price, is_active, image_url, amenities) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['1', destId, 'Highground Adventure Pokhara', 'Experience the world\'s longest and tallest zipline and bungee jumping over the Himalayan foothills.', 'Adventure', '8500', true, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', JSON.stringify(['Safety Gear', 'Guide', 'Transport'])]
            );
            await pool.query(
                `INSERT INTO vendor_listings (vendor_id, destination_id, title, description, listing_type, price, is_active, image_url, amenities) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['1', destId, 'Waterfront Resort & Spa', 'Luxury stay by the shores of Phewa Lake with stunning mountain views.', 'Stay', '12000', true, 'https://images.unsplash.com/photo-1544735716-392fe2489ffa', JSON.stringify(['Pool', 'Wifi', 'Breakfast'])]
            );
        }

        if (ebcRes.rows.length > 0) {
            const trekId = ebcRes.rows[0].id;
            await pool.query(
                `INSERT INTO vendor_listings (vendor_id, trek_id, title, description, listing_type, price, is_active, image_url, amenities) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                ['1', trekId, 'Everest Luxury Treks', 'Premium trekking service for EBC with experienced Sherpa guides and safety equipment.', 'Guide', '250000', true, 'https://images.unsplash.com/photo-1533130061792-64b345e4a833', JSON.stringify(['Flight to Lukla', 'Porter', 'Permits'])]
            );
        }

        console.log("Vendors seeded.");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedVendors();
