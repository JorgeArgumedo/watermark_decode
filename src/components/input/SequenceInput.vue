<template>
  <div class="sequence-input">
    <q-input
      ref="inputRef"
      v-model="model"
      outlined
      :label="t('analysis.inputSequence')"
      :error="!!error"
      :error-message="error"
      class="q-mb-sm"
    >
      <template #append>
        <q-btn
          round
          dense
          flat
          icon="grid_view"
          @click="showPicker = !showPicker"
        >
          <q-tooltip>{{ t("actions.showPicker") }}</q-tooltip>
        </q-btn>
      </template>
    </q-input>

    <q-slide-transition>
      <div
        v-if="showPicker"
        class="q-mb-md border-radius-inherit bg-grey-1"
      >
        <SymbolPicker @select="onSymbolSelect" />
      </div>
    </q-slide-transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useI18n } from "vue-i18n";
import SymbolPicker from "@/components/common/SymbolPicker.vue";
import { validateSymbolicSequence } from "@domain/utils/validation";
import { useSymbolsStore } from "@/stores/symbols";

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
  (event: "valid", isValid: boolean): void;
}>();

const { t } = useI18n();
const symbolsStore = useSymbolsStore();

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const showPicker = ref(false);
const error = ref("");

const onSymbolSelect = (symbol: string) => {
  model.value += symbol;
};

watch(
  model,
  (newVal) => {
    if (!newVal) {
      error.value = "";
      emit("valid", false);
      return;
    }

    const validation = validateSymbolicSequence(newVal, symbolsStore.symbols);
    if (!validation.valid) {
      error.value = validation.error
        ? t(validation.error)
        : t("errors.invalidSequence");
      emit("valid", false);
    } else {
      error.value = "";
      emit("valid", true);
    }
  },
  { immediate: true },
);
</script>
