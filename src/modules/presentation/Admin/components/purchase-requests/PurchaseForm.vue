<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { useDocumentTypeStore } from "../../stores/document-type.store";
import { DatePicker } from "ant-design-vue";
import Textarea from "@/common/shared/components/Input/Textarea.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import { formatPrice, NumberOnly, parsePrice } from "@/modules/shared/utils/format-price";
// import DatePicker from "@/common/shared/components/Datepicker/DatePicker.vue";
const profileImage = ref("/public/Profile-PNG-File.png");
const userName = ref("ທ້າວສຸກີ້");
const userPosition = ref("ພະແນກການເງິນ, ພະນັກງານ");
// Define emit for parent communication
const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  "next-step": [data: any];
}>();
const formModel = reactive({
  title: '',
  count: 0 as number,
  price: 0 as number,
  remark: ''
})
const store = useDocumentTypeStore();
const docItem = computed(() =>
  store.documentType.map((item) => ({
    value: item.getId(),
    label: item.getname(),
  }))
);

const formState = reactive({
  document_type_id: "",
});

const nextStep = () => {
  if (formState.document_type_id) {
    // Emit the form data to parent and trigger next step
    emit("next-step", {
      document_type_id: formState.document_type_id,
      // Add any other data you want to pass to the next step
    });
  }
};

onMounted(async () => {
  await store.fetchdocumentType({ page: 1, limit: 1000 });
});
const formatedPrice = computed({
  get() {
    return formatPrice(formModel.price);
  },
  set(value: string) {
    const digitsOnly = value.replace(/\D/g, "");
    formModel.price = parsePrice(digitsOnly);
  },
});
</script>

<template>
  <div class="px-0 mb-[20rem]">
    <div class="">
      <h2 class="text-md font-semibold px-0 mb-4">ຂໍ້ມູນຜູ້ສະເໜີ</h2>
      <div class="info flex items-center px-0 gap-4 mb-4">
        <a-image
          :src="profileImage"
          alt="avatar"
          class="w-20 h-20 rounded-full object-cover"
          :width="80"
          :height="80"
          :preview="false"
        />
        <div class="detail -space-y-2">
          <p class="font-medium">{{ userName }}</p>
          <p class="text-gray-600">{{ userPosition }}</p>
        </div>
      </div>
      <!-- date  -->
      <div class="date md:flex flex-row w-full gap-8">
        <div class="requested-date -space-y-4">
          <p class="font-medium">ວັນທີສະເໜີ</p>
          <DatePicker class="md:w-[370px] w-full" />
        </div>
        <div class="requested-date -space-y-4">
          <p class="font-medium">ວັນທີ່ຕ້ອງການ</p>
          <DatePicker class="md:w-[370px] w-full" />
        </div>
      </div>
      <!-- purposes  -->
      <div class="purposes mt-4">
        <p>ຈຸດປະສົງ</p>
        <Textarea class="md:w-[770px] w-full" />
      </div>
      <!-- title request  -->
       <div class="request mt-4 flex gap-4">
        <div class="title w-full">
          <label for="">ຫົວຂໍ້</label>
          <UiInput placeholder="ປ້ອນຫົວຂໍ້ທີ່ຕ້ອງການສະເໜີ" ></UiInput>
        </div>
        <div class="title w-full">
          <label for="">ຈຳນວນ</label>
          <UiInput
          placeholder="ປ້ອນຈຳນວນທີ່ຕ້ອງການສະເໜີ"
          @keypress="NumberOnly"
          />
        </div>
        <div class="title w-full">
          <label for="">ລາຄາ</label>
          <UiInput
          v-model="formatedPrice"
          placeholder="ປ້ອນລາຄາທີ່ຕ້ອງການສະເໜີ"
          @keypress="NumberOnly"
          />
        </div>
        <div class="title w-full">
          <label for="">ໝາຍເຫດ</label>
          <UiInput placeholder="ປ້ອນໝາຍ"></UiInput>
        </div>
       </div>
    </div>
  </div>
</template>
