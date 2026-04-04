import { getToken } from "firebase/messaging";
import { messaging, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export const requestFCMToken = async (userId: string) => {
    try {
        if (!messaging) {
            console.warn("Messaging not supported or initialized.");
            return null;
        }

        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            // Using a dummy VAPID key placeholder or just let it use the default project config
            // Note: For production, a VAPID key from Firebase Project Settings -> Cloud Messaging is required
            const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
            const token = await getToken(messaging, {
                vapidKey: vapidKey || undefined
            });

            if (token) {
                // Save FCM token to the user document
                await updateDoc(doc(db, "users", userId), {
                    fcmToken: token
                });
                console.log("FCM Token saved for user:", userId);
                return token;
            }
        }
        return null;
    } catch (error) {
        console.error("FCM Permission error:", error);
        return null;
    }
};
