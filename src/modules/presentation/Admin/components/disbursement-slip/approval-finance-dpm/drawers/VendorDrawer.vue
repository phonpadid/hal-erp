// In your Vue component - updated script setup section

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { computed } from "vue";
import type { ISelectVendor } from "@/modules/application/dtos/receipt.dto";

// Import the print helper

const { t } = useI18n();
const props = defineProps<{
  data: ISelectVendor | null;
}>();
const vender = computed(() => props.data);
const bank = computed(() => props.data?.vendor_bank_account?.bank)
const account = computed(() => props.data?.vendor_bank_account)
</script>

<template>
  <div class="container mx-auto py-0 px-0 -mt-2">
    <div class="user-info shadow-sm py-2">
      <div class="info flex items-center px-6 gap-4 mb-4">
        <div
          class="flex items-center justify-center w-[6rem] h-20 bg-blue-100 overflow-hidden"
        >
          <a-image
            :src="vender?.filename_url"
            alt="Vendor logo"
            class="object-contain w-[10rem] h-10"
          />
        </div>
      </div>
      <div class="text-sm space-y-4">
          <div class="gap-2 flex">
            <label class="w-[12rem] text-gray-700">{{ t("disbursement.vendor.name") }} : </label>
            <span class="text-gray-700">{{ props.data?.vendor?.name }}</span>
          </div>


          <div class="gap-2 flex">
            <label class="w-[12rem] text-gray-700">{{ t("disbursement.vendor.bank") }} :</label>
            <img :src="props.data?.vendor_bank_account?.bank?.logoUrl" alt="bank logo" class="h-8 w-8" srcset="" />
            <span class="text-gray-700">{{ bank?.name }}</span>
          </div>
          <div class="gap-2 flex">
            <label class="w-[12rem] text-gray-700">{{ t("disbursement.vendor.account_name") }}: </label>
            <span class="text-gray-700">{{ account?.account_name }}</span>
          </div>
          <div class="gap-2 flex">
            <label class="w-[12rem] text-gray-700 flex items-center gap-1"
              >{{ t("disbursement.vendor.account_number") }}
              <span
                class="text-sm rounded-full py-1 w-14 flex justify-center items-center bg-gray-200/70"
                >{{ account?.currency?.code }}</span
              >
            </label>
            <span class="text-gray-700">{{ account?.account_number }}</span>
          </div>
        </div>
    </div>
  </div>
</template>
