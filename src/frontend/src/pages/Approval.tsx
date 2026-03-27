import { CheckCircle, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { formatDate } from "../lib/utils";
import { useLimsStore } from "../store/useLimsStore";

export default function Approval() {
  const { patients, tests, bookings, results, updateBooking, upsertReport } =
    useLimsStore();
  const [expanded, setExpanded] = useState<string | null>(null);

  const pendingBookings = bookings.filter((b) => b.status === "processing");

  async function approve(bookingId: string) {
    await upsertReport(bookingId, {
      status: "approved",
      approvedAt: new Date().toISOString(),
      approvedBy: "Lab Admin",
    });
    await updateBooking(bookingId, { status: "completed" });
    toast.success("Report approved");
    setExpanded(null);
  }

  async function reject(bookingId: string) {
    await updateBooking(bookingId, { status: "collected" });
    toast.info("Booking sent back for re-entry");
    setExpanded(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Report Approval</h1>
        <p className="text-sm text-gray-500">
          {pendingBookings.length} report(s) awaiting approval
        </p>
      </div>

      <div className="space-y-3">
        {pendingBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <EmptyState
              icon={ShieldCheck}
              title="No pending approvals"
              description="All results have been reviewed"
            />
          </div>
        ) : (
          pendingBookings.map((b) => {
            const patient = patients.find((p) => p.id === b.patientId);
            const bookingResults = results.filter((r) => r.bookingId === b.id);
            const abnormalCount = bookingResults.filter(
              (r) => r.isAbnormal,
            ).length;
            const isOpen = expanded === b.id;

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
              >
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-800">
                          {patient?.name}
                        </span>
                        <span className="text-xs font-mono text-blue-600">
                          {b.bookingId}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {patient?.age}y • {patient?.gender} •{" "}
                        {formatDate(b.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                    {abnormalCount > 0 && (
                      <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                        {abnormalCount} Abnormal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : b.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      {isOpen ? "Hide" : "Review"}
                    </button>
                    <Button
                      size="sm"
                      onClick={() => approve(b.id)}
                      className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => reject(b.id)}
                      className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-gray-100">
                    {b.tests.map((testId) => {
                      const test = tests.find((t) => t.id === testId);
                      if (!test) return null;
                      return (
                        <div key={testId}>
                          <div className="px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-600">
                            {test.name}
                          </div>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-blue-50">
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                                  Parameter
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                                  Value
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                                  Unit
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                                  Reference
                                </th>
                                <th className="text-left px-4 py-2 text-xs font-semibold text-gray-600">
                                  Flag
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {test.parameters.map((param) => {
                                const r = bookingResults.find(
                                  (x) =>
                                    x.testId === testId &&
                                    x.parameterId === param.id,
                                );
                                return (
                                  <tr
                                    key={param.id}
                                    className={`border-t border-gray-50 ${r?.isAbnormal ? "bg-red-50" : ""}`}
                                  >
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {param.name}
                                    </td>
                                    <td
                                      className={`px-4 py-2 text-sm font-medium ${r?.isAbnormal ? "text-red-700 font-bold" : "text-gray-800"}`}
                                    >
                                      {r?.value ?? "—"}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                      {param.unit}
                                    </td>
                                    <td className="px-4 py-2 text-sm text-gray-500">
                                      {param.referenceRange}
                                    </td>
                                    <td className="px-4 py-2">
                                      {r?.isAbnormal && (
                                        <span className="text-xs font-bold text-red-600">
                                          ⚠ HIGH/LOW
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
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
