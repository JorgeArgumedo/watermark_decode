import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export function useConfirmDialog() {
  const $q = useQuasar();
  const { t } = useI18n();

  function confirm(options: { title?: string; message: string; cancel?: boolean; persistent?: boolean }) {
    return new Promise<void>((resolve) => {
      $q.dialog({
        title: options.title || t("common.confirm"),
        message: options.message,
        cancel: options.cancel ?? true,
        persistent: options.persistent ?? true,
      }).onOk(() => {
        resolve();
      });
    });
  }

  return { confirm };
}
