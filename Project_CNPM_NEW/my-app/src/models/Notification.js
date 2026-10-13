class Notification {
    constructor(notificationId, recipientType, recipientId, title, message, notificationType, isRead, actionUrl, createdAt, readAt) {
        this.notificationId = notificationId;
        this.recipientType = recipientType;
        this.recipientId = recipientId;
        this.title = title;
        this.message = message;
        this.notificationType = notificationType;
        this.isRead = isRead;
        this.actionUrl = actionUrl;
        this.createdAt = createdAt;
        this.readAt = readAt;
    }

    markAsRead() {
        this.isRead = true;
        this.readAt = new Date();
    }

    updateMessage(newMessage) {
        this.message = newMessage;
    }

    static createNotification(recipientType, recipientId, title, message, notificationType, actionUrl) {
        const createdAt = new Date();
        return new Notification(null, recipientType, recipientId, title, message, notificationType, false, actionUrl, createdAt, null);
    }
}

export default Notification;