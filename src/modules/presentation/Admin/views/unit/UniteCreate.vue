<template>
  <div class="container mx-auto px-4 py-8">
    <div class="mb-8">
      <div class="flex items-center mb-4">
        <UiButton icon="ant-design:arrow-left-outlined" @click="router.back()" class="mr-4">
          Back
        </UiButton>
        <h1 class="text-2xl font-bold">{{ isEdit ? "Edit Unit" : "Create New Unit" }}</h1>
      </div>
    </div>

    <div class="bg-white p-6 rounded-lg shadow mb-8">
      <a-spin :spinning="loading">
        <UiForm ref="formRef" :model="formState" :rules="formRules" layout="vertical">
          <a-form-item label="Unit Name" name="name">
            <a-input
              v-model:value="formState.name"
              placeholder="Enter unit name (e.g. Piece, Kilogram)"
              :maxLength="50"
              show-count
            />
          </a-form-item>

          <div class="flex justify-end space-x-3 mt-6">
            <UiButton @click="router.back()"> Cancel </UiButton>
            <UiButton type="primary" :loading="submitLoading" @click="handleSubmit">
              {{ isEdit ? "Update" : "Create" }}
            </UiButton>
          </div>
        </UiForm>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import UiForm from "@/common/presentation/components/Form/UiForm.vue";
import UiButton from "@/common/presentation/components/button/UiButton.vue";
import { useUnits } from "../../composables/useUnit";
import type { FormInstance } from "ant-design-vue";
import type { Unit } from "@/modules/domain/entities/Unit";

const router = useRouter();
const route = useRoute();
const { createUnit, fetchUnitById, updateUnit, searchUnitsByName, loading } = useUnits();

// Form refs and state
const formRef = ref<FormInstance>();
const submitLoading = ref(false);
const formState = reactive({
  name: "",
});

// Check if this is edit mode
const isEdit = computed(() => route.params.id !== undefined);

// Form validation rules
const formRules = {
  name: [
    { required: true, message: "Please enter unit name", trigger: "blur" },
    { min: 1, max: 50, message: "Name must be between 1 and 50 characters", trigger: "blur" },
    {
      validator: async (_rule: any, value: string) => {
        if (!value) return Promise.resolve();

        // Skip validation if we're editing and the name hasn't changed
        if (isEdit.value && originalUnit.value?.getName() === value) {
          return Promise.resolve();
        }

        const units = await searchUnitsByName(value);
        if (units && units.length > 0) {
          return Promise.reject(`Unit name '${value}' already exists`);
        }

        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
};

// For edit mode - track original unit
const originalUnit = ref<Unit | null>(null);

// Load unit data if in edit mode
onMounted(async () => {
  const id = route.params.id as string;

  if (isEdit.value && id) {
    try {
      const unit = await fetchUnitById(id);
      if (unit) {
        originalUnit.value = unit;
        formState.name = unit.getName();
      } else {
        message.error("Unit not found");
        router.push("/units");
      }
    } catch (err) {
      console.error("Failed to fetch unit:", err);
      message.error("Failed to fetch unit details");
      router.push("/units");
    }
  }
});

// Form submission handler
const handleSubmit = async () => {
  try {
    // Validate form
    await formRef.value?.validate();

    submitLoading.value = true;

    if (isEdit.value) {
      // Update existing unit
      const id = route.params.id as string;
      await updateUnit(id, { name: formState.name });
      message.success("Unit updated successfully");
    } else {
      // Create new unit
      await createUnit({ name: formState.name });
      message.success("Unit created successfully");
    }

    // Redirect back to unit list
    router.push("/units");
  } catch (err) {
    console.error("Form validation or submission error:", err);
    if (err instanceof Error) {
      message.error(err.message || "Failed to save unit");
    }
  } finally {
    submitLoading.value = false;
  }
};
</script>
