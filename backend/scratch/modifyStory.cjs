const fs = require('fs');

const path = 'backend/controllers/storyController.js';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  `} from "../utils/cloudinary.js";`,
  `} from "../utils/cloudinary.js";\nimport { createNotification } from "../utils/notificationUtils.js";`
);

content = content.replace(
  `res.json({ liked: true });`,
  `const storyOwnerRes = await pool.query("SELECT user_id, title FROM stories WHERE id = $1", [storyId]);
    if (storyOwnerRes.rows.length > 0) {
      const storyOwnerId = storyOwnerRes.rows[0].user_id;
      if (storyOwnerId !== userId) {
        await createNotification({
          userId: storyOwnerId,
          type: "like",
          title: "New Like",
          message: \`\${req.user?.name || 'Someone'} liked your story "\${storyOwnerRes.rows[0].title}".\`,
          link: \`/profile?tab=stories\` 
        });
      }
    }

    res.json({ liked: true });`
);

content = content.replace(
  `res.status(201).json({ comment: inserted.rows[0] });`,
  `const storyOwnerRes = await pool.query("SELECT user_id, title FROM stories WHERE id = $1", [storyId]);
    if (storyOwnerRes.rows.length > 0) {
      const storyOwnerId = storyOwnerRes.rows[0].user_id;
      if (storyOwnerId !== userId) {
        await createNotification({
          userId: storyOwnerId,
          type: "comment",
          title: "New Comment",
          message: \`\${req.user?.name || 'Someone'} commented on your story "\${storyOwnerRes.rows[0].title}".\`,
          link: \`/profile?tab=stories\` 
        });
      }
    }

    res.status(201).json({ comment: inserted.rows[0] });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Modified storyController.js successfully');
