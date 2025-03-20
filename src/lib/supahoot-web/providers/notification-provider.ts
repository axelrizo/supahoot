export const notificationProvider = {
  showNotification: (message: string) => alert(message),
}

export type NotificationProvider = typeof notificationProvider
