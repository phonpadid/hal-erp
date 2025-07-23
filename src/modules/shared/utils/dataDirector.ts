import type { DirectorInterface } from "@/modules/interfaces/director.interface";
import { ref } from "vue";
export const directorData = ref<DirectorInterface[]>([
  {
    id: 1,
    name: "ຄອມພີວເຕີ MacBook Pro (16GB RAM, 512GB SSD)",
    code: "1001 - ຄ່າບໍລິຫານທົ່ວໄປ",
    quantity: 1,
    unit: "₭",
    price: 25936000,
    total: 25936000,
    note: "ພະແນກພັດທະນາທຸລະກິດ",
  },
]);
