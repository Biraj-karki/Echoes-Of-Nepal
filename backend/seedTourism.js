import pool from "./config/db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mockDataPath = path.join(__dirname, "../frontend/src/data/mockDistricts.json");
const mockDistricts = JSON.parse(fs.readFileSync(mockDataPath, "utf-8"));

async function seed() {
    try {
        console.log("Seeding started...");
        for (const district of mockDistricts) {
            // Insert District
            await pool.query(
                "INSERT INTO districts (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description",
                [district.id, district.name, district.description]
            );

            // Insert Destinations
            for (const dest of district.destinations) {
                await pool.query(
                    "INSERT INTO destinations (district_id, name, category, image, description, rating) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
                    [district.id, dest.name, dest.category, dest.image, dest.description, dest.rating]
                );
            }

            // Insert Treks
            for (const trek of district.treks) {
                await pool.query(
                    "INSERT INTO treks (district_id, name, difficulty, duration) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
                    [district.id, trek.name, trek.difficulty, trek.duration]
                );
            }
        }
        console.log("Seeding completed successfully");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err.message);
        process.exit(1);
    }
}

seed();
