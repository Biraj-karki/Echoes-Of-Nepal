import pool from "../config/db.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

export const listUsers = async (req, res) => {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
  );
  res.json({ users: result.rows });
};

export const listStories = async (req, res) => {
  const result = await pool.query(`
    SELECT 
      s.id,
      s.title,
      s.description,
      s.location_tag,
      s.created_at,
      u.id as user_id,
      u.name as user_name,
      u.email as user_email,
      COALESCE(
        json_agg(
          json_build_object(
            'id', sm.id,
            'media_url', sm.media_url,
            'media_type', sm.media_type
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

  const mediaRes = await pool.query(
    "SELECT public_id, media_type FROM story_media WHERE story_id=$1",
    [storyId]
  );

  await Promise.allSettled(
    mediaRes.rows.map((m) =>
      deleteFromCloudinary({ public_id: m.public_id, media_type: m.media_type })
    )
  );

  try {
    await pool.query("BEGIN");
    await pool.query("DELETE FROM story_media WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM story_comments WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM story_likes WHERE story_id=$1", [storyId]);
    await pool.query("DELETE FROM stories WHERE id=$1", [storyId]);
    await pool.query("COMMIT");

    res.json({ message: "Story deleted by admin" });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Failed to delete story" });
  }
};

export const adminDeleteUser = async (req, res) => {
  const userId = Number(req.params.id);

  try {
    await pool.query("BEGIN");

    // delete cloudinary media for all user stories
    const mediaRes = await pool.query(
      `
      SELECT sm.public_id, sm.media_type
      FROM story_media sm
      JOIN stories s ON s.id = sm.story_id
      WHERE s.user_id = $1
      `,
      [userId]
    );

    await Promise.allSettled(
      mediaRes.rows.map((m) =>
        deleteFromCloudinary({ public_id: m.public_id, media_type: m.media_type })
      )
    );

    await pool.query(
      `DELETE FROM story_likes WHERE story_id IN (SELECT id FROM stories WHERE user_id=$1)`,
      [userId]
    );
    await pool.query(
      `DELETE FROM story_comments WHERE story_id IN (SELECT id FROM stories WHERE user_id=$1)`,
      [userId]
    );
    await pool.query(
      `DELETE FROM story_media WHERE story_id IN (SELECT id FROM stories WHERE user_id=$1)`,
      [userId]
    );
    await pool.query(`DELETE FROM stories WHERE user_id=$1`, [userId]);

    await pool.query(`DELETE FROM users WHERE id=$1`, [userId]);

    await pool.query("COMMIT");
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "Failed to delete user" });
  }
};
