import type { CategoryApiModel } from "@/modules/interfaces/category.interface";
import { ref } from "vue";

export const dataCategories = ref<CategoryApiModel[]>([
  {
    id: 1,
    name: "ເຄື່ອງດື່ມ",
    created_at: "2025-05-10 09:30:00",
    updated_at: "2025-05-10 09:30:00",
  },
  {
    id: 2,
    name: "ເຄື່ອງໃຊ້ໄຟຟ້າ",
    created_at: "2025-05-10 10:15:00",
    updated_at: "2025-05-18 14:22:00",
  },
  {
    id: 3,
    name: "ເຄື່ອງກິນ",
    created_at: "2025-05-11 08:45:00",
    updated_at: "2025-05-11 08:45:00",
  },
  {
    id: 4,
    name: "ເຄື່ອງນຸ່ງ",
    created_at: "2025-05-12 13:20:00",
    updated_at: "2025-05-15 11:10:00",
  },
]);
