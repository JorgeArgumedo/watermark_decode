<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title>
          {{ t("common.appName") }}
        </q-toolbar-title>

        <q-space />

        <q-btn-dropdown
          flat
          :label="currentLocale.toUpperCase()"
          icon="language"
        >
          <q-list>
            <q-item v-close-popup clickable @click="setLocale('es')">
              <q-item-section>
                <q-item-label>{{ t("common.spanish") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="setLocale('en')">
              <q-item-section>
                <q-item-label>{{ t("common.english") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item v-close-popup clickable @click="setLocale('pt')">
              <q-item-section>
                <q-item-label>{{ t("common.portuguese") }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>

        <q-btn flat round dense icon="help" @click="$router.push('/help')" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t, locale } = useI18n();

const currentLocale = computed(() => locale.value);

const setLocale = (newLocale: string) => {
  locale.value = newLocale;
};
</script>
