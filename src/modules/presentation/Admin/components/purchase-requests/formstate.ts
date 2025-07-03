import { ref } from "vue";

export const formState = ref({
  document_type_id: "",
  requested_date: "",
  expired_date: "",
  purpose: "ມີການຈັດຊື້ ເນື່ອງຈາກວ່າປະຈຸບັນນີ້ມີພະນັກງານເຂົ້າມາເພີ່ມໃໝ່ 5 ຄົນ", // Added purpose field
  addMore: [
    {
      title: "ຄອມ Laptop HP (8GB/256GB",
      count: 2 as number,
      price: 15000000 as number | undefined,
      images: ["/public/1.png"] as string[],
      remark: "ໝາຍເຫດ",
    },
  ],
});

export const moreFunction = () => {
  formState.value.addMore.push({
    title: "",
    count: 0 as number,
    price: undefined as number | undefined,
    images: [] as string[],
    remark: "",
  });
};

export type Step1Data = {
  document_type_id?: string;
};

export type Step2Data = {
  requested_date: string;
  expired_date: string;
  purpose: string;
  purchaseItem: Array<{
    title:string;
    fileName?: string[] | null;
    quantity: number;
    unitId: string;
    price: number;
    totalPrice: number;
    remark?: string;
  }>;
};
