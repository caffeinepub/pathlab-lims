import JSZip from "jszip";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Code2,
  Database,
  Download,
  FileArchive,
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
import { apiGetSettings, apiSaveSettings } from "../lib/backend";
import { exportAllData, importData, resetAllData } from "../lib/exportImport";
import { useLimsStore } from "../store/useLimsStore";

// Raw source imports for ZIP bundling
import appRaw from "../App.tsx?raw";
// @ts-ignore
import backendDtsRaw from "../backend.d.ts?raw";
import backendRaw from "../backend.ts?raw";
import configRaw from "../config.ts?raw";
import indexCssRaw from "../index.css?raw";
import mainRaw from "../main.tsx?raw";

// components
import emptyStateRaw from "../components/EmptyState.tsx?raw";
import layoutRaw from "../components/Layout.tsx?raw";
import smartDropdownRaw from "../components/SmartDropdown.tsx?raw";
import statusBadgeRaw from "../components/StatusBadge.tsx?raw";

// shadcn UI components
import accordionRaw from "../components/ui/accordion.tsx?raw";
import alertDialogRaw from "../components/ui/alert-dialog.tsx?raw";
import alertRaw from "../components/ui/alert.tsx?raw";
import aspectRatioRaw from "../components/ui/aspect-ratio.tsx?raw";
import avatarRaw from "../components/ui/avatar.tsx?raw";
import badgeRaw from "../components/ui/badge.tsx?raw";
import breadcrumbRaw from "../components/ui/breadcrumb.tsx?raw";
import buttonRaw from "../components/ui/button.tsx?raw";
import calendarRaw from "../components/ui/calendar.tsx?raw";
import cardRaw from "../components/ui/card.tsx?raw";
import carouselRaw from "../components/ui/carousel.tsx?raw";
import chartRaw from "../components/ui/chart.tsx?raw";
import checkboxRaw from "../components/ui/checkbox.tsx?raw";
import collapsibleRaw from "../components/ui/collapsible.tsx?raw";
import commandRaw from "../components/ui/command.tsx?raw";
import contextMenuRaw from "../components/ui/context-menu.tsx?raw";
import dialogRaw from "../components/ui/dialog.tsx?raw";
import drawerRaw from "../components/ui/drawer.tsx?raw";
import dropdownMenuRaw from "../components/ui/dropdown-menu.tsx?raw";
import formRaw from "../components/ui/form.tsx?raw";
import hoverCardRaw from "../components/ui/hover-card.tsx?raw";
import inputOtpRaw from "../components/ui/input-otp.tsx?raw";
import inputRaw from "../components/ui/input.tsx?raw";
import labelRaw from "../components/ui/label.tsx?raw";
import menubarRaw from "../components/ui/menubar.tsx?raw";
import navigationMenuRaw from "../components/ui/navigation-menu.tsx?raw";
import paginationRaw from "../components/ui/pagination.tsx?raw";
import popoverRaw from "../components/ui/popover.tsx?raw";
import progressRaw from "../components/ui/progress.tsx?raw";
import radioGroupRaw from "../components/ui/radio-group.tsx?raw";
import resizableRaw from "../components/ui/resizable.tsx?raw";
import scrollAreaRaw from "../components/ui/scroll-area.tsx?raw";
import selectRaw from "../components/ui/select.tsx?raw";
import separatorRaw from "../components/ui/separator.tsx?raw";
import sheetRaw from "../components/ui/sheet.tsx?raw";
import sidebarRaw from "../components/ui/sidebar.tsx?raw";
import skeletonRaw from "../components/ui/skeleton.tsx?raw";
import sliderRaw from "../components/ui/slider.tsx?raw";
import sonnerRaw from "../components/ui/sonner.tsx?raw";
import switchRaw from "../components/ui/switch.tsx?raw";
import tableRaw from "../components/ui/table.tsx?raw";
import tabsRaw from "../components/ui/tabs.tsx?raw";
import textareaRaw from "../components/ui/textarea.tsx?raw";
import toggleGroupRaw from "../components/ui/toggle-group.tsx?raw";
import toggleRaw from "../components/ui/toggle.tsx?raw";
import tooltipRaw from "../components/ui/tooltip.tsx?raw";

// hooks
import useMobileRaw from "../hooks/use-mobile.tsx?raw";
import useActorRaw from "../hooks/useActor.ts?raw";
import useDataRaw from "../hooks/useData.ts?raw";
import useInternetIdentityRaw from "../hooks/useInternetIdentity.ts?raw";

