const { onSchedule } = require("firebase-functions/v2/scheduler");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ეს არის დაგეგმილი ფუნქცია რომელიც ყოველ წუთში გაეშვება
exports.sendScheduledNotifications = onSchedule("* * * * *", async (event) => {
    const now = new Date();
    const currentTime = now.toTimeString().substring(0, 5); // "HH:MM"
    const currentDay = now.getDay(); // 0 = Sunday

    const snapshot = await db.collection("reminders").get();

    const notifications = [];

    snapshot.forEach(doc => {
        const data = doc.data();
        const { time, days, tag, excludeMastered, fcmToken } = data;

        if (!fcmToken || !days.includes(currentDay) || time !== currentTime) return;

        notifications.push({
            token: fcmToken,
            data: {
                title: "📚 AWorded Reminder",
                body: tag
                    ? `დროა გაიმეორო #${tag} თეგის სიტყვები!`
                    : "დროა გაიმეორო სიტყვები AWorded აპში!",
            }
        });
    });

    for (const notif of notifications) {
        try {
            await messaging.send({
                notification: {
                    title: notif.data.title,
                    body: notif.data.body,
                },
                token: notif.token,
                android: {
                    priority: "high",
                    notification: {
                        icon: "ic_notification",
                        color: "#0077cc"
                    }
                }
            });

            console.log("✅ Notification sent to", notif.token);
        } catch (err) {
            console.error("❌ Error sending notification:", err);
        }
    }

    return null;
});
