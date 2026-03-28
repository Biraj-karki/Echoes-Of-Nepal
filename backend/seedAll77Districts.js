import pool from "./config/db.js";

const districtsByProvince = {
    "Koshi Province": ["Bhojpur", "Dhankuta", "Ilam", "Jhapa", "Khotang", "Morang", "Okhaldhunga", "Panchthar", "Sankhuwasabha", "Solukhumbu", "Sunsari", "Taplejung", "Terhathum", "Udayapur"],
    "Madhesh Province": ["Bara", "Dhanusa", "Mahottari", "Parsa", "Rautahat", "Saptari", "Sarlahi", "Siraha"],
    "Bagmati Province": ["Bhaktapur", "Chitwan", "Dhading", "Dolakha", "Kathmandu", "Kavrepalanchok", "Lalitpur", "Makwanpur", "Nuwakot", "Ramechhap", "Rasuwa", "Sindhuli", "Sindhupalchok"],
    "Gandaki Province": ["Baglung", "Gorkha", "Kaski", "Lamjung", "Manang", "Mustang", "Myagdi", "Nawalpur", "Parbat", "Syangja", "Tanahu"],
    "Lumbini Province": ["Arghakhanchi", "Banke", "Bardiya", "Dang", "Gulmi", "Kapilvastu", "Parasi", "Palpa", "Pyuthan", "Rolpa", "Rukum East", "Rupandehi"],
    "Karnali Province": ["Dailekh", "Dolpa", "Humla", "Jajarkot", "Jumla", "Kalikot", "Mugu", "Rukum West", "Salyan", "Surkhet"],
    "Sudurpashchim Province": ["Achham", "Baitadi", "Bajhang", "Bajura", "Dadeldhura", "Darchula", "Doti", "Kailali", "Kanchanpur"]
};

async function seedDistricts() {
    try {
        console.log("Starting district migrations and seeding...");

        // 1. Add missing columns if they don't exist
        await pool.query(`
            ALTER TABLE districts 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
            ADD COLUMN IF NOT EXISTS province VARCHAR(100),
            ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        `);

        // 2. Prepare and seed each district
        for (const [province, districts] of Object.entries(districtsByProvince)) {
            for (const name of districts) {
                const id = name.toUpperCase().replace(/\s+/g, "_");
                const slug = name.toLowerCase().replace(/\s+/g, "-");

                // Check if already exists
                const existing = await pool.query("SELECT * FROM districts WHERE id = $1", [id]);
                
                if (existing.rows.length === 0) {
                    await pool.query(
                        "INSERT INTO districts (id, name, slug, province, description) VALUES ($1, $2, $3, $4, $5)",
                        [id, name, slug, province, `Discover the unique culture and landscapes of ${name} in ${province}.`]
                    );
                    console.log(`+ Added ${name}`);
                } else {
                    // Update province if missing
                    await pool.query(
                        "UPDATE districts SET province = $1, slug = $2 WHERE id = $3",
                        [province, slug, id]
                    );
                    console.log(`~ Updated ${name}`);
                }
            }
        }

        console.log("Seeding complete! 77 districts are ready.");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}

seedDistricts();
