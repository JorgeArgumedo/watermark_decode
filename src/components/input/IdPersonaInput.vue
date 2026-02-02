<template>
  <div class="id-persona-input">
    <q-input
      v-model="model"
      outlined
      :label="t('analysis.inputId')"
      type="number"
      :error="!!error"
      :error-message="error"
      class="q-mb-sm"
      hint="Numeric ID only"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import { validateIdPersona } from "@/utils/validation";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "valid", isValid: boolean): void;
}>();

const { t } = useI18n();
const error = ref("");

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

watch(model, (newVal) => {
  if (!newVal) {
    error.value = "";
    emit("valid", false);
    return;
  }

  const validation = validateIdPersona(newVal);
  if (!validation.valid) {
    error.value = validation.error || "Invalid ID";
    emit("valid", false);
  } else {
    error.value = "";
    emit("valid", true);
  }
});
</script>
