import type { LimsExport } from "../store/useLimsStore";
import { useLimsStore } from "../store/useLimsStore";

export async function exportAllData(): Promise<void> {
  const {
    patients,
    tests,
    bookings,
    results,
    reports,
    payments,
    outsourceLabs,
  } = useLimsStore.getState();
  const data: LimsExport = {
    patients,
    tests,
    bookings,
    results,
    reports,
    payments,
    outsourceLabs,
  };
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PathLab_LIMS_Export_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(
  file: File,
  mode: "replace" | "merge",
): Promise<void> {
  const text = await file.text();
  const data: Partial<LimsExport> = JSON.parse(text);
  await useLimsStore.getState().importData(data, mode);
}

export async function resetAllData(): Promise<void> {
  await useLimsStore.getState().resetAll();
}
