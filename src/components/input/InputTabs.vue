<template>
  <div class="input-tabs">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="sequence" :label="t('analysis.inputSequence')" />
      <q-tab name="id" :label="t('analysis.inputId')" />
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="sequence">
        <SequenceInput v-model="sequenceValue" @valid="onSequenceValid" />
        <div class="row justify-end q-mt-sm">
          <q-btn
            color="primary"
            :label="
              isWildcardMode
                ? t('analysis.generateCandidates')
                : t('analysis.addCandidate')
            "
            :disable="!isSequenceValid"
            @click="handleSequenceSubmit"
            icon="add"
          />
        </div>
      </q-tab-panel>

      <q-tab-panel name="id">
        <IdPersonaInput v-model="idValue" @valid="onIdValid" />
        <div class="row justify-end q-mt-sm">
          <q-btn
            color="primary"
            :label="t('analysis.addCandidate')"
            :disable="!isIdValid"
            @click="handleIdSubmit"
            icon="add"
          />
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import SequenceInput from "./SequenceInput.vue";
import IdPersonaInput from "./IdPersonaInput.vue";
import { countWildcards } from "@/utils/wildcard";

const { t } = useI18n();

const tab = ref("sequence");
const sequenceValue = ref("");
const idValue = ref("");
const isSequenceValid = ref(false);
const isIdValid = ref(false);

const emit = defineEmits<{
  (e: "submit-sequence", value: string): void;
  (e: "submit-id", value: string): void;
}>();

const isWildcardMode = computed(() => countWildcards(sequenceValue.value) > 0);

const onSequenceValid = (valid: boolean) => {
  isSequenceValid.value = valid;
};

const onIdValid = (valid: boolean) => {
  isIdValid.value = valid;
};

const handleSequenceSubmit = () => {
  if (isSequenceValid.value) {
    emit("submit-sequence", sequenceValue.value);
    sequenceValue.value = ""; // Reset ?
  }
};

const handleIdSubmit = () => {
  if (isIdValid.value) {
    emit("submit-id", idValue.value);
    idValue.value = "";
  }
};
</script>
