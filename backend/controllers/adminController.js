import pool from "../config/db.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

export const adminListUsers = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
  );
  res.json({ users: result.rows });
};

export const adminListStories = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.title,
      s.description,
      s.location_tag,
      s.created_at,
      u.id AS user_id,
      u.name AS user_name,
      u.email AS user_email,
      COALESCE(
        json_agg(
          json_build_object(
            'id', sm.id,
            'media_url', sm.media_url,
            'media_type', sm.media_type,
            'public_id', sm.public_id
          )
        ) FILTER (WHERE sm.id IS NOT NULL),
        '[]'
      ) AS media
    FROM stories s
    JOIN users u ON u.id = s.user_id
    LEFT JOIN story_media sm ON sm.story_id = s.id
    GROUP BY s.id, u.id
    ORDER BY s.created_at DESC
  `);

  res.json({ stories: result.rows });
};

export const adminDeleteStory = async (req, res) => {
  const storyId = Number(req.params.id);

  try {
    // 1) get media public_ids first (to delete from cloudinary)
    const mediaRes = await pool.query(
      "SELECT public_id, media_type FROM story_media WHERE story_id=$1",
      [storyId]
    );

    await Promise.allSettled(
      mediaRes.rows.map((m) =>
        deleteFromCloudinary({ public_id: m.public_id, media_type: m.media_type })
      )
    );

    // 2) delete from DB
    await pool.query("BEGIN");
    await pool.query("DELETE FROM story_media WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM story_comments WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM story_likes WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM stories WHERE id=$1", [storyId]);
    await pool.query("COMMIT");

    res.json({ message: "Story deleted by admin" });
  } catch (err) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("adminDeleteStory error:", err.message);
    res.status(500).json({ error: "Failed to delete story" });
  }
};
