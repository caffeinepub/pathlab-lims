import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "../components/EmptyState";
import { StatusBadge } from "../components/StatusBadge";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { Textarea } from "../components/ui/textarea";
import { formatDate } from "../lib/limsUtils";
import { useLimsStore } from "../store/useLimsStore";

function getFlag(
  value: string,
  refMin?: number,
  refMax?: number,
): "H" | "L" | "A" | null {
  const num = Number.parseFloat(value);
  if (!Number.isNaN(num)) {
    if (refMax !== undefined && num > refMax) return "H";
    if (refMin !== undefined && num < refMin) return "L";
  }
  return "A";
}

export default function Approval() {
  const {
    patients,
    tests,
    bookings,
    results,
    reports,
    updateBooking,
    upsertReport,
  } = useLimsStore();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [rejectMode, setRejectMode] = useState<string | null>(null);
  const [rejectComment, setRejectComment] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const pendingBookings = bookings.filter((b) => b.status === "processing");
  const completedBookings = [...bookings]
    .filter((b) => b.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 10);

  async function approve(bookingId: string) {
    setLoading(bookingId);
    try {
      await upsertReport(bookingId, {
        status: "approved",
        approvedAt: new Date().toISOString(),
        approvedBy: "Lab Admin",
      });
      await updateBooking(bookingId, { status: "completed" });
      toast.success("Report approved and locked");
      setExpanded(null);
    } catch {
      toast.error("Failed to approve report");
    } finally {
      setLoading(null);
    }
  }

  async function confirmReject(bookingId: string) {
    setLoading(bookingId);
    try {
      await updateBooking(bookingId, { status: "collected" });
      const comment = rejectComment.trim();
      toast.info(
        comment
          ? `Sent back for re-entry. Reason: ${comment}`
          : "Booking sent back for re-entry",
      );
      setRejectMode(null);
      setRejectComment("");
      setExpanded(null);
    } catch {
      toast.error("Failed to reject report");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Report Approval</h1>
          <p className="text-sm text-gray-500">
            {pendingBookings.length} report(s) awaiting approval
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
          <ShieldCheck className="w-4 h-4 text-amber-500" />
          Review and approve results before issuing reports
        </div>
      </div>

      {/* Pending Approvals */}
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
            const isApproved = reports.some(
              (r) => r.bookingId === b.id && r.status === "approved",
            );
            const isRejecting = rejectMode === b.id;
            const isLoading = loading === b.id;

            return (
              <div
                key={b.id}
                className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
                data-ocid="approval.card"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between px-5 py-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">
                          {patient?.name ?? "Unknown Patient"}
                        </span>
                        <span className="text-xs font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                          {b.bookingId}
                        </span>
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {patient?.age}y &bull; {patient?.gender} &bull;{" "}
                        {formatDate(b.createdAt)}
                      </div>
                    </div>
                    <StatusBadge status={b.status} />
                    {abnormalCount > 0 && (
                      <span
                        className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full"
                        data-ocid="approval.error_state"
                      >
                        {abnormalCount} Abnormal
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : b.id)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      {isOpen ? "Hide" : "Review"}
                      {isOpen ? (
                        <ChevronUp className="w-3.5 h-3.5 inline ml-0.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 inline ml-0.5" />
                      )}
                    </button>
                    {!isApproved && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => approve(b.id)}
                          disabled={isLoading}
                          className="bg-green-600 hover:bg-green-700 h-7 text-xs"
                          data-ocid="approval.confirm_button"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isLoading}
                          onClick={() => {
                            setRejectMode(isRejecting ? null : b.id);
                            setRejectComment("");
                          }}
                          className="h-7 text-xs text-red-600 border-red-200 hover:bg-red-50"
                          data-ocid="approval.cancel_button"
                        >
                          <XCircle className="w-3.5 h-3.5 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Reject Comment Area */}
                {isRejecting && !isApproved && (
                  <div className="px-5 pb-4 bg-red-50 border-t border-red-100">
                    <label
                      htmlFor="reject-comment"
                      className="text-xs font-semibold text-red-700 mb-1 block mt-3"
                    >
                      Rejection Reason (optional)
                    </label>
                    <Textarea
                      placeholder="Enter reason for rejection..."
                      value={rejectComment}
                      onChange={(e) => setRejectComment(e.target.value)}
                      className="text-sm min-h-[72px] bg-white border-red-200 focus:border-red-400"
                      id="reject-comment"
                      data-ocid="approval.textarea"
                    />
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        onClick={() => confirmReject(b.id)}
                        disabled={isLoading}
                        className="h-7 text-xs bg-red-600 hover:bg-red-700 text-white"
                        data-ocid="approval.delete_button"
                      >
                        Confirm Reject
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRejectMode(null)}
                        className="h-7 text-xs"
                        data-ocid="approval.close_button"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}

                {/* NABL-style Result Preview */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {b.tests.length === 0 && (
                      <p className="px-5 py-4 text-sm text-gray-400">
                        No tests recorded.
                      </p>
                    )}
                    {b.tests.map((testId) => {
                      const test = tests.find((t) => t.id === testId);
                      if (!test) return null;
                      return (
                        <div key={testId}>
                          <div className="px-5 py-2 bg-blue-50 border-b border-blue-100">
                            <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                              {test.name}
                            </span>
                          </div>
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50 border-b border-gray-200">
                                {[
                                  "Parameter",
                                  "Result",
                                  "Unit",
                                  "Biological Ref. Interval",
                                  "Flag",
                                ].map((h) => (
                                  <th
                                    key={h}
                                    className="text-left px-4 py-2 text-xs font-semibold text-gray-600"
                                  >
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {test.parameters.map((param) => {
                                const r = bookingResults.find(
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
                                return (
                                  <tr
                                    key={param.id}
                                    className={`border-t border-gray-50 ${
                                      r?.isAbnormal ? "bg-red-50" : ""
                                    }`}
                                  >
                                    <td className="px-4 py-2 text-sm text-gray-700">
                                      {param.name}
                                    </td>
                                    <td
                                      className={`px-4 py-2 text-sm ${
                                        r?.isAbnormal
                                          ? "text-red-700 font-bold"
                                          : "text-gray-800 font-medium"
                                      }`}
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
                                      {flag === "H" && (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold">
                                          H
                                        </span>
                                      )}
                                      {flag === "L" && (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                                          L
                                        </span>
                                      )}
                                      {flag === "A" && (
                                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                                          A
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

      {/* Recently Approved Section */}
      {completedBookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            onClick={() => setShowHistory(!showHistory)}
            data-ocid="approval.toggle"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              <span className="font-semibold text-gray-800">
                Recently Approved
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {completedBookings.length}
              </span>
            </div>
            {showHistory ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showHistory && (
            <div className="border-t border-gray-100">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-50">
                    {[
                      "Booking ID",
                      "Patient",
                      "Age / Gender",
                      "Tests",
                      "Approved On",
                      "Status",
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
                  {completedBookings.map((b, idx) => {
                    const patient = patients.find((p) => p.id === b.patientId);
                    const report = reports.find((r) => r.bookingId === b.id);
                    return (
                      <tr
                        key={b.id}
                        className="border-t border-gray-50 hover:bg-gray-50"
                        data-ocid={`approval.item.${idx + 1}`}
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
                          {report?.approvedAt
                            ? formatDate(report.approvedAt)
                            : formatDate(b.updatedAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Approved
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

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
  );
}
