import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useCandidatesStore } from "@/stores/candidates";

/**
 * Handles generating candidates and standardizes the notification UX.
 */
export function useGenerateCandidates() {
  const $q = useQuasar();
  const { t } = useI18n();
  const candidatesStore = useCandidatesStore();

  async function generate(symbolicSequence: string) {
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

      return newlyGeneratedCandidatesCount;
    } catch (error) {
      console.error("Error processing sequence:", error);
      const errorMessage = error instanceof Error ? error.message : t("errors.unknownError");
      loadingNotification({
        icon: "error",
        spinner: false,
        message: t("errors.errorGenerating"),
        caption: errorMessage,
        timeout: 2500,
        color: "negative",
      });
      return 0;
    }
  }

  return { generate };
}
