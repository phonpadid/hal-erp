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
  file_name: string;           // ✅ เก็บ filename จริงจาก API เช่น "Purchase_requests_-_xxx.pdf"
  fileType: 'image' | 'pdf' | ''; // ✅ แยก field สำหรับเช็ค type
  remark: string;
}

export interface FormState {
  requested_date: Dayjs | undefined;
  expired_date: Dayjs | undefined;
  purpose: string;
  addMore: AddMoreItem[];
}

const createNewItem = (): AddMoreItem => ({
  id: null,
  title: "",
  count: "",
  unit_id: undefined,
  price: undefined,
  images: [],
  file_name: "",    // ✅ ค่าเริ่มต้นเป็น string ว่าง
  fileType: '',     // ✅ ค่าเริ่มต้นเป็น string ว่าง
  remark: "",
  totalPrice: 0,
});

export const formState = ref<FormState>({
  requested_date: undefined,
  expired_date: undefined,
  purpose: "",
  addMore: [createNewItem()],
});

export const moreFunction = () => {
  formState.value.addMore.push(createNewItem());
};

export type Step1Data = {
  document_type_id?: string;
};

export type Step2Data = FormState;