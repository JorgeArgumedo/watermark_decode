<template>
  <div class="candidate-list column full-height">
    <!-- Toolbar -->
    <div class="col-auto row items-center justify-between q-mb-md">
      <div class="text-h6">
        {{ t("analysis.candidateList") }} ({{ count }})
      </div>
      <div class="row q-gutter-sm">
        <q-btn
          v-if="count > 0"
          outline
          dense
          color="primary"
          class="q-px-sm"
          icon="delete_sweep"
          :label="t('analysis.clearAll')"
          @click="candidatesStore.clearAll()"
        />
      </div>
    </div>

    <!-- Virtual List -->
    <div
      v-if="count > 0"
      class="col relative-position"
    >
      <q-virtual-scroll
        v-slot="{ item }"
        class="absolute-full"
        :items="candidates"
      >
        <CandidateItem
          :key="item.id"
          :candidate="item"
          :selected="selectedId === item.id"
          class="q-mb-sm q-mr-sm"
          @delete="candidatesStore.removeCandidate"
          @select="$emit('select', $event)"
        />
      </q-virtual-scroll>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="col text-center q-pa-xl text-grey-5 border-dashed rounded-borders row flex-center"
    >
      <div>
        <q-icon
          name="playlist_remove"
          size="4rem"
        />
        <div class="text-h6 q-mt-md">
          {{ t("analysis.noCandidates") }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useCandidatesStore } from "@/stores/candidates";
import CandidateItem from "./CandidateItem.vue";
import type { Candidate } from "@/types/candidate";

defineProps<{
  selectedId?: string | null;
}>();

defineEmits<{
  (event: "select", candidate: Candidate): void;
}>();

const { t } = useI18n();
const candidatesStore = useCandidatesStore();

const candidates = computed(() => candidatesStore.candidates);
const count = computed(() => candidatesStore.totalCount);
</script>

<style scoped>
.border-dashed {
  border: 2px dashed #e0e0e0;
}
</style>
