import type { UnitApiModel } from "@/modules/interfaces/unit.interface";
import { ref } from "vue";
export const dataUnits = ref<UnitApiModel[]>([
  {
    id: 1,
    name: "ກິໂລກຣາມ",
    created_at: "2025-05-10 09:30:00",
    updated_at: "2025-05-10 09:30:00",
  },
  {
    id: 2,
    name: "ລິດ",
    created_at: "2025-05-10 10:15:00",
    updated_at: "2025-05-18 14:22:00",
  },
  {
    id: 3,
    name: "ຊິ້ນ",
    created_at: "2025-05-11 08:45:00",
    updated_at: "2025-05-11 08:45:00",
  },
  {
    id: 4,
    name: "ແມັດ",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
  {
    id: 5,
    name: "ກ່ອງ",
    created_at: "2025-05-13 15:30:00",
    updated_at: "2025-05-13 15:30:00",
  },
]);
