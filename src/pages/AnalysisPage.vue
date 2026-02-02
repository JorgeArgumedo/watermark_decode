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
          <div v-if="selectedCandidate" key="detail">
            <q-btn
              flat
              icon="arrow_back"
              label="Volver"
              class="q-mb-sm"
              @click="selectedCandidate = null"
            />
            <CandidateDetail :candidate="selectedCandidate" />
          </div>

          <!-- Input View -->
          <div v-else key="input">
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
import { intToSymbolSeq } from "@/utils/encoding";
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

// Simplified logic adhering to SRP: Logic delegated to store
const createCandidate = candidatesStore.createCandidate; // Expose for handleIdSubmit if needed, or better, move handleIdSubmit logic to store too?
// Actually handleIdSubmit logic is simple enough but let's keep consistency.
// But wait, createCandidate is now exposed from store.

const handleSequenceSubmit = async (sequence: string) => {
  const loading = $q.notify({
    group: false,
    timeout: 0,
    spinner: true,
    message: "Generating candidates...",
    caption: "Please wait",
  });

  try {
    const count =
      await candidatesStore.generateCandidatesFromSequence(sequence);

    if (count > 0) {
      loading({
        icon: "done",
        spinner: false,
        message: "Candidates generated!",
        caption: `Added ${count} candidates`,
        timeout: 2500,
        color: "positive",
      });
    } else {
      loading({
        icon: "warning",
        spinner: false,
        message: "No candidates generated",
        timeout: 2500,
        color: "warning",
      });
    }
  } catch (error: any) {
    console.error("Error processing sequence:", error);
    loading({
      icon: "error",
      spinner: false,
      message: "Error generating candidates",
      caption: error.message || "Unknown error",
      timeout: 2500,
      color: "negative",
    });
  }
};

const handleIdSubmit = (idPersona: string) => {
  try {
    const sequence = intToSymbolSeq(idPersona, symbolsStore.symbols);
    const candidate = candidatesStore.createCandidate(
      idPersona,
      sequence,
      "manual",
    );
    candidatesStore.addCandidate(candidate);
  } catch (error) {
    console.error("Error processing ID:", error);
  }
};
</script>
