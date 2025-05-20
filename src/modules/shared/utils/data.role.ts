import type { RoleResponse } from "@/modules/interfaces/role.interface";
import { ref } from "vue";
export const dataRoles = ref<RoleResponse[]>([
  {
    id: 1,
    display_name: "Create Department",
    name: "create-department",
  },
  {
    id: 2,
    display_name: "Update Department",
    name: "update-department",
  },
  {
    id: 3,
    display_name: "Delete Department",
    name: "delete-department",
  },
  {
    id: 4,
    display_name: "Read Department",
    name: "read-department",
  },
]);
