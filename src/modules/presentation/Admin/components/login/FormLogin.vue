<!-- <script setup lang="ts">
import { reactive, ref } from "vue";
import Button from "@/";
import UiInput from "@/components/Input/UiInput.vue";
import UiFormItem from "@/components/Form/UiFormItem.vue";
import UiForm from "@/components/Form/UiForm.vue";
import UiInputPassword from "@/components/Input/UiInputPassword.vue";
import { useAuthStore } from "../store/auth.store";

const formRef = ref<InstanceType<typeof UiForm>>();
const { login } = useAuthStore();

const formState = reactive({
  email: "",
  password: "",
  // email: "dev@gmail.com",
  // password: "DevAdm1n@2024",
});

const rules = {
  email: [{ required: true, message: "ກະລຸນາປ້ອນອີເມວ" }],
  password: [{ required: true, message: "ກະລຸນາປ້ອນລະຫັດຜ່ານ" }],
};

const submitHandler = async () => {
  const result = await formRef.value?.submitForm();
  if (result) {
    await login(formState);
  }
};
</script>

<template>
  <section class="bg-gray-50 h-screen">
    <div
      class="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0"
    >
      <a
        href="#"
        class="flex flex-col items-center mb-6 text-2xl font-semibold"
      >
        <img
          class="w-16 h-16 mr-2 mb-2 object-contain"
          src="/public/logo.webp"
          alt="logo"
        />
        <span>ກົມກວດຄົນເຂົ້າເມືອງ ແຫ່ງ ສປປ ລາວ</span>
      </a>
      <div class="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
        <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
          <h3 class="text-2xl font-bold mb-4">ເຂົ້າສູ່ລະບົບບັນຊີຂອງທ່ານ</h3>
          <UiForm ref="formRef" :model="formState" :rules="rules">
            <UiFormItem label="ອີເມວຂອງທ່ານ" name="email">
              <UiInput
                v-model="formState.email"
                placeholder="name@company.com"
                allowClear
                size="large"
              />
            </UiFormItem>
            <UiFormItem label="ລະຫັດຜ່ານ" name="password">
              <UiInputPassword
                v-model="formState.password"
                placeholder="********"
                size="large"
              />
            </UiFormItem>
            <UiFormItem>
              <Button
                type="primary"
                size="large"
                colorClass="!bg-primary-700 hover:!bg-primary-900 text-white w-full"
                @click="submitHandler"
              >
                ເຂົ້າສູ່ລະບົບ
              </Button>
            </UiFormItem>
          </UiForm>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped></style> -->
