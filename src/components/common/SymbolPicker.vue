<template>
  <div class="symbol-picker q-pa-sm">
    <div class="row q-col-gutter-xs">
      <div class="col-12 q-mb-sm text-caption text-grey">
        {{ t("help.symbolSet") }}
      </div>
      <div v-for="symbol in symbols" :key="symbol" class="col-auto">
        <q-btn
          outline
          dense
          color="primary"
          class="symbol-btn"
          @click="$emit('select', symbol)"
        >
          {{ symbol }}
        </q-btn>
      </div>
      <div class="col-auto">
        <q-btn
          outline
          dense
          color="warning"
          class="symbol-btn text-bold"
          @click="$emit('select', '?')"
        >
          ?
        </q-btn>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { useSymbolsStore } from "@/stores/symbols";
import { computed } from "vue";

const { t } = useI18n();
const symbolsStore = useSymbolsStore();

const symbols = computed(() => symbolsStore.symbols);

defineEmits<{
  (e: "select", symbol: string): void;
}>();
</script>

<style scoped>
.symbol-btn {
  font-family:
    "Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace;
  font-size: 1.2rem;
  width: 40px;
  height: 40px;
}
</style>
