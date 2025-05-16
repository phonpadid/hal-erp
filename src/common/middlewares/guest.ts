import type { MiddlewareContext } from "./index";

export default function guest(context: MiddlewareContext) {
  if (localStorage.getItem("access_token")) {
    return context.router.push({ name: "dashboard" }).catch(() => {});
  }
  return context.next;
}
