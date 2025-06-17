import type { PurchaseRequestInterface } from "@/modules/interfaces/purchase-request.interface";
import { ref } from "vue";
export const purchaseRequestData = ref<PurchaseRequestInterface[]>([
  {
    id: 1,
    name: "ຄອມພີວເຕີ MacBook Pro (16GB RAM, 512GB SSD)",
    quantity: 1,
    unit: "₭",
    price: 25936000,
    note: "ພະແນກພັດທະນາທຸລະກິດ",
  },
]);
