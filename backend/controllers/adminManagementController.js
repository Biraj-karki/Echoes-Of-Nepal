import pool from "../config/db.js";
import { deleteFromCloudinary } from "../utils/cloudinary.js";

// Get list of users
export const listUsers = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users ORDER BY created_at DESC"
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Get list of stories
export const listStories = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, u.name as user_name, u.email as user_email
      FROM stories s
      JOIN users u ON u.id = s.user_id
      ORDER BY s.created_at DESC
    `);
    res.json({ stories: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stories" });
  }
};

// Delete a story (and its media) by admin
export const adminDeleteStory = async (req, res) => {
  const storyId = Number(req.params.id);

  // First, delete media from cloudinary
  const mediaRes = await pool.query(
    "SELECT public_id FROM story_media WHERE story_id=$1",
    [storyId]
  );

  await Promise.allSettled(
    mediaRes.rows.map((media) => deleteFromCloudinary({ public_id: media.public_id }))
  );

  // Then, delete the story and related data
  await pool.query("BEGIN");
  await pool.query("DELETE FROM story_media WHERE story_id=$1", [storyId]);
  await pool.query("DELETE FROM story_likes WHERE story_id=$1", [storyId]);
  await pool.query("DELETE FROM story_comments WHERE story_id=$1", [storyId]);
  await pool.query("DELETE FROM stories WHERE id=$1", [storyId]);
  await pool.query("COMMIT");

  res.json({ message: "Story deleted successfully" });
};

// Delete a user by admin
export const adminDeleteUser = async (req, res) => {
  const userId = Number(req.params.id);

  // Delete user stories
  await pool.query("DELETE FROM stories WHERE user_id=$1", [userId]);

  // Delete user data
  await pool.query("DELETE FROM users WHERE id=$1", [userId]);

  res.json({ message: "User deleted successfully" });
};
