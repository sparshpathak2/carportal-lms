import { axiosInstance } from "@/lib/axios";

// -------------------- Notifications --------------------

// Fetch all notifications for a user
export const getNotificationsByUser = async (userId: string) => {
  const res = await axiosInstance.get(`/notification/notifications/${userId}`);
  return res.data.data;
};

// Fetch unread count for a user
export const getUnViewedCount = async (userId: string) => {
  const res = await axiosInstance.get(`/notification/notifications/unviewed/${userId}`);
  return res.data.count;
};

export const getUnReadCount = async (userId: string) => {
  const res = await axiosInstance.get(`/notification/notifications/unread/${userId}`);
  return res.data.count;
};

// Create a new notification (can be used by admin/service)
export const createNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type?: string;
}) => {
  const res = await axiosInstance.post(`/notification`, data);
  return res.data;
};

// Mark a single notification as read
export const markNotificationAsRead = async (id: number) => {
  const res = await axiosInstance.patch(`/notification/${id}/read`);
  return res.data;
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string) => {
  const res = await axiosInstance.patch(`/notification/mark-all/${userId}`);
  return res.data;
};

// Delete a notification (optional)
export const deleteNotification = async (id: number) => {
  const res = await axiosInstance.delete(`/notification/${id}`);
  return res.data;
};
