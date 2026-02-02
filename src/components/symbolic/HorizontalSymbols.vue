<template>
  <div class="horizontal-symbols q-pa-sm rounded-borders bg-grey-2">
    <div class="row items-center no-wrap overflow-auto">
      <div
        v-for="(symbol, index) in sequenceArray"
        :key="index"
        class="symbol-char text-h5 q-px-xs"
        :class="{
          'text-primary': !isWildcard(symbol),
          'text-warning': isWildcard(symbol),
        }"
      >
        {{ symbol }}
      </div>
    </div>
    <q-tooltip>{{ t("analysis.inputSequence") }}</q-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { intToSymbolSeq } from "@/utils/encoding";

const { t } = useI18n();

interface Props {
  idPersona?: string;
  sequence?: string;
}

const props = defineProps<Props>();

const sequence = computed(() => {
  if (props.sequence) return props.sequence;
  if (props.idPersona) {
    try {
      return intToSymbolSeq(props.idPersona);
    } catch (e) {
      return "?";
    }
  }
  return "";
});

const sequenceArray = computed(() => Array.from(sequence.value));

const isWildcard = (symbol: string) => symbol === "?";
</script>

<style scoped>
.symbol-char {
  font-family:
    "Segoe UI Symbol", "Noto Sans Symbols", "DejaVu Sans", "Symbola", monospace;
  font-variant-emoji: text;
}
</style>
