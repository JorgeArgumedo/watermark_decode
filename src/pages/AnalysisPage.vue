<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-lg justify-center main-row">
      <!-- Left Column: Input or Details -->
      <div class="col-12 col-md-5 col-lg-4 scroll-y-if-needed">
        <!-- Candidate Detail View -->
        <transition
          appear
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
          mode="out-in"
        >
          <div
            v-if="selectedCandidate"
            key="detail"
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
      </div>

      <!-- Right Column: List -->
      <div
        class="col-12 col-md-7 col-lg-8 column"
        style="height: calc(100vh - 100px)"
      >
        <CandidateList
          class="col"
          :selected-id="selectedCandidate?.id"
          @select="onCandidateSelect"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useI18n } from "vue-i18n";
import InputTabs from "@/components/input/InputTabs.vue";
import CandidateList from "@/components/candidates/CandidateList.vue";
import CandidateDetail from "@/components/candidates/CandidateDetail.vue";
import { useCandidatesStore } from "@/stores/candidates";
import { useSymbolsStore } from "@/stores/symbols";
import { encodeIdToSymbolicSequence } from "@domain/utils/encoding";
import { useGenerateCandidates } from "@presentation/composables/useGenerateCandidates";
import { useSelectionSync } from "@presentation/composables/useSelectionSync";
import { useQuasar } from "quasar";

import type { Candidate } from "@shared/types/candidate";

const $q = useQuasar();
const { t } = useI18n();
const candidatesStore = useCandidatesStore();
const symbolsStore = useSymbolsStore();

const selectedCandidate = ref<Candidate | null>(null);

const onCandidateSelect = (candidate: Candidate) => {
  selectedCandidate.value = candidate;
};

// Sync selection using a composable to keep presentation logic small
useSelectionSync(selectedCandidate, candidatesStore.candidates);

// Use the generate helper composable which centralizes notification UX
const { generate } = useGenerateCandidates();
const handleSequenceSubmit = async (symbolicSequence: string) => {
  await generate(symbolicSequence);
};

const handleIdSubmit = (targetPersonaId: string) => {
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
  } catch (error) {
    console.error("Error processing ID:", error);
  }
};
</script>
