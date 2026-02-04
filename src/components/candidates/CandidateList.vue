<template>
  <div class="candidate-list">
    <!-- Toolbar -->
    <header class="toolbar q-mb-md">
      <div class="toolbar-row">
        <div class="title text-h6">
          {{ t("analysis.candidateList") }} ({{ filteredCandidatesCount }} / {{ totalCandidatesCount }})
        </div>
        <div class="toolbar-actions">
          <q-btn-dropdown
            v-if="totalCandidatesCount > 0"
            outline
            dense
            color="primary"
            class="q-px-sm"
            icon="delete_sweep"
            :label="t('analysis.clear')"
          >
            <q-list dense>
              <q-item
                v-close-popup
                clickable
                @click="confirmClearAll"
              >
                <q-item-section avatar>
                  <q-icon
                    name="delete_forever"
                    color="negative"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-negative">
                    {{ t("analysis.clearAll") }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />
              <q-item-label header>
                {{ t("analysis.bySystemStatus") }}
              </q-item-label>

              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesBySystemStatus('pending')
                "
              >
                <q-item-section avatar>
                  <q-icon name="hourglass_empty" />
                </q-item-section>
                <q-item-section>{{ t("status.pending") }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesBySystemStatus('found')
                "
              >
                <q-item-section avatar>
                  <q-icon
                    name="check_circle"
                    color="positive"
                  />
                </q-item-section>
                <q-item-section>{{ t("status.found") }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesBySystemStatus('not_found')
                "
              >
                <q-item-section avatar>
                  <q-icon
                    name="warning"
                    color="warning"
                  />
                </q-item-section>
                <q-item-section>{{ t("status.not_found") }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesBySystemStatus('error')
                "
              >
                <q-item-section avatar>
                  <q-icon
                    name="error"
                    color="negative"
                  />
                </q-item-section>
                <q-item-section>{{ t("status.error") }}</q-item-section>
              </q-item>

              <q-separator />
              <q-item-label header>
                {{ t("analysis.byAnalysisStatus") }}
              </q-item-label>

              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesByAnalysisStatus(
                    'unreviewed',
                  )
                "
              >
                <q-item-section avatar>
                  <q-icon name="help_outline" />
                </q-item-section>
                <q-item-section>{{ t("status.unreviewed") }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesByAnalysisStatus(
                    'approved',
                  )
                "
              >
                <q-item-section avatar>
                  <q-icon
                    name="thumb_up"
                    color="positive"
                  />
                </q-item-section>
                <q-item-section>{{ t("status.approved") }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                @click="
                  candidatesStore.removeAllCandidatesByAnalysisStatus(
                    'excluded',
                  )
                "
              >
                <q-item-section avatar>
                  <q-icon
                    name="block"
                    color="negative"
                  />
                </q-item-section>
                <q-item-section>{{ t("status.excluded") }}</q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="totalCandidatesCount > 0" class="filters">
        <div class="filter-group">
          <q-btn-group outline spread class="filter-buttons">
            <q-btn
              v-for="status in SYSTEM_STATUS_OPTIONS"
              :key="status.value"
              :outline="!systemFilters.includes(status.value)"
              :color="systemFilters.includes(status.value) ? status.color : 'grey'"
              dense
              :icon="status.icon"
              class="q-px-sm"
              @click="toggleSystemFilter(status.value)"
            >
              <q-tooltip>{{ t(`status.${status.value}`) }}</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>

        <div class="filter-group">
          <q-btn-group outline spread class="filter-buttons">
            <q-btn
              v-for="status in ANALYSIS_STATUS_OPTIONS"
              :key="status.value"
              :outline="!analysisFilters.includes(status.value)"
              :color="analysisFilters.includes(status.value) ? status.color : 'grey'"
              dense
              :icon="status.icon"
              class="q-px-sm"
              @click="toggleAnalysisFilter(status.value)"
            >
              <q-tooltip>{{ t(`status.${status.value}`) }}</q-tooltip>
            </q-btn>
          </q-btn-group>
        </div>
      </div>
    </header>

    <!-- Virtual List -->
    <div v-if="filteredCandidatesCount > 0" class="list-body">
      <q-virtual-scroll v-slot="{ item }" class="virtual-list" :items="filteredCandidates">

        <CandidateItem
          :key="item.id"
          :candidate="item"
          :selected="selectedId === item.id"
          class="q-mb-sm q-mr-sm"
          @delete="candidatesStore.removeCandidateById"
          @select="$emit('select', $event)"
        />
      </q-virtual-scroll>
    </div>

    <!-- Empty State (No Candidates or No Matches) -->
    <div
      v-else
      class="empty-state text-center q-pa-xl text-grey-5 border-dashed rounded-borders"
    >
      <div>
        <q-icon
          :name="
            totalCandidatesCount > 0 ? 'filter_list_off' : 'playlist_remove'
          "
          size="4rem"
        />
        <div class="text-h6 q-mt-md">
          {{
            totalCandidatesCount > 0
              ? t("analysis.noMatches")
              : t("analysis.noCandidates")
          }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import { useCandidatesStore } from "@/stores/candidates";
import CandidateItem from "./CandidateItem.vue";
import { useCandidateFilter } from "@/composables/useCandidateFilter";
import {
  SYSTEM_STATUS_OPTIONS,
  ANALYSIS_STATUS_OPTIONS,
} from "@/constants/status";
import type { Candidate } from "@/types/candidate";

defineProps<{
  selectedId?: string | null;
}>();

defineEmits<{
  (event: "select", candidate: Candidate): void;
}>();

const { t } = useI18n();
const $q = useQuasar();
const candidatesStore = useCandidatesStore();

const candidates = computed(() => candidatesStore.candidates);
const totalCandidatesCount = computed(() => candidatesStore.totalCount);

const {
  systemFilters,
  analysisFilters,
  toggleSystemFilter,
  toggleAnalysisFilter,
  filteredCandidates,
  filteredCount: filteredCandidatesCount,
} = useCandidateFilter(candidates);

const confirmClearAll = () => {
  $q.dialog({
    title: t("analysis.clearAll"),
    message: t("analysis.confirmClearAll"),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    candidatesStore.clearAllCandidates();
  });
};
</script>

<style scoped>
.candidate-list {
  display: flex;
  flex-direction: column;
  min-height: 0; /* allow parent to control height and enable inner scroll */
}

.toolbar {
  flex: 0 0 auto;
}

.toolbar-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.toolbar .title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toolbar-actions {
  display: flex;
  align-items: center;
}

.filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.list-body {
  flex: 1 1 auto;
  min-height: 0;
  overflow: auto;
  padding-right: 0.5rem; /* small gutter for scrollbar */
}

.virtual-list {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.border-dashed {
  border: 2px dashed #e0e0e0;
}
</style>
