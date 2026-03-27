import { Download, FileOutput, Printer } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent } from "../components/ui/dialog";
import { formatDate, formatDateTime } from "../lib/utils";
import { useLimsStore } from "../store/useLimsStore";

export default function Reports() {
  const { patients, tests, bookings, results, reports } = useLimsStore();
  const [viewing, setViewing] = useState<string | null>(null);

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

  const labInfo = {
    name: localStorage.getItem("lab_name") || "PathLab Diagnostics",
    address:
      localStorage.getItem("lab_address") ||
      "123 Medical Centre, Healthcare Street",
    phone: localStorage.getItem("lab_phone") || "+91-XXXXXXXXXX",
    email: localStorage.getItem("lab_email") || "info@pathlab.com",
  };

  function printReport() {
    window.print();
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-sm text-gray-500">
          {approvedBookings.length} completed report(s)
        </p>
      </div>

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
              <tr className="bg-blue-50">
                {[
                  "Booking ID",
                  "Patient",
                  "Tests",
                  "Amount",
                  "Date",
                  "Report Status",
                  "Action",
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
              {approvedBookings.map((b) => {
                const patient = patients.find((p) => p.id === b.patientId);
                const report = reports.find((r) => r.bookingId === b.id);
                return (
                  <tr
                    key={b.id}
                    className="border-t border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-xs font-mono text-blue-600">
                      {b.bookingId}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">
                      {patient?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {b.tests.length} test(s)
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      ₹{b.totalAmount}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDate(b.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={report?.status ?? "approved"} />
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        size="sm"
                        onClick={() => setViewing(b.id)}
                        className="bg-blue-600 hover:bg-blue-700 h-7 text-xs"
                      >
                        View Report
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          <div id="print-report">
            {/* Print styles */}
            <div className="no-print flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <span className="font-semibold text-gray-700">Lab Report</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={printReport}
                  className="h-8 text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1" />
                  Print
                </Button>
              </div>
            </div>

            {viewBooking && viewPatient && (
              <div
                className="p-8 bg-white"
                style={{ fontFamily: "Arial, sans-serif" }}
              >
                {/* Header */}
                <div className="text-center border-b-2 border-blue-600 pb-4 mb-6">
                  <h1 className="text-2xl font-bold text-blue-700">
                    {labInfo.name}
                  </h1>
                  <p className="text-sm text-gray-600">{labInfo.address}</p>
                  <p className="text-sm text-gray-600">
                    {labInfo.phone} | {labInfo.email}
                  </p>
                  <div className="mt-2 text-xs font-semibold text-gray-500 tracking-widest uppercase">
                    Laboratory Report
                  </div>
                </div>

                {/* Patient + Booking Info */}
                <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Patient Information
                    </h3>
                    <p className="text-sm">
                      <span className="font-medium">Name:</span>{" "}
                      {viewPatient.name}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Age/Gender:</span>{" "}
                      {viewPatient.age} Yrs / {viewPatient.gender}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      {viewPatient.phone || "—"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Report Details
                    </h3>
                    <p className="text-sm">
                      <span className="font-medium">Booking ID:</span>{" "}
                      {viewBooking.bookingId}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Sample ID:</span>{" "}
                      {viewBooking.sampleId || "—"}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Report Date:</span>{" "}
                      {viewReport?.approvedAt
                        ? formatDateTime(viewReport.approvedAt)
                        : formatDate(viewBooking.updatedAt)}
                    </p>
                  </div>
                </div>

                {/* Results */}
                {viewBooking.tests.map((testId) => {
                  const test = tests.find((t) => t.id === testId);
                  if (!test) return null;
                  return (
                    <div key={testId} className="mb-6">
                      <h3 className="font-bold text-gray-800 bg-blue-50 px-4 py-2 rounded-t-lg border border-blue-100">
                        {test.name}
                      </h3>
                      <table className="w-full border border-blue-100 rounded-b-lg overflow-hidden">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                              Parameter
                            </th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                              Result
                            </th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                              Unit
                            </th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                              Reference Range
                            </th>
                            <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                              Flag
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {test.parameters.map((param) => {
                            const r = viewResults.find(
                              (x) =>
                                x.testId === testId &&
                                x.parameterId === param.id,
                            );
                            return (
                              <tr
                                key={param.id}
                                className="border-t border-gray-100"
                              >
                                <td className="px-4 py-2 text-sm">
                                  {param.name}
                                </td>
                                <td
                                  className={`px-4 py-2 text-sm font-medium ${r?.isAbnormal ? "text-red-700 font-bold" : ""}`}
                                >
                                  {r?.value ?? "—"}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {param.unit}
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {param.referenceRange}
                                </td>
                                <td className="px-4 py-2 text-sm">
                                  {r?.isAbnormal && (
                                    <span className="text-red-600 font-bold">
                                      H/L
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}

                {/* Signature */}
                <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between">
                  <div className="text-sm text-gray-500">
                    Generated by PathLab LIMS
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-8">
                      Authorized Signature
                    </div>
                    <div className="border-t border-gray-400 w-48">
                      <div className="text-xs text-gray-600 mt-1">
                        {viewReport?.approvedBy ?? "Lab Admin"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
