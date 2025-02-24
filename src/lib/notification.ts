export const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    return;
  }

  const permission = await Notification.requestPermission();
  return permission;
};

export const showNotification = (
  title: string,
  options?: NotificationOptions
) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, options);
  }
};
