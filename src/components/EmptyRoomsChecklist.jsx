import React from "react";
import { Icons } from "./Icons";

const STATUS_STYLES = {
  safe: {
    active:
      "bg-emerald-500 text-white border-emerald-500 shadow-sm shadow-emerald-500/20",
    inactive:
      "border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-emerald-500/50 dark:hover:text-emerald-300",
  },
  danger: {
    active:
      "bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-500/20",
    inactive:
      "border-slate-200 text-slate-500 hover:border-rose-300 hover:text-rose-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-500/50 dark:hover:text-rose-300",
  },
  pending: {
    active:
      "bg-amber-400/90 text-amber-950 border-amber-400 shadow-sm shadow-amber-400/20",
    inactive:
      "border-slate-200 text-slate-500 hover:border-amber-300 hover:text-amber-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-amber-400/50 dark:hover:text-amber-200",
  },
};

function ToggleGroup({
  label,
  options,
  value,
  onChange,
  activeTone = "safe",
  dangerValue,
}) {
  return (
    <div className="min-w-0">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
        {label}
      </p>
      <div className="flex rounded-2xl border border-slate-200/80 bg-white/70 p-1 backdrop-blur-sm dark:border-slate-800 dark:bg-[#16181d]/80">
        {options.map((option) => {
          const tone =
            option.value === dangerValue
              ? "danger"
              : option.value === "Pending"
                ? "pending"
                : activeTone;
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`flex-1 rounded-xl border px-3 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? STATUS_STYLES[tone].active
                  : `bg-transparent ${STATUS_STYLES[tone].inactive}`
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function EmptyRoomsChecklist({
  darkMode,
  properties,
  filterProperty,
  setFilterProperty,
  checklistDate,
  setChecklistDate,
  emptyRoomInput,
  setEmptyRoomInput,
  emptyRooms,
  onAddRoom,
  onToggleStatus,
  onDeleteRoom,
}) {
  return (
    <div className="space-y-6">
      <section
        className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-6 ${
          darkMode
            ? "border-white/10 bg-[#1a1d23]/75"
            : "border-white/70 bg-white/70"
        }`}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex flex-col gap-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              Top Controls
            </span>
            <div>
              <h3 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100">
                Daily Empty Room Checklist
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Track AC, pest spray, cleaning, and lighting room by room
                without the spreadsheet sprawl.
              </p>
            </div>
          </div>

          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Checklist Date
            </span>
            <input
              type="date"
              value={checklistDate}
              onChange={(event) => setChecklistDate(event.target.value)}
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition-colors ${
                darkMode
                  ? "border-slate-700 bg-slate-900/80 text-slate-100 focus:border-indigo-400"
                  : "border-slate-200 bg-white text-slate-800 focus:border-indigo-500"
              }`}
            />
          </label>
        </div>

        <div className="mt-5">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Property Filter
          </span>
          <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
            {properties.map((property) => (
              <button
                key={property}
                type="button"
                onClick={() => setFilterProperty(property)}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-[13px] font-semibold transition-all ${
                  filterProperty === property
                    ? darkMode
                      ? "bg-slate-100 text-slate-900 shadow-sm"
                      : "bg-slate-900 text-white shadow-sm"
                    : darkMode
                      ? "bg-slate-800/70 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "bg-slate-100/85 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900"
                }`}
              >
                {property}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
              Add Empty Room Number
            </span>
            <input
              type="text"
              value={emptyRoomInput}
              onChange={(event) => setEmptyRoomInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onAddRoom();
                }
              }}
              placeholder="e.g. 204"
              className={`rounded-2xl border px-4 py-3 text-sm font-semibold outline-none transition-colors ${
                darkMode
                  ? "border-slate-700 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400"
                  : "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-indigo-500"
              }`}
            />
          </label>

          <button
            type="button"
            onClick={onAddRoom}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-indigo-600/20 transition-all hover:bg-indigo-500"
          >
            <Icons.Plus className="text-[18px]" />
            Add
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {emptyRooms.length === 0 ? (
          <div
            className={`rounded-[28px] border border-dashed p-10 text-center ${
              darkMode
                ? "border-slate-800 bg-[#15181d]/65"
                : "border-slate-200 bg-white/65"
            }`}
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300">
              <Icons.Bed className="text-[28px]" />
            </div>
            <h4 className="mt-4 text-lg font-black font-serif-display text-slate-900 dark:text-slate-100">
              No empty rooms logged yet
            </h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Choose a property, add a room number, and the daily checklist
              will appear here.
            </p>
          </div>
        ) : (
          emptyRooms.map((room) => {
            const hasAttentionFlags = room.ac === "On" || room.light === "On";

            return (
              <article
                key={room.id}
                className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl transition-colors md:p-6 ${
                  hasAttentionFlags
                    ? darkMode
                      ? "border-rose-500/30 bg-rose-500/10"
                      : "border-rose-200 bg-rose-50/90"
                    : darkMode
                      ? "border-white/10 bg-[#1a1d23]/75"
                      : "border-white/70 bg-white/70"
                }`}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${
                          hasAttentionFlags
                            ? "bg-rose-500 text-white"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        <Icons.Bed />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-slate-400">
                          Room Number
                        </p>
                        <h4 className="mt-1 text-2xl font-black font-serif-display text-slate-900 dark:text-slate-100">
                          {room.roomNumber}
                        </h4>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {room.property} • {room.date}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRoom(room.id)}
                      className={`inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2 text-sm font-semibold transition-colors ${
                        darkMode
                          ? "border-rose-500/25 text-rose-300 hover:bg-rose-500/10"
                          : "border-rose-200 text-rose-600 hover:bg-rose-50"
                      }`}
                    >
                      <Icons.Trash />
                      Delete
                    </button>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-4">
                    <ToggleGroup
                      label="AC"
                      value={room.ac}
                      dangerValue="On"
                      options={[
                        { value: "Off", label: "Off" },
                        { value: "On", label: "On" },
                      ]}
                      onChange={(value) => onToggleStatus(room.id, "ac", value)}
                    />
                    <ToggleGroup
                      label="Pest Spray"
                      value={room.pest}
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Done", label: "Done" },
                      ]}
                      onChange={(value) =>
                        onToggleStatus(room.id, "pest", value)
                      }
                    />
                    <ToggleGroup
                      label="Clean"
                      value={room.clean}
                      options={[
                        { value: "Pending", label: "Pending" },
                        { value: "Done", label: "Done" },
                      ]}
                      onChange={(value) =>
                        onToggleStatus(room.id, "clean", value)
                      }
                    />
                    <ToggleGroup
                      label="Light"
                      value={room.light}
                      dangerValue="On"
                      options={[
                        { value: "Off", label: "Off" },
                        { value: "On", label: "On" },
                      ]}
                      onChange={(value) =>
                        onToggleStatus(room.id, "light", value)
                      }
                    />
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}
