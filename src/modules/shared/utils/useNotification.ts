import { NotificationServiceImpl } from "@/modules/application/services/notification.service";

export function useNotification() {
  const notificationService = NotificationServiceImpl.getInstance();

  return {
    success: notificationService.success.bind(notificationService),
    error: notificationService.error.bind(notificationService),
    info: notificationService.info.bind(notificationService),
    warning: notificationService.warning.bind(notificationService),
    destroy: notificationService.destroy.bind(notificationService),
  };
}
