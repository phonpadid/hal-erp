import type { PositionApiModel } from "@/modules/interfaces/position.interface";
import {ref} from "vue";

export const dataPositions = ref<PositionApiModel[]>([
  {
    id: 1,
    name: "ປະທ່ານ",
    created_at: "2025-05-10 09:30:00",
    updated_at: "2025-05-10 09:30:00",
  },
  {
    id: 2,
    name: "ຮ່ອງປະທ່ານ",
    created_at: "2025-05-10 10:15:00",
    updated_at: "2025-05-18 14:22:00",
  },
  {
    id: 3,
    name: "ເລຂາ",
    created_at: "2025-05-11 08:45:00",
    updated_at: "2025-05-11 08:45:00",
  },
  {
    id: 4,
    name: "ອໍານວຍການ",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
  {
    id: 5,
    name: "ພະນັກງານ",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
]);