// lib
import libBackendRaw from "../lib/backend.ts?raw";
import dbRaw from "../lib/db.ts?raw";
import exportImportRaw from "../lib/exportImport.ts?raw";
import limsUtilsRaw from "../lib/limsUtils.ts?raw";
import rootFilesRaw from "../lib/rootFiles.ts?raw";
import seedDataRaw from "../lib/seedData.ts?raw";
import libTypesRaw from "../lib/types.ts?raw";
import utilsRaw from "../lib/utils.ts?raw";

// store
import storeRaw from "../store/useLimsStore.ts?raw";

// utils
import storageClientRaw from "../utils/StorageClient.ts?raw";

// declarations
// @ts-ignore
import backendDidDtsRaw from "../declarations/backend.did.d.ts?raw";
import backendDidJsRaw from "../declarations/backend.did.js?raw";
// @ts-ignore
import jszipDtsRaw from "../types/jszip.d.ts?raw";
import uiSummaryRaw from "../ui-summary.json?raw";

// pages
import approvalRaw from "./Approval.tsx?raw";
import billingRaw from "./Billing.tsx?raw";
import bookingsRaw from "./Bookings.tsx?raw";
import dashboardRaw from "./Dashboard.tsx?raw";
import outsourceRaw from "./Outsource.tsx?raw";
import patientsRaw from "./Patients.tsx?raw";
import reportsRaw from "./Reports.tsx?raw";
import resultsRaw from "./Results.tsx?raw";
import samplesRaw from "./Samples.tsx?raw";
import settingsRaw from "./Settings.tsx?raw";
import testsRaw from "./Tests.tsx?raw";
import worklistRaw from "./Worklist.tsx?raw";

import biomeJsonRaw from "../../biome.json?raw";
import componentsJsonRaw from "../../components.json?raw";
import indexHtmlRaw from "../../index.html?raw";
// frontend root config files
import packageJsonRaw from "../../package.json?raw";
import postcssConfigRaw from "../../postcss.config.js?raw";
import tailwindConfigRaw from "../../tailwind.config.js?raw";
import tsconfigRaw from "../../tsconfig.json?raw";
import viteConfigRaw from "../../vite.config.js?raw";

import canisterYamlRaw from "../../../backend/canister.yaml?raw";
// backend files
import mainMoRaw from "../../../backend/main.mo?raw";

import {
  backendSystemIdlRaw,
  buildShRaw,
  caffeineLockRaw,
  deployShRaw,
  dockerfileRaw,
  envJsonRaw,
  frontendCanisterYamlRaw,
  icpYamlRaw,
  licenseRaw,
  packageLockJsonRaw,
  pnpmLockRaw,
  pnpmWorkspaceYamlRaw,
  pruneUnusedImagesRaw,
  readmeMdRaw,
  resizeImagesRaw,
  rootPackageJsonRaw,
  rootTsconfigRaw,
} from "../lib/rootFiles";

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

