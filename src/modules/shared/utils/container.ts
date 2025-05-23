import type { NotificationService } from "@/modules/interfaces/notification.interface";
import { NotificationServiceImpl } from "@/modules/application/services/notification.service";

export class Container {
  private static notificationService: NotificationService;

  static getNotificationService(): NotificationService {
    if (!this.notificationService) {
      this.notificationService = new NotificationServiceImpl();
    }
    return this.notificationService;
  }
}
