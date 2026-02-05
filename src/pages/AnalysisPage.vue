<template>
  <q-page class="q-pa-md">
    <div class="analysis-grid">
      <!-- Left Column: Detail / Input (larger responsive area) -->
      <section class="panel detail-panel">
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <div
            v-if="selectedCandidate"
            key="detail"
            class="detail-inner"
          >
            <q-btn
              flat
              icon="arrow_back"
              :label="t('common.back')"
              class="q-mb-sm"
              @click="selectedCandidate = null"
            />
            <CandidateDetail :candidate="selectedCandidate" />
          </div>

          <!-- Input View -->
          <div
            v-else
            key="input"
            class="detail-inner"
          >
            <q-card class="q-mb-md">
              <q-card-section>
                <div class="text-h6 q-mb-md">
                  {{ t("analysis.addCandidate") }}
                </div>
                <InputTabs
                  @submit-sequence="handleSequenceSubmit"
                  @submit-id="handleIdSubmit"
                />
              </q-card-section>
            </q-card>
          </div>
        </transition>
      </section>

      <!-- Right Column: List (narrower responsive area) -->
      <aside class="panel list-panel">
        <CandidateList
          class="col"
          :selected-id="selectedCandidate?.id"
          @select="onCandidateSelect"
        />
      </aside>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import InputTabs from "@/components/input/InputTabs.vue";
import CandidateList from "@/components/candidates/CandidateList.vue";
import CandidateDetail from "@/components/candidates/CandidateDetail.vue";
import { useCandidatesStore } from "@/stores/candidates";
import { useSymbolsStore } from "@/stores/symbols";
import { encodeIdToSymbolicSequence } from "@/utils/encoding";
import { useQuasar } from "quasar";

import type { Candidate } from "@/types/candidate";

const $q = useQuasar();
const { t } = useI18n();
const candidatesStore = useCandidatesStore();
const symbolsStore = useSymbolsStore();

const selectedCandidate = ref<Candidate | null>(null);

const onCandidateSelect = (candidate: Candidate) => {
  selectedCandidate.value = candidate;
};

// Sync selection: if the active candidate is removed from the store, deselect it
watch(
  () => candidatesStore.candidates,
  (newCandidates) => {
    if (selectedCandidate.value) {
      const stillExists = newCandidates.some(
        (candidate) => candidate.id === selectedCandidate.value?.id,
      );
      if (!stillExists) {
        selectedCandidate.value = null;
      }
    }
  },
  { deep: true },
);

const handleSequenceSubmit = async (symbolicSequence: string) => {
  const loadingNotification = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: t("analysis.generatingCandidates"),
    caption: t("common.pleaseWait"),
  });

  try {
    const newlyGeneratedCandidatesCount =
      await candidatesStore.generateCandidatesFromSequence(symbolicSequence);
      await candidatesStore.synchronizeCandidatesWithExternalApi();

    if (newlyGeneratedCandidatesCount > 0) {
      loadingNotification({
        icon: "done",
        spinner: false,
        message: t("analysis.candidatesGenerated"),
        caption: t("analysis.addedCount", {
          count: newlyGeneratedCandidatesCount,
        }),
        timeout: 2500,
        color: "positive",
      });
    } else {
      loadingNotification({
        icon: "warning",
        spinner: false,
        message: t("analysis.noCandidatesGenerated"),
        timeout: 2500,
        color: "warning",
      });
    }
  } catch (error) {
    console.error("Error processing sequence:", error);
    const errorMessage =
      error instanceof Error ? error.message : t("errors.unknownError");
    loadingNotification({
      icon: "error",
      spinner: false,
      message: t("errors.errorGenerating"),
      caption: errorMessage,
      timeout: 2500,
      color: "negative",
    });
  }
};

const handleIdSubmit = async (targetPersonaId: string) => {
  try {
    const generatedSequence = encodeIdToSymbolicSequence(
      targetPersonaId,
      symbolsStore.symbols,
    );
    const newCandidate = candidatesStore.createCandidateNode(
      targetPersonaId,
      generatedSequence,
      "manual",
    );
    candidatesStore.addCandidate(newCandidate);
    await candidatesStore.synchronizeCandidatesWithExternalApi();
  } catch (error) {
    console.error("Error processing ID:", error);
  }
};
</script>

<style scoped>
.analysis-grid {
  display: grid;
  grid-template-columns: minmax(360px, 1.6fr) minmax(280px, 1fr);
  gap: 1rem;
  align-items: start;
}

@media (max-width: 900px) {
  .analysis-grid {
    grid-template-columns: 1fr;
  }
}

.panel {
  max-height: calc(100vh - 120px);
  /* No overflow on parent: let inner elements handle scrolling to avoid nested scrollbars */
  min-height: 0; /* important to allow inner scroll in flex children */
  display: flex;
  flex-direction: column;
}

.detail-inner {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

/* Ensure direct children grow and handle their own scroll */
.detail-inner > * {
  flex: 1 1 auto;
  min-height: 0;
}

.list-panel {
  display: flex;
  flex-direction: column;
}

.list-panel > * {
  flex: 1 1 auto;
  min-height: 0;
}
</style>
