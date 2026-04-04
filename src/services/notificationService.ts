import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

export type NotificationType = "SYSTEM" | "EMAIL" | "SMS";

export interface SendNotificationPayload {
  userId?: string; // Optional if only sending an external SMS or EMAIL without assigning to a platform user
  type: NotificationType;
  title?: string;
  message: string;
  emailAddress?: string; // Required if type is EMAIL
  phoneNumber?: string; // Required if type is SMS
  metadata?: Record<string, any>;
}

/**
 * Service to dispatch notifications queueing them in Firestore.
 * A Firebase Cloud Function (onNotificationCreated) listens to this collection
 * and performs the actual delivery.
 */
export const notificationService = {
  /**
   * Queue a new notification for delivery
   */
  async send(payload: SendNotificationPayload) {
    try {
      const notificationsRef = collection(db, "notifications");
      
      const docData = {
        ...payload,
        status: "PENDING",
        createdAt: serverTimestamp(),
        isRead: false,
        title_en: payload.title || "New Notification",
        title_sw: payload.title || "Taarifa Mpya",
        message_en: payload.message,
        message_sw: payload.message, // For now mirroring EN message to SW if not provided
      };

      const docRef = await addDoc(notificationsRef, docData);
      console.log(`Notification queued with ID: ${docRef.id}`);
      return docRef.id;
    } catch (error) {
      console.error("Error queueing notification:", error);
      throw error;
    }
  },

  async sendEmail(to: string, subject: string, message: string, userId?: string) {
    return this.send({
      type: "EMAIL",
      userId,
      emailAddress: to,
      title: subject,
      message
    });
  },

  async sendSMS(phoneNumber: string, message: string, userId?: string) {
    return this.send({
      type: "SMS",
      userId,
      phoneNumber,
      message
    });
  },

  async sendSystem(userId: string, title: string, message: string, metadata?: Record<string, any>) {
    return this.send({
      type: "SYSTEM",
      userId,
      title,
      message,
      metadata
    });
  }
};
