<template>
  <q-card
    bordered
    flat
    class="candidate-item q-mb-sm cursor-pointer transition-generic"
    :class="{ 'bg-blue-1 border-primary': selected }"
    @click="$emit('select', candidate)"
    v-ripple
  >
    <q-card-section>
      <div class="row items-center q-col-gutter-md no-wrap">
        <!-- Visual Identifier (Icon instead of full border) -->
        <div class="col-auto">
          <q-avatar
            color="primary"
            text-color="white"
            font-size="20px"
            icon="fingerprint"
          />
        </div>

        <!-- Info -->
        <div class="col">
          <div class="column justify-center full-height">
            <div class="text-caption text-grey">
              ID: {{ candidate.idPersona }}
            </div>
            <HorizontalSymbols :sequence="candidate.sequence" />

            <div class="row q-mt-sm q-gutter-x-sm wrap">
              <q-chip
                dense
                :color="statusColor"
                text-color="white"
                icon="dns"
                size="sm"
              >
                {{ t(`status.${candidate.systemStatus}`) }}
              </q-chip>

              <q-chip
                dense
                :color="analysisColor"
                text-color="white"
                icon="rate_review"
                size="sm"
              >
                {{ t(`status.${candidate.analysisStatus}`) }}
              </q-chip>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="col-auto">
          <q-btn
            round
            dense
            flat
            color="grey"
            icon="delete"
            @click.stop="$emit('delete', candidate.id)"
          >
            <q-tooltip>{{ t("actions.deleteTooltip") }}</q-tooltip>
          </q-btn>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { Candidate } from "@/types/candidate";
import HorizontalSymbols from "@/components/symbolic/HorizontalSymbols.vue";

const props = defineProps<{
  candidate: Candidate;
  selected?: boolean;
}>();

defineEmits<{
  (e: "delete", id: string): void;
  (e: "select", candidate: Candidate): void;
}>();

const { t } = useI18n();

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
</script>

<style scoped>
@media (max-width: 599px) {
  .symbolic-preview-container {
    width: 60px;
  }
}
</style>
