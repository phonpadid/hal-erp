import type { Roleinterface } from "@/modules/interfaces/role.interface";
import { ref } from "vue";
export const dataPermission = ref<Roleinterface[]>([
  {
    id: 1,
    name: "ແອັດມິນ",
    display_name: "addMin",
    created_at: "2025-05-10 09:30:00",
    updated_at: "2025-05-10 09:30:00",
  },
  {
    id: 2,
    name: "ພະນັກງານຂາຍ",
    display_name: "Sell",
    created_at: "2025-05-10 10:15:00",
    updated_at: "2025-05-18 14:22:00",
  },
  {
    id: 3,
    name: "ເດບ",
    display_name: "Dev",
    created_at: "2025-05-11 08:45:00",
    updated_at: "2025-05-11 08:45:00",
  },
  {
    id: 4,
    name: "ພະນັກງານປະຈຳຫ້ອງການ",
    display_name: "Hal",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
  {
    id: 5,
    name: "Hal",
    display_name: "Haltech",
    created_at: "2025-05-13 15:30:00",
    updated_at: "2025-05-13 15:30:00",
  },
]);
