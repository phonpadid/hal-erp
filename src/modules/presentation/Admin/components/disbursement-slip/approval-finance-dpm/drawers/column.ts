import type { Column } from "@/modules/shared/column/column";

export function columnsTitle(t: (key: string) => string): Column[] {

  return [
    {
      title: "ຂໍ້ສະເໜີເບິກງົບປະມານ",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "ຈຳນວນ",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "ພະແນກ",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "ໜ່ວຍງານ",
      dataIndex: "work",
      key: "work",
    },

  ];
}
export function columnTitle(t: (key: string) => string): Column[] {
  return [
    {
      title: "ລຳດັບ",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "ເນື້ອໃນລາຍການ",
      dataIndex: "content",
      key: "content",
    },
    {
      title: "ຈຳນວນ",
      dataIndex: "qty",
      key: "qty",
    },
    {
      title: "ຫົວໜ່ວຍ",
      dataIndex: "unit",
      key: "unit",
    },
    {
      title: "ລາຄາ/ຫົວໜ່ວຍ",
      dataIndex: "price_per_unit",
      key: "price_per_unit",
    },
    {
      title: "ລາຄາລວມ",
      dataIndex: "amount",
      key: "amount",
    },
    {
      title: "ຈຳນວນເງິນ (ຕົວໜັງສື)",
      dataIndex: "work",
      key: "work",
    },

  ];
}
export const dataItem = [
  {id: 1, content: "ຊື້ຄອມພິວເຕີ Hp core i5 (8GB/264GB)", qty: 5, unit: 'ເຄື່ອງ', price_per_unit: 1000000, amount: 5000000 , department: "ພັດທະນາຊ໋ອບແວ", work: "ພະນັກງານ"},
]
export const data = [
  {title: "ຈັດຊື້ຄອມພິວເຕີ", qty: 5, department: "ພັດທະນາຊ໋ອບແວ", work: "ພະນັກງານ"},
]
