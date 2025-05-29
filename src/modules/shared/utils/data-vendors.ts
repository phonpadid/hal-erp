import type { VendorInterface } from "@/modules/interfaces/vendors/vendor/vendor.interfacce";
import { ref } from "vue";

export const dataVendors = ref<VendorInterface[]>([
  {
    id: "1",
    name: "ບໍລິສັດ ABC",
    contact_info: "ບໍລິສັດ ABC ທີ່ຢູ່ 123 ຖະໜົນ ເມືອງ X",
    created_at: "05/05/2025 09:30:00",
    updated_at: "05/05/2025 09:30:00",
  },
  {
    id: "2",
    name: "ບໍລິສັດ XYZ",
    contact_info: "ບໍລິສັດ XYZ ທີ່ຢູ່ 456 ຖະໜົນ ເມືອງ Y",
    created_at: "05/05/2025 09:30:00",
    updated_at: "05/05/2025 09:30:00",
  },
  {
    id: "3",
    name: "ບໍລິສັດ LMN",
    contact_info: "ບໍລິສັດ LMN ທີ່ຢູ່ 789 ຖະໜົນ ເມືອງ Z",
    created_at: "05/05/2025 09:30:00",
    updated_at: "05/05/2025 09:30:00",
  },
  {
    id: "4",
    name: "ໂນເນໂນ ການເນ",
    contact_info: "ໂນເນໂນ ການເນ ທີ່ຢູ່ 101 ຖະໜົນ ເມືອງ A",
    created_at: "05/05/2025 09:30:00",
    updated_at: "05/05/2025 09:30:00",
  },
  {
    id: "5",
    name: "ໂນເນໂນ ການເນ ສານ",
    contact_info: "ໂນເນໂນ ການເນ ສານ ທີ່ຢູ່ 102 ຖະໜົນ ເມືອງ B",
    created_at: "05/05/2025 09:30:00",
    updated_at: "05/05/2025 09:30:00",
  },
]);
