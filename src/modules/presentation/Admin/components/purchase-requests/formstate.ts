// ในไฟล์ formstate.ts

import { ref } from "vue";
import type { Dayjs } from "dayjs";
export interface AddMoreItem {
  id?: number | string | null;
  totalPrice: number;
  title: string;
  count: string;
  unit_id: number | undefined;
  price: number | undefined;
  images: string[];
  file_name: string;
  remark: string;
}

export interface FormState {
  requested_date: Dayjs | undefined;
  expired_date: Dayjs | undefined;
  purpose: string;
  addMore: AddMoreItem[];
}

// 2. สร้างฟังก์ชันสำหรับ new item ให้ตรงกับ Interface
const createNewItem = (): AddMoreItem => ({
  id: null,
  title: "",
  count: "",
  unit_id: undefined,
  price: undefined,
  images: [],
  file_name: "",
  remark: "",
  totalPrice: 0,
});

// 3. กำหนด state เริ่มต้นให้ถูกต้อง
export const formState = ref<FormState>({
  requested_date: undefined,
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
