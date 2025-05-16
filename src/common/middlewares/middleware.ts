// import type { MiddlewareContext } from "../middlewares/index";
// // import { useAuthStore } from "../stores/auth.store";

// // เพิ่ม interface สำหรับ Permission
// interface Permission {
//   id: number;
//   name: string;
//   description: string;
//   group_name: string;
//   created_at: string;
// }

// export default function permission(requiredPermissions: string | string[]) {
//   return (context: MiddlewareContext) => {
//     // ตรวจสอบว่ามี token หรือไม่
//     if (!localStorage.getItem("access_token")) {
//       return context.router.push({ name: "login" }).catch(() => {});
//     }

//     // รับข้อมูลสิทธิ์จาก store
//     // const authStore = useAuthStore();
//     // const userPermissions = authStore.permissions || [];

//     // สร้าง array ของชื่อ permissions
//     // const userPermissionNames = userPermissions.map((p: Permission) => p.name);

//     // แปลง requiredPermissions เป็น array ถ้าเป็น string
//     const permissionsToCheck = Array.isArray(requiredPermissions)
//       ? requiredPermissions
//       : [requiredPermissions];

//     // ตรวจสอบว่ามีสิทธิ์ที่ต้องการอย่างน้อยหนึ่งสิทธิ์หรือไม่
//     const hasPermission = permissionsToCheck.some((permission) =>
//       userPermissionNames.includes(permission)
//     );

//     // ถ้าไม่มีสิทธิ์ ให้ redirect ไปหน้า unauthorized
//     if (!hasPermission) {
//       return context.router.push({ name: "unauthorized" }).catch(() => {});
//     }

//     return context.next;
//   };
// }
