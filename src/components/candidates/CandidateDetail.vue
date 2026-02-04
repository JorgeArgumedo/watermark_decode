<template>
  <div ref="detailWrapper" class="candidate-detail-wrapper full-height">
    <q-card bordered flat class="candidate-detail bg-white full-height column">
      <q-card-section class="col overflow-auto">

        <!-- Header -->
        <div class="text-h6 q-mb-md">
          {{ t("analysis.candidateDetails") }}
        </div>

        <!-- ========================= -->
        <!-- 1. IDENTIDAD SIMBÓLICA -->
        <!-- ========================= -->
        <q-list separator dense>
          <div class="top-summary">
            <div class="text-caption text-grey">
              {{ t('common.id') }}: {{ candidate.id }}
            </div>

            <div class="sequence">
              <div class="caption">{{ t("analysis.inputSequence") }}</div>
              <div class="sequence-box">
                <HorizontalSymbols :sequence="candidate.sequence" size="sm" />
              </div>
            </div>
            <div class="statuses">
              <q-chip dense :color="systemColor" text-color="white" :icon="systemIcon">
                {{ t(`status.${candidate.systemStatus}`) }}
              </q-chip>
              <q-chip dense :color="analysisColor" text-color="white" :icon="analysisIcon">
                {{ t(`status.${candidate.analysisStatus}`) }}
              </q-chip>
            </div>
          </div>
          
        </q-list>

        <!-- ========================= -->
        <!-- 4. DATOS DE PERSONA -->
        <!-- ========================= -->
        <q-separator class="q-my-lg" />

        <div class="text-subtitle2 q-mb-sm">
          {{ t("analysis.personData") }}
        </div>

        <div v-if="candidate.systemStatus === 'found'">
          <div class="info-grid">
            <q-list dense class="info-column">
              <q-item v-if="candidate.nombre">
                <q-item-section>
                  <q-item-label caption>{{ t('analysis.name') }}</q-item-label>
                  <q-item-label>{{ candidate.nombre }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="candidate.usuario">
                <q-item-section>
                  <q-item-label caption>{{ t('analysis.username') }}</q-item-label>
                  <q-item-label>{{ candidate.usuario }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="candidate.email">
                <q-item-section>
                  <q-item-label caption>{{ t('analysis.email') }}</q-item-label>
                  <q-item-label>{{ candidate.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>

            <q-list dense class="info-column">
              <q-item v-if="candidate.matricula">
                <q-item-section>
                  <q-item-label caption>{{ t('analysis.registration') }}</q-item-label>
                  <q-item-label>{{ candidate.matricula }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-item v-if="candidate.estado">
                <q-item-section>
                  <q-item-label caption>{{ t('analysis.state') }}</q-item-label>
                  <q-item-label>{{ candidate.estado }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <div v-else class="text-grey">
          {{ t("analysis.noPersonData") }}
        </div>

        <!-- ========================= -->
        <!-- 5. FOTOS -->
        <!-- ========================= -->
        <q-separator class="q-my-lg" />

        <div class="text-subtitle2 q-mb-sm">
          {{ t("analysis.photos") }}
        </div>

        <div v-if="candidate.fotos?.length" class="photos-grid">
          <div v-for="(foto, index) in candidate.fotos" :key="index" class="photo-item">
            <q-img :src="foto" spinner-color="primary" class="photo-thumb" />
          </div>
        </div>

        <div v-else class="text-grey">
          {{ t("analysis.noPhotos") }}
        </div>

        <!-- ========================= -->
        <!-- 6. GRUPOS -->
        <!-- ========================= -->
        <q-separator class="q-my-lg" />

        <div v-if="candidate.grupos?.length">
          <div class="text-subtitle2 q-mb-sm">{{ t('analysis.groups') }}</div>
          <div class="row q-col-gutter-sm">
            <q-card v-for="(grupo, idx) in candidate.grupos" :key="idx" class="col-12 col-md-6 q-mb-sm">
              <q-card-section>
                <div class="row items-center justify-between">
                  <div>
                    <div class="text-subtitle1">{{ grupo.grupo }}</div>
                    <div class="text-caption text-grey">{{ grupo.periodo }} · {{ grupo.universidad }}</div>
                  </div>
                  <div class="text-caption text-grey">
                    {{ t('analysis.groupId') }}: {{ grupo.idgrupo }}
                  </div>
                </div>
                <q-separator class="q-my-sm" />
                <div class="q-gutter-sm">
                  <q-chip dense label>{{ t('analysis.idUniversidad') }}: {{ grupo.iduniversidad }}</q-chip>
                  <q-chip dense label>{{ t('analysis.idDepartamento') }}: {{ grupo.iddepartamento }}</q-chip>
                  <q-chip dense label>{{ t('analysis.idPeriodo') }}: {{ grupo.idPeriodo }}</q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

      </q-card-section>

      <q-card-actions align="right" class="detail-actions detail-actions-sticky">
        <q-btn color="positive" :label="t('actions.approve')" icon="thumb_up"
          :disable="candidate.analysisStatus === 'approved'" @click="updateAnalysisStatus('approved')" />
        <q-btn color="negative" :label="t('actions.exclude')" icon="block"
          :disable="candidate.analysisStatus === 'excluded'" @click="updateAnalysisStatus('excluded')" />
      </q-card-actions>

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
const store = useCandidatesStore();
const { renderBorder } = useSymbolicBorderRenderer();
const detailWrapper = ref<HTMLElement | null>(null);

/* =========================
   STATUS META
========================= */
const systemInfo = computed(
  () =>
    SYSTEM_STATUS_OPTIONS.find(
      s => s.value === props.candidate.systemStatus,
    ) ?? { icon: "help", color: "grey" },
);

const analysisInfo = computed(
  () =>
    ANALYSIS_STATUS_OPTIONS.find(
      s => s.value === props.candidate.analysisStatus,
    ) ?? { icon: "help", color: "grey" },
);

const systemIcon = computed(() => systemInfo.value.icon);
const systemColor = computed(() => systemInfo.value.color);
const analysisIcon = computed(() => analysisInfo.value.icon);
const analysisColor = computed(() => analysisInfo.value.color);

/* =========================
   BORDER RENDER
========================= */
const drawBorder = () => {
  const el = detailWrapper.value?.querySelector(".q-card") as HTMLElement;
  if (!el) return;

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
};

onMounted(() => setTimeout(drawBorder, 50));
watch(() => props.candidate.idPersona, () => setTimeout(drawBorder, 50));

/* =========================
   ACTIONS
========================= */
const updateAnalysisStatus = (status: AnalysisStatus) => {
  store.updateCandidateStatus(props.candidate.id, {
    analysisStatus: status,
  });
};

/* =========================
   HELPERS
========================= */
const formatDate = (date?: Date) =>
  date ? new Date(date).toLocaleString() : "—";
</script>

<style scoped>
.candidate-detail-wrapper {
  padding-left: 5px;
  height: 100%;
  display: flex;
  overflow: hidden;
}
/* Ensure the card behaves as a column flex container and allows the inner section to scroll */
.candidate-detail {
  display: flex;
  flex-direction: column;
  min-height: 0; /* allow children with overflow to be constrained */
  width: 100%;
}
.candidate-detail .q-card-section {
  flex: 1 1 auto;
  min-height: 0; /* critical to avoid cut-off when using overflow-auto inside flex */
  overflow: auto;
  /* space for sticky actions */
  padding-bottom: 3.5rem;
}
  
.detail-actions {
  flex: 0 0 auto;
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  padding: 0.75rem 0.5rem;
  border-top: 1px solid #eee;
  background: rgba(255,255,255,0.98);
}

.detail-actions-sticky {
  position: sticky;
  bottom: 0;
  z-index: 2;
  backdrop-filter: blur(2px);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
  gap: 0.5rem;
}
.photo-item {
  display: flex;
}
.photo-thumb {
  width: 100px;
  /* height: 110px; */
  /* object-fit: cover; */
  /* border-radius: 6px; */
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.info-column {
  min-width: 0;
}

@media (max-width: 700px) {
  .info-grid { grid-template-columns: 1fr; }
  .photo-thumb { height: 90px; }
}

</style>
