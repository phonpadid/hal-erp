import type { Rule } from 'ant-design-vue/es/form';

export const createBudgetItemDetailsValidation = (
  t: (key: string) => string
): Record<string, Rule[]> => {
  return {
    budget_item_id: [
      {
        required: true,
        message: t('budget_item_details.validation.budgetItemRequired')
      }
    ],
    name: [
      {
        required: true,
        message: t('budget_item_details.validation.nameRequired')
      },
      {
        max: 100,
        message: t('budget_item_details.validation.nameMax')
      }
    ],
    province_id: [
      {
        required: true,
        message: t('budget_item_details.validation.provinceRequired')
      }
    ],
    allocated_amount: [
      {
        required: true,
        message: t('budget_item_details.validation.allocatedAmountRequired')
      },
      {
        pattern: /^[0-9]+(\.[0-9]{1,2})?$/,
        message: t('budget_item_details.validation.allocatedAmountFormat')
      }
    ]
  };
};
