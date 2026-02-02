<template>
  <q-card bordered flat class="candidate-detail bg-white">
    <q-card-section>
      <div class="text-h6 q-mb-md">{{ t("analysis.candidateDetails") }}</div>

      <!-- Large Symbolic Border View -->
      <div
        class="symbolic-view-container q-mb-md rounded-borders bg-grey-1 shadow-1"
      >
        <SymbolicBorder
          :id-persona="candidate.idPersona"
          :sides="['top', 'right', 'bottom', 'left']"
          :border-width="30"
          text-size="18px"
          class="full-width full-height"
        />
        <div
          class="absolute-center text-h3 text-weight-bold text-grey-4 non-selectable"
          style="z-index: 0"
        >
          {{ candidate.idPersona }}
        </div>
      </div>

      <!-- Details List -->
      <q-list separator dense>
        <q-item>
          <q-item-section>
            <q-item-label caption>ID</q-item-label>
            <q-item-label class="text-h6">{{
              candidate.idPersona
            }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{
              t("analysis.inputSequence")
            }}</q-item-label>
            <div class="q-py-sm">
              <HorizontalSymbols :sequence="candidate.sequence" size="lg" />
            </div>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{
              t("analysis.systemStatus")
            }}</q-item-label>
            <div class="row q-mt-xs">
              <q-chip dense :color="statusColor" text-color="white" icon="dns">
                {{ t(`status.${candidate.systemStatus}`) }}
              </q-chip>
            </div>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label caption>{{
              t("analysis.analysisStatus")
            }}</q-item-label>
            <div class="row q-mt-xs">
              <q-chip
                dense
                :color="analysisColor"
                text-color="white"
                icon="rate_review"
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
          icon="check"
          @click="updateStatus('approved')"
          :disable="candidate.analysisStatus === 'approved'"
        />
        <q-btn
          color="negative"
          :label="t('actions.exclude')"
          icon="block"
          @click="updateStatus('excluded')"
          :disable="candidate.analysisStatus === 'excluded'"
        />
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Candidate, AnalysisStatus } from "@/types/candidate";
import SymbolicBorder from "@/components/symbolic/SymbolicBorder.vue";
import HorizontalSymbols from "@/components/symbolic/HorizontalSymbols.vue";
import { useCandidatesStore } from "@/stores/candidates";

const props = defineProps<{
  candidate: Candidate;
}>();

const { t } = useI18n();
const candidatesStore = useCandidatesStore();

const statusColor = computed(() => {
  switch (props.candidate.systemStatus) {
    case "found":
      return "positive";
    case "not_found":
      return "warning";
    case "error":
      return "negative";
    default:
      return "grey";
  }
});

const analysisColor = computed(() => {
  switch (props.candidate.analysisStatus) {
    case "approved":
      return "positive";
    case "excluded":
      return "negative";
    default:
      return "info";
  }
});

const updateStatus = (status: AnalysisStatus) => {
  candidatesStore.updateCandidateStatus(props.candidate.id, {
    analysisStatus: status,
  });
};
</script>

<style scoped>
.symbolic-view-container {
  height: 300px;
  position: relative;
  overflow: hidden;
}
</style>
