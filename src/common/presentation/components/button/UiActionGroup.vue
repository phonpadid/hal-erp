<template>
  <div class="action-group">
    <div
      v-if="showVerify"
      @click="verifyItem(record)"
      class="action-icon text-gray-500/80"
    >
      <Icon class="icon-size" :icon="verifyIcon" />
    </div>
    <div
      v-if="showView"
      @click="viewItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="viewIcon" />
    </div>
    <div
      v-if="showDownload"
      @click="downloadItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="downloadIcon" />
    </div>
    <div
      v-if="showAdd"
      @click="addItem(record)"
      class="action-icon text-green-500/80"
    >
      <Icon class="icon-size" :icon="addIcon" />
    </div>
    <div
      v-if="showEdit"
      @click="editItem(record)"
      class="action-icon text-gray-500/80"
    >
      <Icon class="icon-size" :icon="editIcon" />
    </div>
    <a-tooltip v-if="showConfirm" content="Confirm">
      <div @click="confirmItem(record)" class="action-icon text-blue-600/80">
        <Icon class="icon-size" :icon="confirmIcon" />
      </div>
    </a-tooltip>
    <a-tooltip v-if="showCancle" content="Cancel">
      <div @click="cancleItem(record)" class="action-icon text-red-600/80">
        <Icon class="icon-size" :icon="cancleIcon" />
      </div>
    </a-tooltip>
    <a-popconfirm
      v-if="showDelete"
      title="ທ່ານຕ້ອງການລືບຂໍ້ມູນນີ້ເເທ້ບໍ່ ?"
      @confirm="deleteItem(record)"
      okText="ຍືນຍັນ"
      cancelText="ຍົກເລີກ"
    >
      <div class="action-icon text-red-500/80">
        <Icon class="icon-size" :icon="deleteIcon" />
      </div>
    </a-popconfirm>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
import { Icon } from "@iconify/vue";

interface RecordType {
  [key: string]: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps({
  record: {
    type: Object as () => RecordType,
    required: true,
  },
  addIcon: {
    type: String,
    default: "material-symbols:add-circle-outline-rounded",
  },
  viewIcon: { type: String, default: "ph:eye-bold" },
  verifyIcon: { type: String, default: "ic:baseline-domain-verification" },
  downloadIcon: { type: String, default: "material-symbols:download" },
  editIcon: { type: String, default: "solar-pen-bold" },
  confirmIcon: { type: String, default: "line-md:confirm" },
  cancleIcon: { type: String, default: "mdi:cancel-bold" },
  deleteIcon: { type: String, default: "solar-trash-bin-2-bold" },
  showVerify: { type: Boolean, default: false },
  showDownload: { type: Boolean, default: false },
  showView: { type: Boolean, default: false },
  showAdd: { type: Boolean, default: false },
  showEdit: { type: Boolean, default: true },
  showDelete: { type: Boolean, default: true },
  showConfirm: { type: Boolean, default: false },
  showCancle: { type: Boolean, default: false },
});

const emits = defineEmits<{
  (e: "view", record: RecordType): void;
  (e: "edit", record: RecordType): void;
  (e: "delete", record: RecordType): void;
  (e: "add", record: RecordType): void;
  (e: "confirm", record: RecordType): void;
  (e: "cancle", record: RecordType): void;
  (e: "verify", record: RecordType): void;
  (e: "download", record: RecordType): void;
}>();

const viewItem = (record: RecordType): void => {
  emits("view", record);
};
const confirmItem = (record: RecordType): void => {
  emits("confirm", record);
};
const cancleItem = (record: RecordType): void => {
  emits("cancle", record);
};

const verifyItem = (record: RecordType): void => {
  emits("verify", record);
};

const downloadItem = (record: RecordType): void => {
  emits("download", record);
};

const addItem = (record: RecordType): void => {
  emits("add", record);
};

const editItem = (record: RecordType): void => {
  emits("edit", record);
};

const deleteItem = (record: RecordType): void => {
  emits("delete", record);
};
</script>

<style scoped>
.action-group {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  gap: 8px;
  padding: 8px;
}

.action-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.icon-size {
  font-size: clamp(1rem, 1.5vw, 1.5rem);
}
</style>
