const fs = require('fs');

const path = 'backend/controllers/sosController.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { createNotification')) {
  content = content.replace(
    `import pool from "../config/db.js";`,
    `import pool from "../config/db.js";\nimport { createNotification, createAdminNotification } from "../utils/notificationUtils.js";`
  );
}

// In createSOSAlert
content = content.replace(
  `res.status(201).json({ 
            success: true, 
            message: "SOS Alert sent successfully. Help is on the way.", 
            alert: result.rows[0] 
        });`,
  `const newAlert = result.rows[0];
        
        await createAdminNotification({
            type: "sos_alert",
            title: "🚨 SOS ALERT",
            message: \`New SOS alert received from \${req.user?.name || 'a user'}.\`,
            link: \`/admin/sos\`
        });
        
        res.status(201).json({ 
            success: true, 
            message: "SOS Alert sent successfully. Help is on the way.", 
            alert: newAlert 
        });`
);

// In resolveSOSAlert
content = content.replace(
  `res.json({ message: "SOS alert marked as resolved" });`,
  `// Get user id for the alert
        const alertRes = await pool.query("SELECT user_id FROM sos_alerts WHERE id = $1", [id]);
        if (alertRes.rows.length > 0 && alertRes.rows[0].user_id) {
            await createNotification({
                userId: alertRes.rows[0].user_id,
                type: "sos_update",
                title: "SOS Resolved",
                message: "Your SOS situation has been marked as resolved by the response team.",
                link: \`/sos\`
            });
        }
        res.json({ message: "SOS alert marked as resolved" });`
);

// In updateSOSSituation
content = content.replace(
  `res.json({ message: "SOS situation updated successfully" });`,
  `const alertRes = await pool.query("SELECT user_id FROM sos_alerts WHERE id = $1", [id]);
        if (alertRes.rows.length > 0 && alertRes.rows[0].user_id) {
            await createNotification({
                userId: alertRes.rows[0].user_id,
                type: "sos_update",
                title: "SOS Update",
                message: "The response team has added new notes to your SOS situation.",
                link: \`/sos\`
            });
        }
        res.json({ message: "SOS situation updated successfully" });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Modified sosController.js successfully');
