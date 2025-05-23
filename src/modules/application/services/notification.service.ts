import { notification } from "ant-design-vue";
import type { NotificationService } from "@/modules/interfaces/notification.interface";

export class NotificationServiceImpl implements NotificationService {
  private static instance: NotificationServiceImpl;
  private readonly DEFAULT_DURATION = 3;
  private readonly DEFAULT_PLACEMENT = "topRight";

  private constructor() {
    // Private constructor to force singleton pattern
  }

  public static getInstance(): NotificationServiceImpl {
    if (!NotificationServiceImpl.instance) {
      NotificationServiceImpl.instance = new NotificationServiceImpl();
    }
    return NotificationServiceImpl.instance;
  }

  success(message: string, description?: string, duration?: number): void {
    notification.success({
      message,
      description,
      duration: duration || this.DEFAULT_DURATION,
      placement: this.DEFAULT_PLACEMENT,
    });
  }

  error(message: string, description?: string, duration?: number): void {
    notification.error({
      message,
      description,
      duration: duration || this.DEFAULT_DURATION,
      placement: this.DEFAULT_PLACEMENT,
    });
  }

  info(message: string, description?: string, duration?: number): void {
    notification.info({
      message,
      description,
      duration: duration || this.DEFAULT_DURATION,
      placement: this.DEFAULT_PLACEMENT,
    });
  }

  warning(message: string, description?: string, duration?: number): void {
    notification.warning({
      message,
      description,
      duration: duration || this.DEFAULT_DURATION,
      placement: this.DEFAULT_PLACEMENT,
    });
  }

  destroy(): void {
    notification.destroy();
  }
}
