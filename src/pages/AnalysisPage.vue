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
              :label="t('common.back')"
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
