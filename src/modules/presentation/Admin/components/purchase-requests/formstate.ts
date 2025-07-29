// ในไฟล์ formstate.ts

import { ref } from "vue";
import type { Dayjs } from "dayjs";
export interface AddMoreItem {
  totalPrice: number;
  title: string;
  count: string; // รับเป็น string จาก input, ค่อยแปลงเป็น number ตอนบันทึก
  unit_id: number | undefined; // เพิ่ม unit_id
  price: number | undefined;
  images: string[];
  file_name: string; // เพิ่ม file_name
  remark: string;
}

export interface FormState {
  expired_date: Dayjs | undefined;
  purpose: string;
  addMore: AddMoreItem[];
}

// 2. สร้างฟังก์ชันสำหรับ new item ให้ตรงกับ Interface
const createNewItem = (): AddMoreItem => ({
  title: "",
  count: "",
  unit_id: undefined,
  price: undefined,
  images: [],
  file_name: "",
  remark: "",
});

// 3. กำหนด state เริ่มต้นให้ถูกต้อง
export const formState = ref<FormState>({
  expired_date: undefined,
  purpose: "",
  addMore: [createNewItem()],
});

// 4. แก้ไข moreFunction ให้ถูกต้อง
export const moreFunction = () => {
  formState.value.addMore.push(createNewItem());
};

// Type สำหรับส่งข้อมูลระหว่าง Step (อาจจะจำเป็นในไฟล์อื่น)
export type Step1Data = {
  document_type_id?: string;
};

// เราจะใช้ FormState เป็น Step2Data โดยตรง หรือจะสร้างใหม่ก็ได้
export type Step2Data = FormState;
