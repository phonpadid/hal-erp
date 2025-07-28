<script setup lang="ts">
import { defineProps, defineEmits, watch, computed } from "vue";

type OptionType = { label: string; value: string | number; group?: string };

const props = defineProps<{
  options: OptionType[];
  groupBy?: string;
  modelValue?: (string | number)[];
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: (string | number)[]): void;
}>();

const selectedValues = computed({
  get: () => props.modelValue || [],
  set: (value) => emit("update:modelValue", value),
});

watch(
  () => props.modelValue,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  (newValue) => {
    // console.log("CheckboxGroup received modelValue:", newValue);
  },
  { immediate: true, deep: true }
);

const groupedOptions = computed(() => {
  if (!props.groupBy) return { "": props.options };

  const groups: Record<string, OptionType[]> = {};
  props.options.forEach((option) => {
    const groupName = option.group || "";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(option);
  });
  return groups;
});

const checkAllState = computed(() => {
  const result: Record<string, { indeterminate: boolean; checked: boolean }> = {};

  Object.keys(groupedOptions.value).forEach((groupName) => {
    const options = groupedOptions.value[groupName];
    const optionValues = options.map((option) => option.value);
    const selectedCount = optionValues.filter((value) => isSelected(value)).length;

    result[groupName] = {
      indeterminate: selectedCount > 0 && selectedCount < optionValues.length,
      checked: selectedCount === optionValues.length && optionValues.length > 0,
    };
  });

  const allValues = props.options.map((option) => option.value);
  const allSelectedCount = allValues.filter((value) => isSelected(value)).length;

  result["all"] = {
    indeterminate: allSelectedCount > 0 && allSelectedCount < allValues.length,
    checked: allSelectedCount === allValues.length && allValues.length > 0,
  };

  return result;
});

const isSelected = (value: string | number): boolean => {
  return (props.modelValue || []).some((v) => {
    return String(v) === String(value);
  });
};

const toggleOption = (value: string | number) => {
  const currentValues = [...(props.modelValue || [])];

  const index = currentValues.findIndex((v) => String(v) === String(value));

  if (index === -1) {
    currentValues.push(value);
  } else {
    currentValues.splice(index, 1);
  }

  console.log("After toggle, values:", currentValues);
  emit("update:modelValue", currentValues);
};

const toggleCheckAll = (groupName: string, checked: boolean) => {
  let valuesToToggle: (string | number)[] = [];

  if (groupName === "all") {
    valuesToToggle = props.options.map((option) => option.value);
  } else {
    valuesToToggle = groupedOptions.value[groupName].map((option) => option.value);
  }

  let newValues: (string | number)[];

  if (checked) {
    const currentValues = new Set(props.modelValue || []);
    valuesToToggle.forEach((value) => currentValues.add(value));
    newValues = Array.from(currentValues);
  } else {
    const valuesToRemove = new Set(valuesToToggle.map(String));
    newValues = (props.modelValue || []).filter((value) => !valuesToRemove.has(String(value)));
  }

  emit("update:modelValue", newValues);
};
</script>

<template>
  <!-- For non-grouped options -->
  <div v-if="!props.groupBy">
    <div class="mb-2">
      <a-checkbox
        :checked="checkAllState['all'].checked"
        :indeterminate="checkAllState['all'].indeterminate"
        @change="(e:any) => toggleCheckAll('all', e.target.checked)"
      >
        ເລືອກທັງໝົດ
      </a-checkbox>
    </div>
    <a-divider />
    <a-checkbox-group :options="props.options" v-model="selectedValues" />
  </div>

  <!-- For grouped options -->
  <!-- <div v-else class="flex flex-wrap gap-3"> -->
    <div v-else>
    <!-- "Check All" for all groups -->
    <div class="w-full mb-2 font-bold">
      <a-checkbox
        :checked="checkAllState['all'].checked"
        :indeterminate="checkAllState['all'].indeterminate"
        @change="(e:any) => toggleCheckAll('all', e.target.checked)"
      >
        ເລືອກທັງໝົດ
      </a-checkbox>
      <a-divider />
    </div>

    <div v-for="(options, groupName) in groupedOptions" :key="groupName" class="w-100">
      <div class="mb-1 font-bold">
        <a-checkbox
          :checked="checkAllState[groupName].checked"
          :indeterminate="checkAllState[groupName].indeterminate"
          @change="(e:any) => toggleCheckAll(groupName, e.target.checked)"
        >
          {{ groupName }}
        </a-checkbox>
      </div>

      <div class="grid grid-cols-4 gap-2">
        <p
          v-for="option in options"
          :key="option.value"
          class="px-6"
        >
          <a-checkbox
            :value="option.value"
            :checked="isSelected(option.value)"
            @change="() => toggleOption(option.value)"
          >
            {{ option.label }}
          </a-checkbox>
        </p>
      </div>
      <a-divider class="mt-[-10px]" />
    </div>
  </div>
</template>
