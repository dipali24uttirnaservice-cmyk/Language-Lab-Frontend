import api from "../apiMethod/apiMethod";

export const notificationApi = {
  /**
   * Fetch paginated notifications with optional priority, category, or read filters.
   * @param {Object} params - { priority, category, is_read, page, limit }
   */
  getNotifications: (params = {}) => api.get("/notifications", { params }),

  /**
   * Fast query for unread notification count (for navbar badge).
   */
  getUnreadCount: () => api.get("/notifications/unread-count"),

  /**
   * Mark a single notification as read.
   * @param {string} id - Notification ObjectId
   */
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  /**
   * Mark all notifications as read for current user.
   */
  markAllAsRead: () => api.patch("/notifications/read-all"),

  /**
   * Dismiss or delete a notification.
   * @param {string} id - Notification ObjectId
   */
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};
