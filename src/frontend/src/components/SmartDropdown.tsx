import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "../lib/utils";

interface Option {
  value: string;
  label: string;
}

interface SmartDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAddNew?: (label: string) => Promise<string>;
  addNewLabel?: string;
  disabled?: boolean;
}

export function SmartDropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  onAddNew,
  addNewLabel = "Add New",
  disabled,
}: SmartDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [adding, setAdding] = useState(false);

  const filtered = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase()),
  );
  const selected = options.find((o) => o.value === value);

  async function handleAddNew() {
    if (!onAddNew) return;
    setAdding(true);
    try {
      const newId = await onAddNew(search);
      onChange(newId);
      setOpen(false);
      setSearch("");
    } finally {
      setAdding(false);
    }
  }

  function handleClose() {
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white hover:border-blue-400 focus:outline-none focus:border-blue-500",
          disabled && "opacity-50 cursor-not-allowed",
        )}
      >
        <span className={selected ? "text-gray-800" : "text-gray-400"}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <>
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click handler */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <input
                // biome-ignore lint/a11y/noAutofocus: intentional dropdown focus
                autoFocus
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-2 py-1.5 text-sm outline-none"
              />
            </div>
            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-2 text-sm text-gray-400">
                  No data found
                </div>
              ) : (
                filtered.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                      setSearch("");
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-blue-50 text-left"
                  >
                    <Check
                      className={cn(
                        "w-3.5 h-3.5",
                        value === o.value ? "text-blue-600" : "opacity-0",
                      )}
                    />
                    {o.label}
                  </button>
                ))
              )}
            </div>
            {onAddNew && (
              <button
                type="button"
                onClick={handleAddNew}
                disabled={adding}
                className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-blue-600 font-medium border-t border-gray-100 hover:bg-blue-50"
              >
                <Plus className="w-4 h-4" />
                {adding
                  ? "Adding..."
                  : `${addNewLabel}${search ? ` "${search}"` : ""}`}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
