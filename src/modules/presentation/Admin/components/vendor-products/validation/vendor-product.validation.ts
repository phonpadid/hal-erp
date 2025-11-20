export const vendorProductCreateRules = (_t: (key: string) => string) => ({
  vendor_id: [
    {
      required: true,
      message: "ກະລຸນາເລືອກ vendor",
      trigger: "change",
    },
  ],
  product_id: [
    {
      required: true,
      message: "ກະລຸນາເລືອກ product",
      trigger: "change",
    },
  ],
  product_name: [
    {
      max: 255,
      message: "ຊື່ product ຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ",
      trigger: "blur",
    },
  ],
});

export const vendorProductUpdateRules = (_t: (key: string) => string) => ({
  vendor_id: [
    {
      required: true,
      message: "ກະລຸນາເລືອກ vendor",
      trigger: "change",
    },
  ],
  product_id: [
    {
      required: true,
      message: "ກະລຸນາເລືອກ product",
      trigger: "change",
    },
  ],
  product_name: [
    {
      max: 255,
      message: "ຊື່ product ຕ້ອງບໍ່ເກີນ 255 ຕົວອັກສອນ",
      trigger: "blur",
    },
  ],
});