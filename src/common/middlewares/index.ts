import auth from "./auth";
import guest from "./guest";
import type { NavigationGuardNext, RouteLocationNormalized, Router } from "vue-router";

export declare interface MiddlewareContext {
  router: Router;
  from: RouteLocationNormalized;
  next: NavigationGuardNext;
  to: RouteLocationNormalized;
}

// Define a type for the middleware function
export interface MiddlewareFunction {
  (context: MiddlewareContext & { nextMidd?: () => void }): void;
}

// Define a more specific context type for nextCheck
export interface NextCheckContext {
  router: Router;
  from: RouteLocationNormalized;
  to: RouteLocationNormalized;
  next: NavigationGuardNext;
}

export function nextCheck(
  context: NextCheckContext,
  middleware: MiddlewareFunction[],
  index: number
): NavigationGuardNext {
  const nextMiddleware = middleware[index];

  // ถ้าไม่มี middleware ถัดไป ให้ส่งคืน context.next เลย
  if (!nextMiddleware) return context.next;

  // สร้างฟังก์ชันใหม่ที่จะถูกใช้เป็น NavigationGuardNext
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const guardNext: NavigationGuardNext = (to?: any) => {
    // เรียกใช้ context.next กับพารามิเตอร์ที่ได้รับ
    if (to !== undefined) {
      context.next(to);
    } else {
      context.next();
    }

    // เตรียม nextMidd สำหรับ middleware ถัดไป
    const nextMidd = () => {
      const nextGuard = nextCheck(context, middleware, index + 1);
      nextGuard();
    };

    // เรียกใช้ middleware ปัจจุบันพร้อมกับ context และ nextMidd
    nextMiddleware({ ...context, nextMidd });
  };

  return guardNext;
}

export default {
  auth,
  guest,
};
