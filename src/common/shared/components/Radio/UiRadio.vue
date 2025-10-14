<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue';
import { Radio, RadioGroup, RadioButton } from 'ant-design-vue';

interface Option {
  label: string;
  value: string | number;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string | number;
    options?: Option[];
    disabled?: boolean;
    buttonStyle?: boolean;
  }>(),
  {
    modelValue: '',
    options: () => [],
    disabled: false,
    buttonStyle: false,
  }
);

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | number): void;
}>();

const selectedValue = computed({
  get: () => props.modelValue,
  set: (value: string | number) => {
    emit('update:modelValue', value);
  },
});
</script>

<template>
  <RadioGroup v-model:value="selectedValue" :disabled="disabled">
    <template v-if="buttonStyle">
      <RadioButton
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </RadioButton>
    </template>
    <template v-else>
      <Radio
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </Radio>
    </template>
  </RadioGroup>
</template>