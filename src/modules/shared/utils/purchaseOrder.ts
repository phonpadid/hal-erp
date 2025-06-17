import type { PurchaseOrderInterface } from "@/modules/interfaces/purchase-orders.interface";
import { ref } from "vue";

export const purchaseOrderData = ref<PurchaseOrderInterface[]>([
  {
    id: 1,
    orderNumber: "PO-001",
    vendorName: "ບໍລິສັດ ABC ຈຳກັດ",
    orderDate: "2023-10-01",
    status: "pending",
  },
  {
    id: 2,
    orderNumber: "PO-002",
    vendorName: "ບໍລິສັດ XYZ ຈຳກັດ",
    orderDate: "2023-10-05",
    status: "pending",
  },
  {
    id: 3,
    orderNumber: "PO-003",
    vendorName: "ບໍລິສັດ LMN ຈຳກັດ",
    orderDate: "2023-10-10",
    status: "completed",
  },
  {
    id: 4,
    orderNumber: "PO-004",
    vendorName: "ບໍລິສັດ OPQ ຈຳກັດ",
    orderDate: "2023-10-15",
    status: "completed",
  },
]);
