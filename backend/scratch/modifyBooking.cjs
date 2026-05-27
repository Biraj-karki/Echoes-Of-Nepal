const fs = require('fs');

const path = 'backend/controllers/bookingController.js';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('import { createNotification }')) {
  content = content.replace(
    `import pool from "../config/db.js";`,
    `import pool from "../config/db.js";\nimport { createNotification } from "../utils/notificationUtils.js";`
  );
}

// In createBooking, notify vendor
content = content.replace(
  `res.status(201).json({ message: "Booking request submitted successfully.", booking: result.rows[0] });`,
  `// Get vendor owner_user_id
        const vendorRes = await pool.query("SELECT owner_user_id FROM vendors WHERE id = $1", [vendor_id]);
        if (vendorRes.rows.length > 0) {
            await createNotification({
                userId: vendorRes.rows[0].owner_user_id,
                type: "booking_request",
                title: "New Booking Request",
                message: \`You have a new booking request from \${contact_name}.\`,
                link: \`/vendor/bookings\`
            });
        }
        res.status(201).json({ message: "Booking request submitted successfully.", booking: result.rows[0] });`
);

// In updateBookingStatus, notify customer
content = content.replace(
  `res.json({ message: "Booking status updated", booking: result.rows[0] });`,
  `const updatedBooking = result.rows[0];
        await createNotification({
            userId: updatedBooking.user_id,
            type: "booking_status",
            title: "Booking Update",
            message: \`Your booking request has been \${status}.\`,
            link: \`/my-bookings\`
        });
        res.json({ message: "Booking status updated", booking: updatedBooking });`
);

// In verifyKhaltiPayment, notify vendor
content = content.replace(
  `res.json({ success: true, message: "Payment verified and booking confirmed.", booking: result.rows[0] });`,
  `const confirmedBooking = result.rows[0];
            const vendorOwnerRes = await pool.query("SELECT owner_user_id FROM vendors WHERE id = $1", [confirmedBooking.vendor_id]);
            if (vendorOwnerRes.rows.length > 0) {
                await createNotification({
                    userId: vendorOwnerRes.rows[0].owner_user_id,
                    type: "booking_payment",
                    title: "Payment Received",
                    message: \`Payment verified for booking #\${confirmedBooking.id}.\`,
                    link: \`/vendor/bookings\`
                });
            }
            res.json({ success: true, message: "Payment verified and booking confirmed.", booking: confirmedBooking });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Modified bookingController.js successfully');