async function downloadSourceCode() {
  const zip = new JSZip();
  const root = zip.folder("pathlab-lims-source")!;

  root.file("icp.yaml", icpYamlRaw);
  root.file("pnpm-workspace.yaml", pnpmWorkspaceYamlRaw);
  root.file("package.json", rootPackageJsonRaw);
  root.file("README.md", readmeMdRaw);
  root.file("Dockerfile", dockerfileRaw);
  root.file("LICENSE", licenseRaw);
  root.file("build.sh", buildShRaw);
  root.file("deploy.sh", deployShRaw);
  root.file("tsconfig.json", rootTsconfigRaw);
  root.file("pnpm-lock.yaml", pnpmLockRaw);
  root.file("caffeine.lock.json", caffeineLockRaw);

  const scripts = root.folder("scripts")!;
  scripts.file("prune-unused-images.js", pruneUnusedImagesRaw);
  scripts.file("resize-images.js", resizeImagesRaw);

  // Backend
  const backend = root.folder("src/backend")!;
  backend.file("main.mo", mainMoRaw);
  backend.file("canister.yaml", canisterYamlRaw);
  const systemIdl = backend.folder("system-idl")!;
  systemIdl.file("aaaaa-aa.did", backendSystemIdlRaw);

  // Frontend root config files
  const frontend = root.folder("src/frontend")!;
  frontend.file("index.html", indexHtmlRaw);
  frontend.file("package.json", packageJsonRaw);
  frontend.file("tsconfig.json", tsconfigRaw);
  frontend.file("vite.config.js", viteConfigRaw);
  frontend.file("tailwind.config.js", tailwindConfigRaw);
  frontend.file("postcss.config.js", postcssConfigRaw);
  frontend.file("components.json", componentsJsonRaw);
  frontend.file("biome.json", biomeJsonRaw);
  frontend.file("canister.yaml", frontendCanisterYamlRaw);
  frontend.file("env.json", envJsonRaw);
  frontend.file("package-lock.json", packageLockJsonRaw);

  // Frontend src root files
  const src = frontend.folder("src")!;
  src.file("App.tsx", appRaw);
  src.file("main.tsx", mainRaw);
  src.file("config.ts", configRaw);
  src.file("backend.ts", backendRaw);
  src.file("backend.d.ts", backendDtsRaw as string);
  src.file("index.css", indexCssRaw);

  // Pages
  const pages = src.folder("pages")!;
  pages.file("Approval.tsx", approvalRaw);
  pages.file("Billing.tsx", billingRaw);
  pages.file("Bookings.tsx", bookingsRaw);
  pages.file("Dashboard.tsx", dashboardRaw);
  pages.file("Outsource.tsx", outsourceRaw);
  pages.file("Patients.tsx", patientsRaw);
  pages.file("Reports.tsx", reportsRaw);
  pages.file("Results.tsx", resultsRaw);
  pages.file("Samples.tsx", samplesRaw);
  pages.file("Settings.tsx", settingsRaw);
  pages.file("Tests.tsx", testsRaw);
  pages.file("Worklist.tsx", worklistRaw);

  // Components
  const components = src.folder("components")!;
  components.file("EmptyState.tsx", emptyStateRaw);
  components.file("Layout.tsx", layoutRaw);
  components.file("SmartDropdown.tsx", smartDropdownRaw);
  components.file("StatusBadge.tsx", statusBadgeRaw);

  // shadcn UI components
  const ui = components.folder("ui")!;
  ui.file("accordion.tsx", accordionRaw);
  ui.file("alert-dialog.tsx", alertDialogRaw);
  ui.file("alert.tsx", alertRaw);
  ui.file("aspect-ratio.tsx", aspectRatioRaw);
  ui.file("avatar.tsx", avatarRaw);
  ui.file("badge.tsx", badgeRaw);
  ui.file("breadcrumb.tsx", breadcrumbRaw);
  ui.file("button.tsx", buttonRaw);
  ui.file("calendar.tsx", calendarRaw);
  ui.file("card.tsx", cardRaw);
  ui.file("carousel.tsx", carouselRaw);
  ui.file("chart.tsx", chartRaw);
  ui.file("checkbox.tsx", checkboxRaw);
  ui.file("collapsible.tsx", collapsibleRaw);
  ui.file("command.tsx", commandRaw);
  ui.file("context-menu.tsx", contextMenuRaw);
  ui.file("dialog.tsx", dialogRaw);
  ui.file("drawer.tsx", drawerRaw);
  ui.file("dropdown-menu.tsx", dropdownMenuRaw);
  ui.file("form.tsx", formRaw);
  ui.file("hover-card.tsx", hoverCardRaw);
  ui.file("input-otp.tsx", inputOtpRaw);
  ui.file("input.tsx", inputRaw);
  ui.file("label.tsx", labelRaw);
  ui.file("menubar.tsx", menubarRaw);
  ui.file("navigation-menu.tsx", navigationMenuRaw);
  ui.file("pagination.tsx", paginationRaw);
  ui.file("popover.tsx", popoverRaw);
  ui.file("progress.tsx", progressRaw);
  ui.file("radio-group.tsx", radioGroupRaw);
  ui.file("resizable.tsx", resizableRaw);
  ui.file("scroll-area.tsx", scrollAreaRaw);
  ui.file("select.tsx", selectRaw);
  ui.file("separator.tsx", separatorRaw);
  ui.file("sheet.tsx", sheetRaw);
  ui.file("sidebar.tsx", sidebarRaw);
  ui.file("skeleton.tsx", skeletonRaw);
  ui.file("slider.tsx", sliderRaw);
  ui.file("sonner.tsx", sonnerRaw);
  ui.file("switch.tsx", switchRaw);
  ui.file("table.tsx", tableRaw);
  ui.file("tabs.tsx", tabsRaw);
  ui.file("textarea.tsx", textareaRaw);
  ui.file("toggle-group.tsx", toggleGroupRaw);
  ui.file("toggle.tsx", toggleRaw);
  ui.file("tooltip.tsx", tooltipRaw);

  // Hooks
  const hooks = src.folder("hooks")!;
  hooks.file("use-mobile.tsx", useMobileRaw);
  hooks.file("useActor.ts", useActorRaw);
  hooks.file("useData.ts", useDataRaw);
  hooks.file("useInternetIdentity.ts", useInternetIdentityRaw);

  // Lib
  const lib = src.folder("lib")!;
  lib.file("backend.ts", libBackendRaw);
  lib.file("db.ts", dbRaw);
  lib.file("exportImport.ts", exportImportRaw);
  lib.file("seedData.ts", seedDataRaw);
  lib.file("types.ts", libTypesRaw);
  lib.file("utils.ts", utilsRaw);
  lib.file("limsUtils.ts", limsUtilsRaw);
  lib.file("rootFiles.ts", rootFilesRaw);

  // Store
  const store = src.folder("store")!;
  store.file("useLimsStore.ts", storeRaw);

  // Utils
  const utils = src.folder("utils")!;
  utils.file("StorageClient.ts", storageClientRaw);

  // Declarations
  const declarations = src.folder("declarations")!;
  declarations.file("backend.did.d.ts", backendDidDtsRaw as string);
  declarations.file("backend.did.js", backendDidJsRaw);

  // Types
  const types = src.folder("types")!;
  types.file("jszip.d.ts", jszipDtsRaw as string);

  // ui-summary
  src.file("ui-summary.json", uiSummaryRaw);

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pathlab-lims-source.zip";
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

  const [labName, setLabName] = useState("");
  const [labAddress, setLabAddress] = useState("");
  const [labPhone, setLabPhone] = useState("");
  const [labEmail, setLabEmail] = useState("");
  const [resetConfirm, setResetConfirm] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMode, setImportMode] = useState<"replace" | "merge">("merge");
  const [autoBackup, setAutoBackup] = useState(
    localStorage.getItem("lims_auto_backup_enabled") === "true",
  );
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(
    localStorage.getItem("lims_last_backup_time"),
  );
  const [downloading, setDownloading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load lab info from backend on mount
  useEffect(() => {
    apiGetSettings()
      .then((s) => {
        if (s) {
          setLabName(s.labName || "PathLab Diagnostics");
          setLabAddress(s.labAddress || "");
          setLabPhone(s.labPhone || "");
          setLabEmail(s.labEmail || "");
        } else {
          setLabName("PathLab Diagnostics");
        }
      })
      .catch(() => {
        setLabName("PathLab Diagnostics");
      });
  }, []);

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

  async function saveLabInfo() {
    try {
      await apiSaveSettings({
        labName,
        labAddress,
        labPhone,
        labEmail,
        currency: "INR",
        reportHeader: "",
        reportFooter: "",
      });
      toast.success("Lab information saved");
    } catch {
      toast.error("Failed to save lab information");
    }
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

  async function handleDownloadSourceCode() {
    setDownloading(true);
    try {
      await downloadSourceCode();
    } catch {
      toast.error("Download failed — please try again");
    } finally {
      setDownloading(false);
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
          data-ocid="settings.save_button"
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
              data-ocid="settings.export_all_button"
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
            Clears ALL data from the backend permanently. This cannot be undone.
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

      {/* 7. Download Source Code */}
      <div className="bg-white rounded-xl border border-violet-200 p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Code2 className="w-4 h-4 text-violet-600" />
          <h2 className="font-semibold text-gray-800">Download Source Code</h2>
          <span className="ml-auto text-xs bg-violet-100 text-violet-700 font-medium px-2 py-0.5 rounded-full">
            ZIP
          </span>
        </div>

        <div className="bg-violet-50 border border-violet-100 rounded-lg p-4 mb-4 mt-3">
          <p className="text-xs font-semibold text-violet-700 mb-2 uppercase tracking-wide">
            What's included in the ZIP
          </p>
          <ul className="space-y-1 text-sm text-gray-600">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
              Backend — Motoko canister source (stable memory, all CRUD APIs)
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
              Frontend — React + TypeScript + Tailwind + ShadCN UI source
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
              All 13 modules: Dashboard, Patients, Tests, Bookings, Reports…
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-violet-400 rounded-full flex-shrink-0" />
              All shadcn/ui components, hooks, config files, and declarations
            </li>
          </ul>
        </div>

        <Button
          className="bg-violet-600 hover:bg-violet-700 text-white flex items-center gap-2"
          onClick={handleDownloadSourceCode}
          disabled={downloading}
          data-ocid="settings.download_source_button"
        >
          <FileArchive className="w-4 h-4" />
          {downloading ? "Preparing ZIP..." : "Download Project Source Code"}
        </Button>
      </div>

      {/* 8. About */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-800 mb-3">About</h2>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>Version</span>
            <span className="font-medium">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Storage</span>
            <span className="font-medium">ICP Canister (Motoko)</span>
          </div>
          <div className="flex justify-between">
            <span>Mode</span>
            <span className="font-medium text-green-600">Production Ready</span>
          </div>
          <div className="flex justify-between">
            <span>Backend</span>
            <span className="font-medium">Internet Computer</span>
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
