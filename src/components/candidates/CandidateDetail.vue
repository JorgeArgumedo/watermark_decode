<template>
  <div ref="detailWrapper" class="candidate-detail-wrapper full-height">
    <q-card bordered flat class="candidate-detail bg-white full-height column">
      <q-card-section class="col overflow-auto">
        <div class="text-h6 q-mb-md">
          {{ t("analysis.candidateDetails") }}
        </div>

        <!-- Details List -->
        <q-list separator dense>
          <q-item>
            <q-item-section avatar>
              <q-icon name="fingerprint" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label caption>
                {{ t("common.id") }}
              </q-item-label>
              <q-item-label class="text-h6">
                {{ candidate.idPersona }}
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>
                {{ t("analysis.inputSequence") }}
              </q-item-label>
              <div class="q-py-sm">
                <HorizontalSymbols :sequence="candidate.sequence" size="lg" />
              </div>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>
                {{ t("analysis.systemStatus") }}
              </q-item-label>
              <div class="row q-mt-xs">
                <q-chip
                  dense
                  :color="statusColor"
                  text-color="white"
                  :icon="systemIcon"
                >
                  {{ t(`status.${candidate.systemStatus}`) }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>

          <q-item>
            <q-item-section>
              <q-item-label caption>
                {{ t("analysis.analysisStatus") }}
              </q-item-label>
              <div class="row q-mt-xs">
                <q-chip
                  dense
                  :color="analysisColor"
                  text-color="white"
                  :icon="analysisIcon"
                >
                  {{ t(`status.${candidate.analysisStatus}`) }}
                </q-chip>
              </div>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Actions -->
        <div class="row justify-end q-mt-lg q-gutter-sm">
          <q-btn
            color="positive"
            :label="t('actions.approve')"
            icon="thumb_up"
            :disable="candidate.analysisStatus === 'approved'"
            @click="updateStatus('approved')"
          />
          <q-btn
            color="negative"
            :label="t('actions.exclude')"
            icon="block"
            :disable="candidate.analysisStatus === 'excluded'"
            @click="updateStatus('excluded')"
          />
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import type { Candidate, AnalysisStatus } from "@/types/candidate";
import HorizontalSymbols from "@/components/symbolic/HorizontalSymbols.vue";
import { useCandidatesStore } from "@/stores/candidates";
import { useSymbolicBorderRenderer } from "@/composables/useSymbolicBorderRenderer";
import {
  SYSTEM_STATUS_OPTIONS,
  ANALYSIS_STATUS_OPTIONS,
} from "@/constants/status";

const props = defineProps<{
  candidate: Candidate;
}>();

const { t } = useI18n();
const candidatesStore = useCandidatesStore();
const { renderBorder } = useSymbolicBorderRenderer();
const detailWrapper = ref<HTMLElement | null>(null);

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

const drawBorder = () => {
  if (detailWrapper.value) {
    const el = detailWrapper.value.querySelector(".q-card") as HTMLElement;
    if (el) {
      renderBorder(el, {
        number: props.candidate.idPersona,
        sides: ["left"],
        customStyles: {
          borderWidth: 26,
          textSize: "24px",
          glyphColor: "#fff",
          borderColor: "#000",
          radius: 6,
        },
      });
    }
  }
};

onMounted(() => {
  setTimeout(drawBorder, 50);
});

watch(
  () => props.candidate.idPersona,
  () => {
    setTimeout(drawBorder, 50);
  },
);

const updateStatus = (status: AnalysisStatus) => {
  candidatesStore.updateCandidateStatus(props.candidate.id, {
    analysisStatus: status,
  });
};
</script>

<style scoped>
.candidate-detail-wrapper {
  padding-left: 5px; /* Tiny offset if needed */
}
</style>
