
import { computed, type Ref } from "vue";

export type DataHeadType = {
  role?: boolean;
  exist_access?: boolean;
  rId?: number;
  no?: string;
  isApproved?: boolean;
  finalStatusId?: number; 
  status?: { id: number; name?: string } | { id: number; name?: string }[]; // อัพเดทให้รองรับทั้ง Object เดี่ยวและ Array
  created_at?: string;
  is_otp?: boolean;
  is_upload?: boolean;
  approver_info?: {
    status?: {
      id: number;
      name: string;
      dpm?: {
        id: number;
        name?: string;
      }[];
    }[];
  }[];
};

// Composable Function
export function useDocumentStatus(dataHead: Ref<DataHeadType | undefined | null>) {

  const documentStatus = computed(() => {
    if (!dataHead.value) {
      return "ກຳລັງໂຫຼດຂໍ້ມູນ...";
    }
    
    const finalStatusId = dataHead.value.finalStatusId;

    // 1. ตรวจสอบสถานะสุดท้าย (Rejected และ Approved) จาก ID ที่ส่งมา
    // ID: 3 = Rejected
    if (finalStatusId === 3) { 
        return "ຖືກປະຕິເສດ";
    }
    // ID: 2 = Approved
    if (finalStatusId === 2) { 
        return "ອະນຸມັດແລ້ວ";
    }
    
    // 2. ถ้าเป็น ID อื่น (เช่น 1 = PENDING) ให้ตรวจสอบรายละเอียดการอนุมัติ
    // 💡 ตรรกะ Pending: ดูว่ามีแผนกไหนรออนุมัติอยู่ไหม
    const pendingDepartments =
      dataHead.value.approver_info?.flatMap(
        (d) =>
          d.status
            ?.filter((s) => s.id === 1) // status_id = 1 (Pending)
            .flatMap((s) => s.dpm ?? []) ?? []
      ) ?? [];

    if (pendingDepartments.length > 0) {
      return `ລໍຖ້າ ${pendingDepartments.map((d) => d.name).join(", ")} ອະນຸມັດ`; // รอ [แผนก] อนุมัติ
    }
    
    // 3. ถ้าไม่เข้าเงื่อนไขใดๆ และ ID คือ 1 (PENDING) แต่ไม่พบขั้นตอนที่รอ
    return "ລໍຖ້າການດຳເນີນການ"; 
  });
  
  

  const documentStatusClass = computed(() => {
    const status = documentStatus.value;

    if (status.includes("ລໍຖ້າ")) {
      return "text-orange-500 text-sm font-medium ml-2 ring-2 ring-orange-300 px-3 py-1 rounded-full";
    }
    if (status.includes("ປະຕິເສດ")) {
      return "text-red-500 text-sm font-medium ml-2 ring-2 ring-red-600 px-3 py-1 rounded-full";
    }
    return "text-green-600 text-sm font-medium ml-2 ring-1 ring-green-500 px-3 py-1 rounded-full";
  });

  return { documentStatus, documentStatusClass };
}