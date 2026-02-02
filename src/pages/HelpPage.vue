<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">
      {{ t("help.title") }}
    </div>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ t("help.overview") }}</div>
        <p>
          Esta aplicación asiste en la identificación de personas a partir de
          marcas de agua simbólicas.
        </p>
      </q-card-section>
    </q-card>

    <q-card class="q-mb-md">
      <q-card-section>
        <div class="text-h6">{{ t("help.symbolSet") }}</div>
        <p>
          El sistema utiliza {{ symbolCount }} símbolos únicos para codificar
          identificadores.
        </p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { SYMBOLS } from "@/utils/symbols";

const { t } = useI18n();

const symbolCount = computed(() => SYMBOLS.length);
</script>
