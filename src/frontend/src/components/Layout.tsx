import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
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
  Loader2,
  Search,
  Settings,
  ShieldCheck,
  TestTube,
  Users,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
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
  type: "Patient" | "Booking" | "Test" | "Lab";
  id: string;
  label: string;
  sub: string;
  path: string;
};

const TYPE_BADGE: Record<SearchResult["type"], string> = {
  Patient: "bg-blue-100 text-blue-700",
  Booking: "bg-green-100 text-green-700",
  Test: "bg-purple-100 text-purple-700",
  Lab: "bg-orange-100 text-orange-700",
};

function normalize(value: unknown): string {
  return (value ?? "").toString().toLowerCase().trim();
}

export function Layout({ children }: { children: React.ReactNode }) {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const navigate = useNavigate();
  const { patients, bookings, tests, outsourceLabs } = useLimsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    if (searchQuery.trim().length > 1) {
      setIsSearching(true);
      const t = setTimeout(() => {
        setDebouncedQuery(searchQuery);
        setIsSearching(false);
      }, 300);
      return () => clearTimeout(t);
    }
    setDebouncedQuery("");
    setIsSearching(false);
  }, [searchQuery]);

  const searchResults: SearchResult[] =
    debouncedQuery.trim().length > 1
      ? (() => {
          const q = normalize(debouncedQuery);
          const results: SearchResult[] = [];

          const matchedPatients = patients
            .filter(
              (p) =>
                normalize(p.name).includes(q) ||
                normalize(p.phone).includes(q) ||
                normalize(p.id).includes(q),
            )
            .slice(0, 4)
            .map((p) => ({
              type: "Patient" as const,
              id: p.id,
              label: normalize(p.name) ? p.name : p.id,
              sub: normalize(p.phone) ? p.phone : p.id,
              path: "/patients",
            }));
          results.push(...matchedPatients);

          const matchedBookings = bookings
            .filter((b) => {
              const patient = patients.find((p) => p.id === b.patientId);
              return (
                normalize(b.bookingId).includes(q) ||
                normalize(patient?.name).includes(q)
              );
            })
            .slice(0, 3)
            .map((b) => {
              const patient = patients.find((p) => p.id === b.patientId);
              return {
                type: "Booking" as const,
                id: b.id,
                label: normalize(b.bookingId) ? b.bookingId : b.id,
                sub: normalize(patient?.name)
                  ? patient!.name
                  : "Unknown patient",
                path: "/bookings",
              };
            });
          results.push(...matchedBookings);

          const matchedTests = tests
            .filter(
              (t) =>
                normalize(t.name).includes(q) ||
                normalize(t.category).includes(q),
            )
            .slice(0, 3)
            .map((t) => ({
              type: "Test" as const,
              id: t.id,
              label: normalize(t.name) ? t.name : t.id,
              sub: normalize(t.category) ? t.category : "Uncategorized",
              path: "/tests",
            }));
          results.push(...matchedTests);

          const matchedLabs = outsourceLabs
            .filter(
              (l) =>
                normalize(l.name).includes(q) ||
                normalize(l.contactPerson).includes(q) ||
                normalize(l.phone).includes(q),
            )
            .slice(0, 2)
            .map((l) => ({
              type: "Lab" as const,
              id: l.id,
              label: normalize(l.name) ? l.name : l.id,
              sub:
                [
                  normalize(l.contactPerson) ? l.contactPerson : "",
                  normalize(l.phone) ? l.phone : "",
                ]
                  .filter(Boolean)
                  .join(" • ") || "No contact info",
              path: "/outsource",
            }));
          results.push(...matchedLabs);

          return results;
        })()
      : [];

  const groups = [
    {
      key: "Patient" as const,
      label: "PATIENTS",
      results: searchResults.filter((r) => r.type === "Patient"),
    },
    {
      key: "Booking" as const,
      label: "BOOKINGS",
      results: searchResults.filter((r) => r.type === "Booking"),
    },
    {
      key: "Test" as const,
      label: "TESTS",
      results: searchResults.filter((r) => r.type === "Test"),
    },
    {
      key: "Lab" as const,
      label: "LABS",
      results: searchResults.filter((r) => r.type === "Lab"),
    },
  ].filter((g) => g.results.length > 0);

  const showDropdown = showSearch && searchQuery.trim().length > 1;

  function handleResultClick(path: string) {
    setSearchQuery("");
    setShowSearch(false);
    navigate({ to: path });
  }

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
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
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

            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
                {isSearching && (
                  <div className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </div>
                )}

                {!isSearching && groups.length > 0 && (
                  <div>
                    {groups.map((group, gi) => (
                      <div key={group.key}>
                        {gi > 0 && (
                          <div className="border-t border-gray-100 mt-1" />
                        )}
                        <div className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                          {group.label}
                        </div>
                        {group.results.map((r) => (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => handleResultClick(r.path)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-left"
                            data-ocid="layout.search_input"
                          >
                            <span
                              className={cn(
                                "text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0",
                                TYPE_BADGE[r.type],
                              )}
                            >
                              {r.type}
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {r.label}
                              </div>
                              <div className="text-xs text-gray-400 truncate">
                                {r.sub}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {!isSearching && groups.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <Search className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm font-medium text-gray-500">
                      No results found
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Try a different name, ID, or phone
                    </p>
                  </div>
                )}
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
