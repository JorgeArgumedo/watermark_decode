import { useConfirmDialog } from "@presentation/composables/useConfirmDialog";
import { useCandidatesStore } from "@/stores/candidates";
import type { SystemStatus, AnalysisStatus } from "@shared/types/candidate";

/**
 * Composable to encapsulate clearing candidates by status with confirmation
 */
export function useClearByStatus() {
  const { confirm } = useConfirmDialog();
  const candidatesStore = useCandidatesStore();

  async function clearBySystemStatus(status: SystemStatus) {
    await confirm({
      title: undefined,
      message: `Are you sure you want to clear candidates with status '${status}'?`,
    });
    candidatesStore.removeAllCandidatesBySystemStatus(status);
  }

  async function clearByAnalysisStatus(status: AnalysisStatus) {
    await confirm({
      title: undefined,
      message: `Are you sure you want to clear candidates with analysis status '${status}'?`,
    });
    candidatesStore.removeAllCandidatesByAnalysisStatus(status);
  }

  return { clearBySystemStatus, clearByAnalysisStatus };
}
