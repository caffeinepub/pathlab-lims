import { FileOutput, Lock, Printer } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Separator } from "../components/ui/separator";
import { apiGetSettings } from "../lib/backend";
import { formatDate, formatDateTime } from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

interface LabSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
}

function getFlag(
  value: string,
  refMin?: number,
  refMax?: number,
): "↑" | "↓" | "*" | null {
  if (!value || value === "—") return null;
  const num = Number.parseFloat(value);
  if (!Number.isNaN(num)) {
    if (refMax !== undefined && num > refMax) return "↑";
    if (refMin !== undefined && num < refMin) return "↓";
  }
  return "*";
}

export default function Reports() {
  const { patients, tests, bookings, results, reports } = useLimsStore();
  const [viewing, setViewing] = useState<string | null>(null);
  const [labSettings, setLabSettings] = useState<LabSettings>({
    name: "PathLab Diagnostics",
    address: "123 Medical Centre, Healthcare Street",
    phone: "+91-XXXXXXXXXX",
    email: "info@pathlab.com",
  });
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGetSettings()
      .then((s) => {
        if (s) {
          setLabSettings({
            name: s.labName || "PathLab Diagnostics",
            address: s.labAddress || "123 Medical Centre, Healthcare Street",
            phone: s.labPhone || "+91-XXXXXXXXXX",
            email: s.labEmail || "info@pathlab.com",
          });
        }
      })
      .catch(() => {});
  }, []);

  const approvedBookings = bookings.filter((b) => b.status === "completed");
  const viewBooking = bookings.find((b) => b.id === viewing);
  const viewPatient = viewBooking
    ? patients.find((p) => p.id === viewBooking.patientId)
    : null;
  const viewReport = viewBooking
    ? reports.find((r) => r.bookingId === viewBooking.id)
    : null;
  const viewResults = viewBooking
    ? results.filter((r) => r.bookingId === viewBooking.id)
    : [];

  function printReport() {
    window.print();
  }

  return (
    <>
      {/* Global print styles — only active during window.print() */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #nabl-report-print, #nabl-report-print * { visibility: visible !important; }
          #nabl-report-print {
            position: fixed;
            left: 0; top: 0;
            width: 100%;
            background: #fff;
            z-index: 99999;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500">
            {approvedBookings.length} completed report(s)
          </p>
        </div>

        {/* Reports Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {approvedBookings.length === 0 ? (
            <EmptyState
              icon={FileOutput}
              title="No approved reports"
              description="Approve results in the Approval module to generate reports"
            />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-blue-50 border-b border-blue-100">
                  {[
                    "Booking ID",
                    "Patient",
                    "Age / Gender",
                    "Tests",
                    "Collected",
                    "Report Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 text-xs font-semibold text-gray-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvedBookings.map((b, idx) => {
                  const patient = patients.find((p) => p.id === b.patientId);
                  const report = reports.find((r) => r.bookingId === b.id);
                  return (
                    <tr
                      key={b.id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                      data-ocid={`reports.item.${idx + 1}`}
                    >
                      <td className="px-4 py-3 text-xs font-mono text-blue-600">
                        {b.bookingId}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">
                        {patient?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {patient?.age}y &bull; {patient?.gender}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {b.tests.length} test(s)
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {b.collectedAt ? formatDate(b.collectedAt) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={report?.status ?? "approved"} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => setViewing(b.id)}
                            className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                            data-ocid="reports.primary_button"
                          >
                            View Report
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => {
                              setViewing(b.id);
                              // slight delay to let dialog render, then print
                              setTimeout(() => window.print(), 300);
                            }}
                            data-ocid="reports.secondary_button"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            Print
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Report Dialog */}
        <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
          <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="no-print px-6 py-4 border-b bg-gray-50 sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-semibold text-gray-700">
                  Laboratory Report
                </DialogTitle>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={printReport}
                    className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
                    data-ocid="reports.print_button"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" />
                    Download PDF / Print
                  </Button>
                </div>
              </div>
            </DialogHeader>

            {/* NABL A4 Print Area */}
            <div id="nabl-report-print" ref={printRef} className="bg-white">
              {viewBooking && viewPatient && (
                <div
                  className="p-10"
                  style={{ fontFamily: "'Arial', 'Helvetica', sans-serif" }}
                >
                  {/* ===== REPORT HEADER ===== */}
                  <div
                    className="text-center pb-5 mb-6"
                    style={{ borderBottom: "2px solid #1d4ed8" }}
                  >
                    <h1
                      className="text-2xl font-extrabold"
                      style={{ color: "#1e3a8a", letterSpacing: "0.02em" }}
                    >
                      {labSettings.name}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: "#4b5563" }}>
                      {labSettings.address}
                    </p>
                    <p className="text-sm" style={{ color: "#4b5563" }}>
                      {labSettings.phone} &nbsp;|&nbsp; {labSettings.email}
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-3">
                      <div
                        className="flex-1"
                        style={{ height: "1px", background: "#93c5fd" }}
                      />
                      <span
                        className="text-xs font-bold uppercase tracking-widest px-4"
                        style={{ color: "#1d4ed8" }}
                      >
                        Laboratory Report
                      </span>
                      <div
                        className="flex-1"
                        style={{ height: "1px", background: "#93c5fd" }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: "#6b7280" }}>
                      NABL Accredited Laboratory
                    </p>

                    {/* Approved badge */}
                    {viewReport?.status === "approved" && (
                      <div
                        className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: "#dcfce7",
                          color: "#15803d",
                          border: "1px solid #86efac",
                        }}
                      >
                        <Lock style={{ width: 12, height: 12 }} />
                        &#10003; Approved — Report Locked
                      </div>
                    )}
                  </div>

                  {/* ===== PATIENT INFO GRID ===== */}
                  <div
                    className="grid grid-cols-2 gap-6 mb-6 p-5 rounded-lg"
                    style={{
                      background: "#f8fafc",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{
                          color: "#1d4ed8",
                          borderBottom: "1px solid #bfdbfe",
                          paddingBottom: "6px",
                        }}
                      >
                        Patient Information
                      </div>
                      <table className="w-full">
                        <tbody>
                          {[
                            ["Patient Name", viewPatient.name],
                            [
                              "Age / Gender",
                              `${viewPatient.age} Yrs / ${viewPatient.gender}`,
                            ],
                            ["Phone", viewPatient.phone || "—"],
                            ["Address", viewPatient.address || "—"],
                            ["Referring Doctor", "—"],
                          ].map(([label, value]) => (
                            <tr key={label}>
                              <td
                                className="py-1 pr-3 text-xs font-semibold align-top"
                                style={{ color: "#374151", width: "45%" }}
                              >
                                {label}
                              </td>
                              <td
                                className="py-1 text-sm"
                                style={{ color: "#111827" }}
                              >
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div>
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-3"
                        style={{
                          color: "#1d4ed8",
                          borderBottom: "1px solid #bfdbfe",
                          paddingBottom: "6px",
                        }}
                      >
                        Report Details
                      </div>
                      <table className="w-full">
                        <tbody>
                          {[
                            ["Report No.", viewBooking.bookingId],
                            ["Sample ID", viewBooking.sampleId || "—"],
                            [
                              "Collection Date",
                              viewBooking.collectedAt
                                ? formatDateTime(viewBooking.collectedAt)
                                : "—",
                            ],
                            [
                              "Report Date",
                              viewReport?.approvedAt
                                ? formatDateTime(viewReport.approvedAt)
                                : formatDate(viewBooking.updatedAt),
                            ],
                            ["Approved By", viewReport?.approvedBy ?? "—"],
                          ].map(([label, value]) => (
                            <tr key={label}>
                              <td
                                className="py-1 pr-3 text-xs font-semibold align-top"
                                style={{ color: "#374151", width: "45%" }}
                              >
                                {label}
                              </td>
                              <td
                                className="py-1 text-sm"
                                style={{ color: "#111827" }}
                              >
                                {value}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ===== TEST RESULTS ===== */}
                  {viewBooking.tests.map((testId) => {
                    const test = tests.find((t) => t.id === testId);
                    if (!test) return null;
                    return (
                      <div key={testId} className="mb-7">
                        {/* Test section header */}
                        <div
                          className="px-4 py-2 rounded-t-md"
                          style={{ background: "#1d4ed8", color: "#fff" }}
                        >
                          <span className="text-sm font-bold">{test.name}</span>
                          {test.category && (
                            <span className="text-xs ml-2 opacity-75">
                              ({test.category})
                            </span>
                          )}
                        </div>

                        {/* Parameter table */}
                        <table
                          className="w-full"
                          style={{
                            borderCollapse: "collapse",
                            border: "1px solid #bfdbfe",
                            borderTop: "none",
                          }}
                        >
                          <thead>
                            <tr style={{ background: "#eff6ff" }}>
                              {[
                                "Parameter",
                                "Observed Value",
                                "Unit",
                                "Biological Ref. Interval",
                                "Flag",
                              ].map((h) => (
                                <th
                                  key={h}
                                  className="text-left px-4 py-2 text-xs font-semibold"
                                  style={{
                                    color: "#1e40af",
                                    borderBottom: "1px solid #bfdbfe",
                                  }}
                                >
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {test.parameters.map((param, pIdx) => {
                              const r = viewResults.find(
                                (x) =>
                                  x.testId === testId &&
                                  x.parameterId === param.id,
                              );
                              const flag = r?.isAbnormal
                                ? getFlag(
                                    r.value,
                                    param.referenceMin,
                                    param.referenceMax,
                                  )
                                : null;
                              const isAbnormal = !!r?.isAbnormal;
                              return (
                                <tr
                                  key={param.id}
                                  style={{
                                    background: isAbnormal
                                      ? "#fff1f2"
                                      : pIdx % 2 === 0
                                        ? "#fff"
                                        : "#f8fafc",
                                    borderBottom: "1px solid #e2e8f0",
                                  }}
                                >
                                  <td
                                    className="px-4 py-2 text-sm"
                                    style={{ color: "#1f2937" }}
                                  >
                                    {param.name}
                                  </td>
                                  <td
                                    className="px-4 py-2 text-sm"
                                    style={{
                                      color: isAbnormal ? "#b91c1c" : "#111827",
                                      fontWeight: isAbnormal ? 700 : 500,
                                    }}
                                  >
                                    {r?.value ?? "—"}
                                  </td>
                                  <td
                                    className="px-4 py-2 text-sm"
                                    style={{ color: "#6b7280" }}
                                  >
                                    {param.unit || "—"}
                                  </td>
                                  <td
                                    className="px-4 py-2 text-sm"
                                    style={{ color: "#6b7280" }}
                                  >
                                    {param.referenceRange || "—"}
                                  </td>
                                  <td
                                    className="px-4 py-2 text-sm font-bold"
                                    style={{ color: "#b91c1c" }}
                                  >
                                    {flag ?? ""}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    );
                  })}

                  {/* ===== REPORT FOOTER ===== */}
                  <div
                    className="mt-8 pt-5"
                    style={{ borderTop: "1px solid #e2e8f0" }}
                  >
                    <p
                      className="text-center text-xs mb-4"
                      style={{ color: "#9ca3af", letterSpacing: "0.05em" }}
                    >
                      ─────────────────────── End of Report
                      ───────────────────────
                    </p>
                    <p
                      className="text-center text-xs mb-5"
                      style={{ color: "#6b7280" }}
                    >
                      This report is electronically approved and does not
                      require a physical signature.
                    </p>
                    <div className="flex justify-between items-end">
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        Generated by PathLab LIMS
                      </p>
                      <div className="text-right">
                        <div
                          className="text-xs mb-10"
                          style={{ color: "#9ca3af" }}
                        >
                          Authorized Signature
                        </div>
                        <div
                          style={{ borderTop: "1px solid #9ca3af", width: 200 }}
                        >
                          <div
                            className="text-xs mt-1"
                            style={{ color: "#374151" }}
                          >
                            {viewReport?.approvedBy ?? "Lab Admin"}
                          </div>
                          {viewReport?.approvedAt && (
                            <div
                              className="text-xs"
                              style={{ color: "#9ca3af" }}
                            >
                              {formatDateTime(viewReport.approvedAt)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        <Separator />
        <p className="text-xs text-center text-gray-400">
          &copy; {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </>
  );
}
