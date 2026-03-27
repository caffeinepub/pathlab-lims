import { Link, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Building2,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  FileOutput,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Search,
  Settings,
  ShieldCheck,
  TestTube,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { cn } from "../lib/utils";
import { useLimsStore } from "../store/useLimsStore";
import { Toaster } from "./ui/sonner";

const NAV_ITEMS = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/patients", icon: Users, label: "Patients" },
  { path: "/tests", icon: FlaskConical, label: "Test Master" },
  { path: "/bookings", icon: CalendarCheck, label: "Bookings" },
  { path: "/samples", icon: TestTube, label: "Samples" },
  { path: "/worklist", icon: ClipboardList, label: "Worklist" },
  { path: "/results", icon: FileText, label: "Result Entry" },
  { path: "/approval", icon: ShieldCheck, label: "Approval" },
  { path: "/reports", icon: FileOutput, label: "Reports" },
  { path: "/billing", icon: CreditCard, label: "Billing" },
  { path: "/outsource", icon: Building2, label: "Outsource" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

type SearchResult = {
  type: string;
  id: string;
  label: string;
  sub: string;
  path: string;
};

export function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const { patients, bookings, tests } = useLimsStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const searchResults: SearchResult[] =
    searchQuery.trim().length > 1
      ? [
          ...patients
            .filter(
              (p) =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.phone.includes(searchQuery),
            )
            .slice(0, 4)
            .map((p) => ({
              type: "Patient",
              id: p.id,
              label: p.name,
              sub: p.phone,
              path: "/patients",
            })),
          ...bookings
            .filter((b) =>
              b.bookingId.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .slice(0, 3)
            .map((b) => ({
              type: "Booking",
              id: b.id,
              label: b.bookingId,
              sub: b.status,
              path: "/bookings",
            })),
          ...tests
            .filter((t) =>
              t.name.toLowerCase().includes(searchQuery.toLowerCase()),
            )
            .slice(0, 3)
            .map((t) => ({
              type: "Test",
              id: t.id,
              label: t.name,
              sub: t.category,
              path: "/tests",
            })),
        ]
      : [];

  return (
    <div className="flex h-screen bg-[#F4F7FB] overflow-hidden">
      <aside
        className="w-60 flex-shrink-0 flex flex-col"
        style={{
          background: "linear-gradient(180deg,#0B1F33 0%,#071A2A 100%)",
        }}
      >
        <div className="px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm">PathLab LIMS</div>
              <div className="text-blue-300 text-xs">Laboratory System</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
            const isActive =
              path === "/" ? pathname === "/" : pathname.startsWith(path);
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-blue-200 hover:bg-white/10 hover:text-white",
                )}
                data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="px-4 py-3 border-t border-white/10">
          <div className="text-xs text-blue-400 text-center">
            PathLab LIMS v2.0 • Offline Ready
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 flex-shrink-0">
          <div className="flex-1 max-w-sm relative">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients, bookings, tests..."
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearch(true);
                }}
                onFocus={() => setShowSearch(true)}
                onBlur={() => setTimeout(() => setShowSearch(false), 200)}
                data-ocid="layout.search_input"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSearch(false);
                  }}
                >
                  <X className="w-3.5 h-3.5 text-gray-400" />
                </button>
              )}
            </div>
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
                {searchResults.map((r) => (
                  <Link
                    key={r.id}
                    to={r.path}
                    onClick={() => {
                      setSearchQuery("");
                      setShowSearch(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0"
                  >
                    <span className="text-xs font-medium px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                      {r.type}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-gray-800">
                        {r.label}
                      </div>
                      <div className="text-xs text-gray-500">{r.sub}</div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {showSearch &&
              searchQuery.length > 1 &&
              searchResults.length === 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 text-sm text-gray-500 text-center">
                  No results found
                </div>
              )}
          </div>
          <button
            type="button"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <Bell className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">A</span>
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <Toaster richColors position="top-right" />
    </div>
  );
}
