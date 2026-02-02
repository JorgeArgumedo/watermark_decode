<template>
  <q-card
    v-ripple
    bordered
    flat
    class="candidate-item q-mb-sm cursor-pointer transition-generic"
    :class="{ 'bg-blue-1 border-primary': selected }"
    @click="$emit('select', candidate)"
  >
    <q-card-section>
      <div class="row items-center q-col-gutter-md no-wrap">
        <!-- Visual Identifier (Icon instead of full border) -->
        <div class="col-auto">
          <q-avatar
            color="primary"
            text-color="white"
            font-size="20px"
            icon="fingerprint"
          />
        </div>

        <!-- Information -->
        <div class="col">
          <div class="column justify-center full-height">
            <div class="text-caption text-grey">
              {{ t("common.id") }}: {{ candidate.idPersona }}
            </div>
            <HorizontalSymbols :sequence="candidate.sequence" />

            <div class="row q-mt-sm q-gutter-x-sm wrap">
              <q-chip
                dense
                :color="statusColor"
                text-color="white"
                :icon="systemIcon"
                size="sm"
              >
                {{ t(`status.${candidate.systemStatus}`) }}
              </q-chip>

              <q-chip
                dense
                :color="analysisColor"
                text-color="white"
                :icon="analysisIcon"
                size="sm"
              >
                {{ t(`status.${candidate.analysisStatus}`) }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="col-auto">
          <q-btn
            round
            dense
            flat
            color="grey"
            icon="delete"
            @click.stop="$emit('delete', candidate.id)"
          >
            <q-tooltip>{{ t("actions.deleteTooltip") }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Candidate } from "@/types/candidate";
import HorizontalSymbols from "@/components/symbolic/HorizontalSymbols.vue";
import {
  SYSTEM_STATUS_OPTIONS,
  ANALYSIS_STATUS_OPTIONS,
} from "@/constants/status";

const props = defineProps<{
  candidate: Candidate;
  selected?: boolean;
}>();

defineEmits<{
  (event: "delete", id: string): void;
  (event: "select", candidate: Candidate): void;
}>();

const { t } = useI18n();

const systemStatusInfo = computed(() => {
  return (
    SYSTEM_STATUS_OPTIONS.find(
      (statusOption) => statusOption.value === props.candidate.systemStatus,
    ) || {
      icon: "help",
      color: "grey",
    }
  );
});

const analysisStatusInfo = computed(() => {
  return (
    ANALYSIS_STATUS_OPTIONS.find(
      (statusOption) => statusOption.value === props.candidate.analysisStatus,
    ) || {
      icon: "help",
      color: "info",
    }
  );
});

const systemIcon = computed(() => systemStatusInfo.value.icon);
const statusColor = computed(() => systemStatusInfo.value.color);

const analysisIcon = computed(() => analysisStatusInfo.value.icon);
const analysisColor = computed(() => analysisStatusInfo.value.color);
</script>

<style scoped>
@media (max-width: 599px) {
  .symbolic-preview-container {
    width: 60px;
  }
}
</style>
