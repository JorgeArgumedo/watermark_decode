<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <q-btn
        flat
        round
        dense
        icon="arrow_back"
        class="q-mr-sm"
        @click="$router.back()"
      />
      <div class="text-h4">
        {{ t("help.title") }}
      </div>
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">
          {{ t("help.overview") }}
        </div>
        <p>
          {{ t("help.overviewDetail") }}
        </p>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">
          {{ t("help.symbolSet") }}
        </div>
        <p>
          {{ t("help.symbolSetDetail", { count: symbolCount }) }}
        </p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SYMBOLS } from "@shared/utils/symbols";

const { t } = useI18n();

const symbolCount = computed(() => SYMBOLS.length);
</script>
