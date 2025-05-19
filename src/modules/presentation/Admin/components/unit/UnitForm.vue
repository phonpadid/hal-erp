<template>
  <div class="unit-form">
    <form @submit.prevent="onSubmit" class="space-y-4">
      <div>
        <label for="name" class="block text-sm font-medium text-gray-700"> Unit Name </label>
        <input
          id="name"
          type="text"
          v-model="form.name"
          required
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter unit name (e.g. Piece, Kilogram, Meter)"
          autofocus
        />
        <p v-if="nameError" class="mt-1 text-sm text-red-600">
          {{ nameError }}
        </p>
      </div>

      <div class="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          @click="$emit('cancel')"
          class="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading"
          class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
        >
          {{ loading ? "Saving..." : isEdit ? "Update" : "Create" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { PropType } from "vue";
import type { Unit } from "@/modules/domain/entities/unit.entities";
import type { CreateUnitDTO, UpdateUnitDTO } from "@/modules/application/dtos/unit.dto";

const props = defineProps({
  unit: {
    type: Object as PropType<Unit>,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  nameExists: {
    type: Function as PropType<(name: string) => Promise<boolean>>,
    default: async () => false,
  },
});

const emit = defineEmits<{
  (e: "submit", data: CreateUnitDTO | UpdateUnitDTO): void;
  (e: "cancel"): void;
}>();

const form = ref({
  name: "",
});

const nameError = ref("");
const isEdit = computed(() => !!props.unit);

onMounted(() => {
  if (props.unit) {
    form.value.name = props.unit.getName();
  }
});

watch(
  () => props.unit,
  (newValue) => {
    if (newValue) {
      form.value.name = newValue.getName();
    } else {
      form.value.name = "";
    }
  }
);

const validateName = async () => {
  // ตรวจสอบว่าชื่อไม่ว่างเปล่า
  if (!form.value.name.trim()) {
    nameError.value = "Unit name is required";
    return false;
  }

  // ตรวจสอบว่าชื่อยาวเกินไปหรือไม่
  if (form.value.name.trim().length > 50) {
    nameError.value = "Unit name must be less than 50 characters";
    return false;
  }

  // ตรวจสอบว่าชื่อซ้ำหรือไม่ (เฉพาะกรณีสร้างใหม่หรือชื่อเปลี่ยน)
  if (!isEdit.value || (props.unit && form.value.name !== props.unit.getName())) {
    const exists = await props.nameExists(form.value.name);
    if (exists) {
      nameError.value = `Unit name '${form.value.name}' already exists`;
      return false;
    }
  }

  nameError.value = "";
  return true;
};

const onSubmit = async () => {
  if (await validateName()) {
    emit("submit", { name: form.value.name.trim() });
  }
};
</script>
