<template>
  <div class="container mx-auto px-4 py-8 max-w-lg">
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <button @click="router.back()" class="mr-4 text-gray-500 hover:text-gray-700">
          <svg
            class="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            ></path>
          </svg>
        </button>
        <h1 class="text-2xl font-bold text-gray-900">Edit Unit</h1>
      </div>
      <p class="text-gray-600">Update measurement unit details</p>
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <div class="spinner"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">An error occurred</h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error.message || "Could not find the unit to edit." }}
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="!currentUnit" class="bg-yellow-50 p-4 rounded-md">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            ></path>
          </svg>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-yellow-800">Unit not found</h3>
          <div class="mt-2 text-sm text-yellow-700">
            The unit you're trying to edit could not be found.
          </div>
        </div>
      </div>
    </div>

    <div v-else class="bg-white shadow rounded-lg p-6">
      <UnitForm
        :unit="currentUnit"
        :loading="updateLoading"
        :nameExists="checkUnitNameExists"
        @submit="handleSubmit"
        @cancel="handleCancel"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUnits } from "@/modules/presentation/Admin/composables/useUnit";
import UnitForm from "../../components/unit/UnitForm.vue";
import type { UpdateUnitDTO } from "@/modules/application/dtos/UnitDTO";
import type { Unit } from "@/modules/domain/entities/Unit";

const router = useRouter();
const route = useRoute();
const { fetchUnitById, updateUnit, fetchUnits, loading, error } = useUnits();
const currentUnit = ref<Unit | null>(null);
const updateLoading = ref(false);
const id = route.params.id as string;

// โหลดข้อมูล Unit ที่ต้องการแก้ไข
onMounted(async () => {
  currentUnit.value = await fetchUnitById(id);
});

// ฟังก์ชันตรวจสอบว่ามีชื่อหน่วยนี้แล้วหรือไม่
const checkUnitNameExists = async (name: string): Promise<boolean> => {
  // ไม่ตรวจสอบถ้าชื่อเหมือนเดิม
  if (currentUnit.value && name === currentUnit.value.getName()) {
    return false;
  }

  const unit = await fetchUnits(name);
  return !!unit;
};

// ฟังก์ชันสำหรับการบันทึกข้อมูล
const handleSubmit = async (data: UpdateUnitDTO) => {
  try {
    updateLoading.value = true;
    await updateUnit(id, data);
    router.push({ name: "UnitList" });
  } catch (err) {
    console.error("Failed to update unit:", err);
  } finally {
    updateLoading.value = false;
  }
};

// ฟังก์ชันสำหรับการยกเลิก
const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
