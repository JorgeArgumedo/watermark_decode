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
          :selected-id="selectedCandidate?.id"
          @select="onCandidateSelect"
          class="col"
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
import { expandWildcards } from "@/utils/wildcard";
import { symbolsToInt } from "@/utils/decoding";
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

const createCandidate = (
  idPersona: string,
  sequence: string,
  source: "manual" | "expanded",
): Candidate => ({
  id: idPersona, // Use idPersona as unique ID
  idPersona,
  sequence,
  systemStatus: "pending",
  analysisStatus: "unreviewed",
  source,
  createdAt: new Date(),
});

const handleSequenceSubmit = async (sequence: string) => {
  const loading = $q.notify({
    group: false, // required to be updatable
    timeout: 0, // we want to be in control when it gets dismissed
    spinner: true,
    message: "Generating candidates...",
    caption: "Please wait",
  });

  try {
    console.log(`Starting generation for sequence: "${sequence}"`);

    // Artificial delay to allow UI to update if synchronous blocking occurs
    await new Promise((resolve) => setTimeout(resolve, 50));

    const expanded = expandWildcards(sequence, symbolsStore.symbols);
    console.log(`Expanded to ${expanded.length} sequences`);

    const candidates: Candidate[] = [];

    expanded.forEach((seq) => {
      const decodeResult = symbolsToInt(seq, symbolsStore.symbolMap);
      if (decodeResult.ok && decodeResult.value !== undefined) {
        candidates.push(
          createCandidate(
            String(decodeResult.value),
            seq,
            expanded.length > 1 ? "expanded" : "manual",
          ),
        );
      } else {
        console.warn(`Failed to decode sequence ${seq}:`, decodeResult.error);
      }
    });
    console.log(candidates);
    console.log(`Generated ${candidates.length} candidates`);

    if (candidates.length > 0) {
      candidatesStore.addCandidates(candidates);
      loading({
        icon: "done",
        spinner: false,
        message: "Candidates generated!",
        caption: `Added ${candidates.length} candidates`,
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
  } catch (e: any) {
    console.error("Error processing sequence:", e);
    loading({
      icon: "error",
      spinner: false,
      message: "Error generating candidates",
      caption: e.message || "Unknown error",
      timeout: 2500,
      color: "negative",
    });
  }
};

const handleIdSubmit = (idPersona: string) => {
  try {
    const sequence = intToSymbolSeq(idPersona, symbolsStore.symbols);
    const candidate = createCandidate(idPersona, sequence, "manual");
    candidatesStore.addCandidate(candidate);
  } catch (e) {
    console.error("Error processing ID:", e);
  }
};
</script>
