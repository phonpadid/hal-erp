<script setup lang="ts">
import { reactive, ref } from "vue";
import { useAuthStore } from "@/modules/presentation/Admin/stores/authentication/auth.store";
import Button from "@/common/shared/components/button/UiButton.vue";
import UiInput from "@/common/shared/components/Input/UiInput.vue";
import UiFormItem from "@/common/shared/components/Form/UiFormItem.vue";
import UiForm from "@/common/shared/components/Form/UiForm.vue";
import UiInputPassword from "@/common/shared/components/Input/UiInputPassword.vue";

const formRef = ref<InstanceType<typeof UiForm>>();
const authStore = useAuthStore();
const isLoading = ref(false);

const formState = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [
    { required: true, message: "ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້" },
    { type: "string", min: 3, message: "ຊື່ຜູ້ໃຊ້ຕ້ອງມີຢ່າງໜ້ອຍ 3 ຕົວອັກສອນ" },
  ],
  password: [
    { required: true, message: "ກະລຸນາປ້ອນລະຫັດຜ່ານ" },
    { type: "string", min: 6, message: "ລະຫັດຜ່ານຕ້ອງມີຢ່າງໜ້ອຍ 6 ຕົວອັກສອນ" },
  ],
};

const submitHandler = async () => {
  if (isLoading.value) return;

  try {
    isLoading.value = true;
    const result = await formRef.value?.submitForm();
    if (result) {
      await authStore.login(formState);
    }
  } catch (err) {
    console.error("Login failed:", err);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <section class="bg-gray-50 h-screen">
    <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
      <a href="#" class="flex flex-col items-center mb-6 text-2xl font-semibold">
        <img
          class="w-16 h-16 mr-2 mb-2 object-contain rounded-full"
          src="/src/common/shared/assets/images/logo-Hal-ERP.png"
          alt="logo"
        />
        <span>HAL ERP</span>
      </a>
      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h3 class="text-2xl font-bold mb-4">ເຂົ້າສູ່ລະບົບບັນຊີຂອງທ່ານ</h3>
          <UiForm ref="formRef" :model="formState" :rules="rules">
            <UiFormItem label="ຊື່ຜູ້ໃຊ້" name="username">
              <UiInput
                v-model="formState.username"
                placeholder="ກະລຸນາປ້ອນຊື່ຜູ້ໃຊ້"
                allowClear
                size="large"
                :disabled="isLoading"
              />
            </UiFormItem>
            <UiFormItem label="ລະຫັດຜ່ານ" name="password">
              <UiInputPassword
                v-model="formState.password"
                placeholder="********"
                size="large"
                :disabled="isLoading"
              />
            </UiFormItem>
            <UiFormItem>
              <Button
                type="primary"
                size="large"
                :loading="isLoading"
                :disabled="isLoading"
                colorClass="!bg-primary-700 hover:!bg-primary-900 text-white w-full"
                @click="submitHandler"
              >
                {{ isLoading ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ" }}
              </Button>
            </UiFormItem>
          </UiForm>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style>
