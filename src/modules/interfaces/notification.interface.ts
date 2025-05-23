export interface NotificationMessage {
  type: "success" | "error" | "info" | "warning";
  message: string;
  description?: string;
  duration?: number;
  placement?: "topLeft" | "topRight" | "bottomLeft" | "bottomRight";
  key?: string;
}

export interface NotificationService {
  success(message: string, description?: string, duration?: number): void;
  error(message: string, description?: string, duration?: number): void;
  info(message: string, description?: string, duration?: number): void;
  warning(message: string, description?: string, duration?: number): void;
  destroy(): void;
}
