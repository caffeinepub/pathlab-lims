import {
  AlertTriangle,
  BarChart3,
  Clock,
  Database,
  Download,
  RefreshCw,
  Save,
  Settings,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { exportAllData, importData, resetAllData } from "../lib/exportImport";
import { useLimsStore } from "../store/useLimsStore";

function downloadJson(data: unknown, filename: string) {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function SettingsPage() {
  const store = useLimsStore();
  const {
    patients,
    tests,
    bookings,
    results,
    reports,
    payments,
    outsourceLabs,
  } = store;

  const [labName, setLabName] = useState(
    localStorage.getItem("lab_name") || "PathLab Diagnostics",
  );
  const [labAddress, setLabAddress] = useState(
    localStorage.getItem("lab_address") || "",
  );
  const [labPhone, setLabPhone] = useState(
    localStorage.getItem("lab_phone") || "",
  );
  const [labEmail, setLabEmail] = useState(
    localStorage.getItem("lab_email") || "",
  );
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [autoBackup, setAutoBackup] = useState(
    localStorage.getItem("lims_auto_backup_enabled") === "true",
  );
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(
    localStorage.getItem("lims_last_backup_time"),
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const allData = {
    patients,
    tests,
    bookings,
    results,
    reports,
    payments,
    outsourceLabs,
  };
  const storageKb = (new Blob([JSON.stringify(allData)]).size / 1024).toFixed(
    1,
  );
  const totalRecords =
    patients.length +
    tests.length +
    bookings.length +
    results.length +
    reports.length +
    payments.length +
    outsourceLabs.length;

  // Auto backup on data change
  useEffect(() => {
    if (!autoBackup) return;
    const snapshot = {
      patients,
      tests,
      bookings,
      results,
      reports,
      payments,
      outsourceLabs,
    };
    const timer = setTimeout(() => {
      localStorage.setItem("lims_last_backup", JSON.stringify(snapshot));
      const now = new Date().toISOString();
      localStorage.setItem("lims_last_backup_time", now);
      setLastBackupTime(now);
    }, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    patients,
    tests,
    bookings,
    results,
    reports,
    payments,
    outsourceLabs,
    autoBackup,
  ]);

  function saveLabInfo() {
    localStorage.setItem("lab_name", labName);
    localStorage.setItem("lab_address", labAddress);
    localStorage.setItem("lab_phone", labPhone);
    localStorage.setItem("lab_email", labEmail);
    toast.success("Lab information saved");
  }

  async function handleExport() {
    await exportAllData();
    toast.success("Data exported successfully");
  }

  function handleExportModule(module: "patients" | "tests" | "bookings") {
    const data = allData[module];
    downloadJson(
      data,
      `PathLab_${module}_${new Date().toISOString().slice(0, 10)}.json`,
    );
    toast.success(`${module} exported`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      await importData(file, importMode);
      toast.success(`Data imported (${importMode} mode)`);
    } catch {
      toast.error("Import failed — invalid file format");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function handleReset() {
    await resetAllData();
    toast.success("All data cleared");
    setResetConfirm(false);
  }

  function handleBackupNow() {
    localStorage.setItem("lims_last_backup", JSON.stringify(allData));
    const now = new Date().toISOString();
    localStorage.setItem("lims_last_backup_time", now);
    setLastBackupTime(now);
    toast.success("Backup saved to local storage");
  }

  async function handleRestoreBackup() {
    const raw = localStorage.getItem("lims_last_backup");
    if (!raw) {
      toast.error("No backup found");
      return;
    }
    try {
      const backup = JSON.parse(raw);
      await store.importData(backup, "replace");
      toast.success("Backup restored successfully");
    } catch {
      toast.error("Restore failed — backup may be corrupted");
    }
  }

  function toggleAutoBackup(enabled: boolean) {
    setAutoBackup(enabled);
    localStorage.setItem("lims_auto_backup_enabled", String(enabled));
    toast.success(enabled ? "Auto backup enabled" : "Auto backup disabled");
  }

  function formatBackupTime(iso: string | null): string {
    if (!iso) return "No backup yet";
    try {
      return new Date(iso).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Configure your lab and manage data
        </p>
      </div>

      {/* 1. Lab Information */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Lab Information</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">
              Lab Name
            </div>
            <Input
              value={labName}
              onChange={(e) => setLabName(e.target.value)}
              placeholder="PathLab Diagnostics"
            />
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-1">
              Address
            </div>
            <Input
              value={labAddress}
              onChange={(e) => setLabAddress(e.target.value)}
              placeholder="Lab address"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Phone
              </div>
              <Input
                value={labPhone}
                onChange={(e) => setLabPhone(e.target.value)}
                placeholder="Phone"
              />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600 mb-1">
                Email
              </div>
              <Input
                value={labEmail}
                onChange={(e) => setLabEmail(e.target.value)}
                placeholder="Email"
              />
            </div>
          </div>
        </div>
        <Button
          onClick={saveLabInfo}
          className="mt-4 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-1" /> Save Lab Info
        </Button>
      </div>

      {/* 2. Data Export */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Download className="w-4 h-4 text-green-600" />
          <h2 className="font-semibold text-gray-800">Data Export</h2>
        </div>
        <div className="space-y-4">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">
              Export All Data
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export Full Backup (JSON)
            </Button>
            <p className="text-xs text-gray-400 mt-1">
              Downloads a complete backup of all your data
            </p>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">
              Export by Module
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportModule("patients")}
                className="text-xs"
                data-ocid="settings.export_patients_button"
              >
                <Download className="w-3 h-3 mr-1" /> Export Patients
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportModule("tests")}
                className="text-xs"
                data-ocid="settings.export_tests_button"
              >
                <Download className="w-3 h-3 mr-1" /> Export Tests
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportModule("bookings")}
                className="text-xs"
                data-ocid="settings.export_bookings_button"
              >
                <Download className="w-3 h-3 mr-1" /> Export Bookings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Import */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="w-4 h-4 text-blue-600" />
          <h2 className="font-semibold text-gray-800">Data Import</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">
              Import Mode:
            </span>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                value="merge"
                checked={importMode === "merge"}
                onChange={() => setImportMode("merge")}
              />
              Merge
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input
                type="radio"
                value="replace"
                checked={importMode === "replace"}
                onChange={() => setImportMode("replace")}
              />
              Replace All
            </label>
          </div>
          <Button
            variant="outline"
            onClick={() => fileRef.current?.click()}
            disabled={importing}
            className="flex items-center gap-2"
            data-ocid="settings.import_button"
          >
            <Upload className="w-4 h-4" />
            {importing ? "Importing..." : "Import Data (JSON)"}
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          <p className="text-xs text-gray-400">
            Upload a previously exported JSON file
          </p>
        </div>
      </div>

      {/* 4. Auto Backup */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <RefreshCw className="w-4 h-4 text-purple-600" />
          <h2 className="font-semibold text-gray-800">Auto Backup</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-800">
                Auto Backup
              </div>
              <div className="text-xs text-gray-500">
                Automatically saves to localStorage on data changes
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={(e) => toggleAutoBackup(e.target.checked)}
                className="sr-only peer"
                data-ocid="settings.auto_backup_toggle"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            Last backup: {formatBackupTime(lastBackupTime)}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackupNow}
              className="flex items-center gap-2"
              data-ocid="settings.backup_now_button"
            >
              <Save className="w-3.5 h-3.5" /> Backup Now
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreBackup}
              disabled={!lastBackupTime}
              className="flex items-center gap-2"
              data-ocid="settings.restore_backup_button"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Restore Last Backup
            </Button>
          </div>
        </div>
      </div>

      {/* 5. Storage Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-indigo-600" />
          <h2 className="font-semibold text-gray-800">Storage Statistics</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Patients",
              count: patients.length,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Tests",
              count: tests.length,
              color: "bg-green-50 text-green-700",
            },
            {
              label: "Bookings",
              count: bookings.length,
              color: "bg-yellow-50 text-yellow-700",
            },
            {
              label: "Results",
              count: results.length,
              color: "bg-purple-50 text-purple-700",
            },
            {
              label: "Reports",
              count: reports.length,
              color: "bg-orange-50 text-orange-700",
            },
            {
              label: "Payments",
              count: payments.length,
              color: "bg-pink-50 text-pink-700",
            },
            {
              label: "Outsource Labs",
              count: outsourceLabs.length,
              color: "bg-teal-50 text-teal-700",
            },
          ].map(({ label, count, color }) => (
            <div key={label} className={`p-3 rounded-lg ${color}`}>
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs font-medium opacity-80">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1.5">
            <Database className="w-4 h-4 text-gray-400" />
            <span>{totalRecords} total records</span>
          </div>
          <div className="font-medium">{storageKb} KB estimated</div>
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
          <Clock className="w-3.5 h-3.5" />
          Last backup: {formatBackupTime(lastBackupTime)}
        </div>
      </div>

      {/* 6. Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <h2 className="font-semibold text-red-700">Danger Zone</h2>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <div className="text-sm font-medium text-red-800 mb-1">
            Reset All Data
          </div>
          <p className="text-xs text-red-600 mb-3">
            Clears ALL data from IndexedDB permanently. This cannot be undone.
          </p>
          <Button
            onClick={() => setResetConfirm(true)}
            variant="outline"
            className="flex items-center gap-2 text-red-600 border-red-300 hover:bg-red-100"
            data-ocid="settings.reset_data_button"
          >
            <AlertTriangle className="w-4 h-4" /> Reset All Data
          </Button>
        </div>
      </div>

      {/* 7. About */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">About</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="font-medium">IndexedDB (Local)</span>
          </div>
          <div className="flex justify-between">
            <span>Mode</span>
            <span className="font-medium text-green-600">Offline Ready</span>
          </div>
          <div className="flex justify-between">
            <span>Database</span>
            <span className="font-medium">LIMS_LOCAL_DB</span>
          </div>
        </div>
      </div>

      <Dialog open={resetConfirm} onOpenChange={setResetConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset All Data?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This will permanently delete ALL patients, tests, bookings, results,
            reports, and payments. This cannot be undone.
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => setResetConfirm(false)}
              data-ocid="settings.reset_cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
              data-ocid="settings.reset_confirm_button"
            >
              Reset Everything
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
