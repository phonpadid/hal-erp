// utils/customSteps.ts

export function getCustomSteps(t: (key: string) => string) {
  return [
    {
      title: t("purchase-rq.field.doc_type"),
      data: null,
    },
    {
      title: t("purchase-rq.description"),
      data: null,
      disabled: true,
    },
    {
      title: t("purchase-rq.check"),
      data: null,
      disabled: true,
    },
    {
      title: t("purchase-rq.done"),
      data: null,
      disabled: true,
    },
  ];
}
