'use client';

import React, { useState } from 'react';

const SECTIONS = [
  { id: 'overview', title: 'Overview', icon: '🏨' },
  { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
  { id: 'daily-operations', title: 'Daily Operations (Board)', icon: '📋' },
  { id: 'global-tracker', title: 'Global Task Tracker', icon: '📊' },
  { id: 'scheduled-activities', title: 'Scheduled Activities', icon: '📅' },
  { id: 'empty-rooms', title: 'Empty Rooms — Live', icon: '🛏️' },
  { id: 'facility-inventory', title: 'Facility Inventory', icon: '🏗️' },
  { id: 'scheduling-engine', title: 'Auto-Generation (Engine)', icon: '⚙️' },
  { id: 'shift-handoffs', title: 'Shift Handoffs', icon: '🔄' },
  { id: 'chatbot', title: 'Chatbot Assistant', icon: '🤖' },
  { id: 'activity-history', title: 'Activity History & Revert', icon: '📜' },
  { id: 'incomplete-followup', title: 'Incomplete Tasks & Follow-Ups', icon: '⚠️' },
  { id: 'review-queue', title: 'Review Queue', icon: '🔍' },
  { id: 'security', title: 'Security & Permissions', icon: '🔒' },
];

export default function GuideBook({ darkMode }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [search, setSearch] = useState('');

  const filteredSections = SECTIONS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const h2 = 'text-lg font-black font-serif-display text-slate-900 dark:text-slate-100 mt-8 mb-3';
  const h3 = 'text-sm font-bold text-slate-800 dark:text-slate-200 mt-5 mb-2';
  const p = 'text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-3';
  const code = 'font-mono text-[#e05a47] dark:text-[#ffa394] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs';
  const tip = 'rounded-xl border-l-4 border-emerald-500 bg-emerald-500/5 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 mb-4';
  const warn = 'rounded-xl border-l-4 border-amber-500 bg-amber-500/5 px-4 py-3 text-sm text-slate-600 dark:text-slate-300 mb-4';

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Sidebar Table of Contents */}
      <aside className={`lg:w-64 flex-shrink-0 rounded-2xl border p-4 h-fit lg:sticky lg:top-6 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search sections..."
          className={`w-full rounded-xl px-3 py-2 text-sm outline-none border mb-4 ${darkMode ? 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400'}`}
        />
        <nav className="space-y-0.5">
          {filteredSections.map(s => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm transition-all ${
                activeSection === s.id
                  ? darkMode ? 'bg-white/10 text-white font-semibold' : 'bg-slate-100 text-slate-900 font-semibold'
                  : darkMode ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span className="mr-2">{s.icon}</span>
              {s.title}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 min-w-0">
        <section className={`rounded-[28px] border p-5 shadow-sm backdrop-blur-xl md:p-8 ${darkMode ? 'border-white/10 bg-[#1a1d23]/75' : 'border-white/70 bg-white/70'}`}>
          <h1 className="text-2xl font-black font-serif-display tracking-tight text-slate-900 dark:text-slate-100 mb-1">
            Operations Tracker — Usage Guide
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
            Complete reference for every feature. Last updated: July 2026.
          </p>

          {/* ── OVERVIEW ────────────────────────────────────────────────── */}
          {activeSection === 'overview' && (
            <div>
              <h2 className={h2}>What is the Operations Tracker?</h2>
              <p className={p}>
                The Azzurro Operations Tracker is a single dashboard for managing cleaning, maintenance, facility inventory, shift handoffs, 
                and empty-room monitoring across all six Azzurro properties in Sydney. It replaces spreadsheets and manual checklists with 
                a structured, auditable system.
              </p>

              <h2 className={h2}>Properties Covered</h2>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 mb-4">
                {[
                  ['Darling Harbour', '176 beds', '22 Allen Street'],
                  ['Central Sydney', '48 beds', '90 Wentworth Avenue'],
                  ['Surry Hills', '72 beds', '82 Flinders Street'],
                  ['Potts Point', '107 beds', '141 Victoria Street'],
                  ['Olympic Hotel', '30 rooms', '308 Moore Park'],
                  ['Pyrmont Budget', '14 rooms', '11 Pyrmont Bridge'],
                ].map(([name, cap, addr]) => (
                  <div key={name} className={`rounded-xl p-3 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{name}</p>
                    <p className="text-[10px] text-slate-400">{cap}</p>
                    <p className="text-[9px] text-slate-500">{addr}</p>
                  </div>
                ))}
              </div>

              <h2 className={h2}>Key Concepts</h2>
              <ul className={`space-y-2 ${p}`}>
                <li><strong>Source of Truth:</strong> Cloudbeds API provides real-time occupancy. The tracker reads from it — it never alters occupancy data.</li>
                <li><strong>Audit Trail:</strong> Every meaningful change creates an immutable log entry. Changes can be viewed, traced, and reverted.</li>
                <li><strong>Property-Code Mapping:</strong> Each property has a stable code (e.g., <span className={code}>DARLING_HARBOUR</span>, <span className={code}>CENTRAL_SYDNEY</span>) used internally to link rooms, bathrooms, and tasks.</li>
                <li><strong>Time Zone:</strong> All dates and times use <strong>Australia/Sydney</strong> — not your browser&apos;s local time.</li>
                <li><strong>Scheduling Engine:</strong> Automated task generation handles bathroom rotation, vent cleaning batches, and daily facility tasks.</li>
              </ul>
            </div>
          )}

          {/* ── GETTING STARTED ─────────────────────────────────────────── */}
          {activeSection === 'getting-started' && (
            <div>
              <h2 className={h2}>First-Time Setup</h2>
              <ol className={`list-decimal list-inside space-y-3 ${p}`}>
                <li><strong>Create an account:</strong> An administrator must create user accounts via the signup page. Each account needs a role: <span className={code}>administrator</span>, <span className={code}>manager</span>, <span className={code}>cleaner</span>, <span className={code}>bed_maker</span>, <span className={code}>night_shift</span>, or <span className={code}>viewer</span>.</li>
                <li><strong>Configure Cloudbeds:</strong> Set the 5 <span className={code}>CB_KEY_*</span> environment variables on the server with valid Cloudbeds API keys.</li>
                <li><strong>Import inventory:</strong> Run <span className={code}>node scripts/import-inventory.js</span> to populate rooms and bathrooms from the canonical data set.</li>
                <li><strong>Review conflicts:</strong> Open the Review Queue to check property counts, missing rooms, and unverified bathroom assignments.</li>
                <li><strong>Generate tasks:</strong> Use the <strong>Scheduled Activities</strong> page and click <strong>Gen Bathrooms</strong>, <strong>Gen Vents</strong>, and <strong>Gen Daily</strong> to create the first round of automated tasks.</li>
              </ol>

              <h2 className={h2}>Navigation</h2>
              <p className={p}>The left sidebar is organized into expandable sections. Click a section header to expand its sub-items.</p>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>Sprint Board</strong> — Kanban view of generic tasks (drag-and-drop between columns)</li>
                <li><strong>Trackers</strong> — Global Task Tracker, Scheduled Activities, Empty Rooms — Live</li>
                <li><strong>Facility Inventory</strong> — All Facilities, Property Overview, Room Inventory, Bathroom Inventory, Review Queue</li>
                <li><strong>Shift Handoffs</strong> — Create and acknowledge handoff notes between shifts</li>
                <li><strong>Activity History</strong> — Full audit log with revert capability</li>
                <li><strong>Usage Guide</strong> — This documentation</li>
              </ul>
              <p className={p}>The <strong>floating chatbot button</strong> (🤖) in the bottom-right opens the AI assistant.</p>
            </div>
          )}

          {/* ── DAILY OPERATIONS ────────────────────────────────────────── */}
          {activeSection === 'daily-operations' && (
            <div>
              <h2 className={h2}>Sprint Board (Kanban View)</h2>
              <p className={p}>
                The Sprint Board shows generic operational tasks in four columns: <strong>To do</strong>, <strong>In progress</strong>, <strong>Review</strong>, and <strong>Done</strong>. 
                Drag any card between columns to change its status.
              </p>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Filter by property using the chips below the header</li>
                <li>Cards show due dates, urgency indicators, and recurrence labels</li>
                <li>Right-click a card (or use the context menu) for <strong>Edit</strong>, <strong>Follow-up</strong> (copy WhatsApp message), or <strong>Delete</strong></li>
                <li>Click the bell icon to set a reminder with configurable snooze</li>
                <li>The floating pill at the bottom-center lets you switch between Board and Tracker views, toggle dark mode, create tasks, and export reports</li>
              </ul>
              <div className={tip}>
                <strong>Tip:</strong> Use the Board for ad-hoc management tasks, research items, and procurement. Use <strong>Scheduled Activities</strong> for recurring cleaning and maintenance work.
              </div>
            </div>
          )}

          {/* ── GLOBAL TRACKER ──────────────────────────────────────────── */}
          {activeSection === 'global-tracker' && (
            <div>
              <h2 className={h2}>Global Task Tracker</h2>
              <p className={p}>
                A table view of all generic tasks across all properties. This is the spreadsheet-style equivalent of the Board view — 
                same data, different layout. Use it for quick scanning and bulk operations.
              </p>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Use the date presets (<strong>Today</strong>, <strong>Next 7 Days</strong>, <strong>Last 30 Days</strong>, <strong>All time</strong>) to filter</li>
                <li>Change status or recurrence inline via dropdown menus</li>
                <li><strong>Copy Report</strong> generates a formatted text report for WhatsApp/email</li>
                <li><strong>Export to Word</strong> generates a .doc file with all active tasks grouped by property</li>
                <li>Click any task row to open the detail modal with the update thread</li>
              </ul>
              <div className={tip}>
                <strong>Tip:</strong> Use the Tracker for your daily stand-up review. Copy the report and paste it into WhatsApp for the team.
              </div>
            </div>
          )}

          {/* ── SCHEDULED ACTIVITIES ────────────────────────────────────── */}
          {activeSection === 'scheduled-activities' && (
            <div>
              <h2 className={h2}>Scheduled Activities</h2>
              <p className={p}>
                The core cleaning and maintenance schedule. All tasks here are structured — they have a property, category, 
                scheduled date, shift, assignee, and audit trail. Unlike the Board, these tasks are part of the scheduling engine.
              </p>

              <h3 className={h3}>Task Statuses</h3>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 mb-4">
                {[
                  ['scheduled', 'Task is planned but not yet started'],
                  ['in_progress', 'Cleaner or staff has started work'],
                  ['completed', 'Task finished with optional completion notes'],
                  ['incomplete', 'Task was not finished — a reason is required'],
                  ['cancelled', 'Task no longer needed'],
                  ['overdue', 'Past due date with no update (auto-flagged)'],
                ].map(([s, d]) => (
                  <div key={s} className={`rounded-xl p-2 text-center ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{s}</p>
                    <p className="text-[10px] text-slate-400">{d}</p>
                  </div>
                ))}
              </div>

              <h3 className={h3}>Task Categories</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>bathroom_deep_clean</strong> — Deep cleaning of a specific bathroom</li>
                <li><strong>vent_cleaning</strong> — Vent/fan cleaning (3-4 bathrooms per session)</li>
                <li><strong>general_cleaning</strong> — Kitchens, laundry, reception, common areas</li>
                <li><strong>night_shift</strong> — Overnight tasks</li>
                <li><strong>cockroach_spraying</strong> — Pest spraying for empty rooms only</li>
                <li><strong>ac_check</strong> — Air conditioner checks</li>
                <li><strong>hardware_check</strong> — Bed frames, curtain rods, general hardware</li>
                <li><strong>supplies</strong> — Laundry pods, Go-key batteries, cleaning stock</li>
                <li><strong>bed_frame_check</strong> — Check and tighten bed frames</li>
                <li><strong>curtain_rod_check</strong> — Check and tighten curtain rods</li>
              </ul>

              <h3 className={h3}>How to Create a Task</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>Open <strong>Scheduled Activities</strong> from the Trackers menu</li>
                <li>Click the <strong>New Task</strong> button in the sidebar or floating pill</li>
                <li>Fill in: title, category, property, assignee, date, shift, description</li>
                <li>Or use the <strong>chatbot</strong>: just type &quot;Schedule bathroom 3 at Darling Harbour for deep clean tomorrow&quot;</li>
              </ol>

              <h3 className={h3}>Using the Generation Buttons</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>Gen Bathrooms:</strong> Automatically assigns one bathroom per cleaner per day, prioritizing bathrooms that haven&apos;t been deep-cleaned the longest. Existing tasks for the same bathroom on the same day are skipped.</li>
                <li><strong>Gen Vents:</strong> Creates vent-cleaning tasks for 3-4 bathrooms per session, scheduled on Mondays and Wednesdays by default (configurable). Tracks which vents were last cleaned.</li>
                <li><strong>Gen Daily:</strong> Creates general cleaning tasks for kitchens, laundry areas, reception, common areas, and laundry lint filters based on the facility inventory.</li>
              </ul>

              <div className={warn}>
                <strong>Important:</strong> Generation is idempotent — running it twice won&apos;t create duplicate tasks. Each task uses a deterministic key based on category + property + facility + date + shift.
              </div>
            </div>
          )}

          {/* ── EMPTY ROOMS ─────────────────────────────────────────────── */}
          {activeSection === 'empty-rooms' && (
            <div>
              <h2 className={h2}>Empty Rooms — Live</h2>
              <p className={p}>
                Real-time room availability data pulled from the Cloudbeds API. This is the source of truth — occupancy data 
                comes directly from Cloudbeds and cannot be modified through the tracker.
              </p>

              <h3 className={h3}>How It Works</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>The tracker calls Cloudbeds API for each property (5 parallel requests with 400ms stagger)</li>
                <li>It fetches: tonight&apos;s reservations, room assignments, dashboard data</li>
                <li>It calculates: occupied beds, beds available, occupancy %, empty rooms</li>
                <li>Blocked rooms, test rooms, private rooms, and hotel-mode rooms are filtered appropriately</li>
                <li>Results are grouped by property and displayed with capacity/occupancy stats</li>
              </ol>

              <h3 className={h3}>What Each Card Shows</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>Property name</strong> with total capacity</li>
                <li><strong>Occupied / Available / %</strong> — current occupancy snapshot</li>
                <li><strong>Room grid:</strong> each empty room shown with its room type</li>
                <li><strong>Auth Failed</strong> badge — appears when API keys are missing for a property</li>
                <li><strong>Data Suspect</strong> badge — appears when the API returned inconsistent data (e.g., 0 occupied but physically busy)</li>
              </ul>

              <h3 className={h3}>Syncing and Task Generation</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>Sync Now:</strong> Manually refresh all properties. This also saves empty-room snapshots to the database.</li>
                <li><strong>Cockroach spraying tasks:</strong> Only empty rooms are eligible. The chatbot can generate spraying tasks: &quot;Create cockroach-spraying tasks tonight for every empty room at Darling Harbour.&quot;</li>
                <li><strong>Cron:</strong> Configure a server cron job to sync every 30 minutes during business hours.</li>
              </ul>
              <div className={warn}>
                <strong>Important:</strong> Cloudbeds is the source of truth. You cannot change occupancy data through this tracker. 
                If Cloudbeds shows a room as occupied, spraying tasks will not be generated for it.
              </div>
            </div>
          )}

          {/* ── FACILITY INVENTORY ──────────────────────────────────────── */}
          {activeSection === 'facility-inventory' && (
            <div>
              <h2 className={h2}>Facility Inventory</h2>
              <p className={p}>
                The Facility Inventory holds all rooms, bathrooms, kitchens, laundry areas, and other facilities across every property. 
                This data feeds the scheduling engine — bathrooms are scheduled based on this inventory, not hardcoded lists.
              </p>

              <h3 className={h3}>Sub-Views</h3>
              <ul className={`list-disc list-inside space-y-2 ${p}`}>
                <li><strong>All Facilities:</strong> Add and manage individual facilities (bathrooms, kitchens, fridges, vents, AC units, bed frames, curtain rods, Go-key devices, laundry-pod stations). Each facility has a type, property, floor, notes, and verification status.</li>
                <li><strong>Property Overview:</strong> Cards showing each property&apos;s declared vs computed room/bed/bathroom counts. Red badges highlight conflicts.</li>
                <li><strong>Room Inventory:</strong> Grid of every room across all properties. Shows room number, bed count, floor, bathroom arrangement (ensuite/detached/shared), and special flags (owner-occupied, no-cleaning, fridge).</li>
                <li><strong>Bathroom Inventory:</strong> Every bathroom facility listed with type (ensuite, detached private, shared full, shared toilet, shared shower, combined, multi-fixture), floor, location, shower/toilet counts, and maintenance notes.</li>
                <li><strong>Review Queue:</strong> All conflicts between declared totals and what was actually imported, plus the manual follow-up checklist.</li>
              </ul>

              <h3 className={h3}>Verification Statuses</h3>
              <ul className={`space-y-1 ${p}`}>
                <li><span className={code}>verified</span> — Confirmed accurate by an administrator</li>
                <li><span className={code}>imported_unverified</span> — Imported from the canonical data set but not yet verified on-site</li>
                <li><span className={code}>needs_review</span> — Flagged for review (e.g., Bathroom A1 floor mismatch at Olympic)</li>
                <li><span className={code}>conflicting_data</span> — Counts don&apos;t match declared totals</li>
                <li><span className={code}>needs_verification</span> — Newly added facility, not yet checked</li>
              </ul>

              <div className={tip}>
                <strong>Tip:</strong> The Facility Inventory must be accurate for the scheduling engine to work correctly. Missing bathrooms 
                mean they won&apos;t appear in deep-clean rotations. Unverified facilities still work — they just carry a visible badge.
              </div>
            </div>
          )}

          {/* ── SCHEDULING ENGINE ───────────────────────────────────────── */}
          {activeSection === 'scheduling-engine' && (
            <div>
              <h2 className={h2}>Auto-Generation Engine</h2>
              <p className={p}>
                The scheduling engine is a server-side service that automatically generates cleaning and maintenance tasks. 
                It runs on demand (via UI buttons or chatbot) and can be triggered by cron jobs.
              </p>

              <h3 className={h3}>Bathroom Deep-Clean Rotation</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Searches all active bathrooms (excluding owner-occupied and no-cleaning)</li>
                <li>Sorts by <strong>last deep-cleaned date</strong> — oldest first (nulls = never cleaned = highest priority)</li>
                <li>Assigns <strong>one bathroom per cleaner per day</strong> by default (configurable via <span className={code}>bathroomsPerCleaner</span>)</li>
                <li>Each generated task uses a deterministic recurrence key to prevent duplicates</li>
                <li>Updates <span className={code}>lastDeepCleanedAt</span> on each bathroom so they exit the priority queue</li>
              </ul>

              <h3 className={h3}>Vent Cleaning</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Default schedule: <strong>Monday and Wednesday</strong> (configurable)</li>
                <li>Covers <strong>3-4 bathrooms per session</strong> (configurable)</li>
                <li>Generates tasks <strong>2 weeks ahead</strong> (configurable)</li>
                <li>Prioritizes bathrooms whose vents haven&apos;t been cleaned in 3+ days</li>
                <li>Default assignment priority: cleaner → bed maker → night shift</li>
              </ul>

              <h3 className={h3}>Daily Automated Tasks</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Creates general cleaning tasks for all registered kitchens, laundry areas, reception, common areas, and laundry lint filters</li>
                <li>Uses each facility&apos;s <span className={code}>defaultTaskFrequency</span> (e.g., <span className={code}>daily:1:days</span>)</li>
                <li>Marks source as <span className={code}>generatedSource: &apos;scheduler&apos;</span> for traceability</li>
              </ul>

              <h3 className={h3}>Empty-Room Task Generation</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Creates tasks only for rooms that Cloudbeds reports as empty</li>
                <li>Skips occupied rooms (cockroach spraying must not target occupied rooms)</li>
                <li>Uses deterministic keys to prevent duplicate tasks for the same room on the same night</li>
                <li>Categories: <span className={code}>cockroach_spraying</span>, <span className={code}>ac_check</span>, <span className={code}>night_shift</span></li>
              </ul>

              <div className={warn}>
                <strong>Idempotency Guarantee:</strong> Re-running any generator will never create duplicate tasks. 
                Each generated task is identified by a key combining category + property + facility + date + shift.
              </div>
            </div>
          )}

          {/* ── SHIFT HANDOFFS ──────────────────────────────────────────── */}
          {activeSection === 'shift-handoffs' && (
            <div>
              <h2 className={h2}>Shift Handoffs</h2>
              <p className={p}>
                A clear accountability system for passing tasks and notes between shifts. When a manager prepares a handoff, 
                the receiving shift sees exactly what needs to be done — with who prepared it and when.
              </p>

              <h3 className={h3}>Creating a Handoff</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>Open <strong>Shift Handoffs</strong> from the sidebar</li>
                <li>Click <strong>+ New Handoff</strong></li>
                <li>Select: property, from-shift, to-shift (e.g., afternoon → night)</li>
                <li>Write the handoff notes — what needs to be done, what was completed, follow-ups needed</li>
                <li>Optionally link specific task IDs (comma-separated)</li>
                <li>Click <strong>Create Handoff</strong></li>
              </ol>

              <h3 className={h3}>Receiving a Handoff</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>The incoming shift sees unacknowledged handoffs with an amber badge</li>
                <li>Click <strong>Acknowledge</strong> to confirm receipt</li>
                <li>Acknowledged handoffs turn green and record who acknowledged and when</li>
              </ol>

              <h3 className={h3}>Shifts</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>morning</strong> — Early shift</li>
                <li><strong>afternoon</strong> — Mid-day shift</li>
                <li><strong>night</strong> — Evening/night shift</li>
                <li><strong>overnight</strong> — Late overnight shift</li>
              </ul>
            </div>
          )}

          {/* ── CHATBOT ──────────────────────────────────────────────────── */}
          {activeSection === 'chatbot' && (
            <div>
              <h2 className={h2}>Chatbot Assistant (🤖)</h2>
              <p className={p}>
                The floating chatbot uses DeepSeek AI to let you query and update the tracker using natural language. 
                All actions go through a controlled action system — the AI cannot execute raw SQL, shell commands, or direct API calls.
              </p>

              <h3 className={h3}>How It Works</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>Type your request in natural language</li>
                <li>The server sends your message + minimal context to DeepSeek</li>
                <li>DeepSeek returns a structured JSON action</li>
                <li>The action is validated against a strict Zod schema</li>
                <li>Your permissions are checked</li>
                <li>The action executes and logs to the audit trail</li>
                <li>Dangerous actions (bulk task creation, reverts) require explicit confirmation</li>
              </ol>

              <h3 className={h3}>Example Commands</h3>
              <div className={`rounded-xl p-4 mb-4 font-mono text-xs ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}`}>
                <p className="mb-2">&quot;Show all shared bathrooms at Darling Harbour.&quot;</p>
                <p className="mb-2">&quot;Schedule bathroom 3 at Allen for deep cleaning tomorrow and assign to Maria.&quot;</p>
                <p className="mb-2">&quot;Mark the Potts Point kitchen deep clean as incomplete — cleaner was too busy.&quot;</p>
                <p className="mb-2">&quot;Create cockroach-spraying tasks tonight for every empty room at Darling Harbour.&quot;</p>
                <p className="mb-2">&quot;Which cleaners did not update their tasks yesterday?&quot;</p>
                <p className="mb-2">&quot;Show all owner-occupied rooms at Olympic Hotel.&quot;</p>
                <p className="mb-2">&quot;Revert the last schedule change I made.&quot;</p>
                <p>&quot;Show me the review queue for Central Sydney.&quot;</p>
              </div>

              <h3 className={h3}>Actions Requiring Confirmation</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Creating tasks for every room across properties</li>
                <li>Generating bathroom or vent cleaning tasks in bulk</li>
                <li>Reverting changes</li>
                <li>Syncing empty rooms</li>
                <li>Generating daily automated tasks for all properties</li>
              </ul>

              <div className={warn}>
                <strong>Security:</strong> The DeepSeek API key never reaches the browser. Chatbot actions are validated server-side. 
                The AI cannot access Cloudbeds credentials, passwords, or audit logs without proper authorization checks.
              </div>
            </div>
          )}

          {/* ── ACTIVITY HISTORY ────────────────────────────────────────── */}
          {activeSection === 'activity-history' && (
            <div>
              <h2 className={h2}>Activity History & Revert</h2>
              <p className={p}>
                Every meaningful change anywhere in the tracker creates an immutable audit log entry. This includes changes made 
                through the UI, chatbot, automated scheduler, Cloudbeds sync, cron jobs, and revert operations.
              </p>

              <h3 className={h3}>Viewing History</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Filter by entity type (task, facility, scheduled_task, property, shift_handoff, chatbot)</li>
                <li>Filter by source (ui, chatbot, cloudbeds_sync, scheduler, cron, system, revert)</li>
                <li>Each entry shows: timestamp, who made the change, what changed, and why</li>
                <li>Entries from bulk operations share a batch ID</li>
              </ul>

              <h3 className={h3}>Reverting Changes</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>Open <strong>Activity History</strong></li>
                <li>Find the change you want to revert</li>
                <li>Click the <strong>Revert</strong> button next to the entry</li>
                <li>Confirm the revert in the dialog</li>
                <li>A new audit entry is created documenting the revert — the original entry is preserved</li>
              </ol>

              <div className={tip}>
                <strong>What can be reverted:</strong> Scheduled task updates (status, assignee, date), facility updates (name, type, active). 
                Deletions cannot be reverted. Cloudbeds occupancy data is read-only and cannot be reverted through the tracker.
              </div>
            </div>
          )}

          {/* ── INCOMPLETE & FOLLOW-UPS ─────────────────────────────────── */}
          {activeSection === 'incomplete-followup' && (
            <div>
              <h2 className={h2}>Incomplete Tasks & Follow-Ups</h2>
              <p className={p}>
                When a cleaner cannot finish a task, the incomplete workflow kicks in — preserving the original task, 
                capturing the reason, and creating a structured follow-up shift for Brema or an administrator.
              </p>

              <h3 className={h3}>Marking a Task Incomplete</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>On the Scheduled Activities page, find the task</li>
                <li>Click the <strong>Incomplete</strong> button (red)</li>
                <li>A prompt appears: <em>&quot;Why is this task incomplete?&quot;</em></li>
                <li>Enter the reason (e.g., &quot;Too many check-ins, ran out of time&quot;)</li>
                <li>The task status changes to <span className={code}>incomplete</span> and the reason is recorded</li>
              </ol>

              <h3 className={h3}>Creating a Follow-Up (Brema Shift)</h3>
              <ol className={`list-decimal list-inside space-y-2 ${p}`}>
                <li>On an incomplete task, a <strong>Brema Follow-up</strong> button appears (violet)</li>
                <li>Click it and enter the shift duration (default 5 hours)</li>
                <li>A new linked task is created: <span className={code}>[FOLLOW-UP] Original Task Title</span></li>
                <li>The follow-up is assigned to <strong>Brema</strong> on the next available day</li>
                <li>The original task is preserved — both tasks are linked via <span className={code}>parentTaskId</span></li>
                <li>Full audit chain: original creation → incomplete → follow-up creation</li>
              </ol>

              <h3 className={h3}>Missing Updates</h3>
              <p className={p}>
                If a scheduled task hasn&apos;t been updated 8+ hours after its scheduled start, it gets flagged 
                as a missing update. This is detected by the <span className={code}>detectMissingUpdates</span> function, 
                which can be triggered by a cron job.
              </p>

              <h3 className={h3}>Overdue Tasks</h3>
              <p className={p}>
                Scheduled tasks that remain <span className={code}>scheduled</span> or <span className={code}>in_progress</span> 
                past their date are automatically marked as <span className={code}>overdue</span>. A cron job runs 
                <span className={code}>checkOverdueTasks</span> hourly to catch these.
              </p>
            </div>
          )}

          {/* ── REVIEW QUEUE ────────────────────────────────────────────── */}
          {activeSection === 'review-queue' && (
            <div>
              <h2 className={h2}>Review Queue</h2>
              <p className={p}>
                The Review Queue aggregates all inventory discrepancies — declared vs imported counts, conflicting room data, 
                unverified bathroom assignments — and presents them with an actionable manual checklist.
              </p>

              <h3 className={h3}>What Appears Here</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>Property-level count mismatches (rooms, beds, bathrooms)</li>
                <li>Rooms with <span className={code}>verificationStatus: conflicting_data</span> (e.g., Surry Hills Room 18)</li>
                <li>Bathrooms with <span className={code}>verificationStatus: needs_review</span> (e.g., Olympic Bathroom A1)</li>
                <li>Properties with conflicting declared totals</li>
              </ul>

              <h3 className={h3}>Manual Follow-Up Checklist</h3>
              <p className={p}>
                A persistent checklist at the bottom of the Review Queue shows every known data conflict that requires 
                a person to physically verify. These items should be checked off as they are resolved on-site.
              </p>

              <div className={tip}>
                <strong>Tip:</strong> Resolve Review Queue items by visiting the property, checking the actual room or bathroom, 
                then updating the facility or room record with the correct information. The verification status will change automatically.
              </div>
            </div>
          )}

          {/* ── SECURITY ────────────────────────────────────────────────── */}
          {activeSection === 'security' && (
            <div>
              <h2 className={h2}>Security & Permissions</h2>

              <h3 className={h3}>Server-Side Secrets</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li><strong>DeepSeek API key</strong> — stored in <span className={code}>DEEPSEEK_API_KEY</span> env var, never sent to browser</li>
                <li><strong>Cloudbeds API keys</strong> — stored in <span className={code}>CB_KEY_*</span> env vars, server-only</li>
                <li><strong>NextAuth secret</strong> — stored in <span className={code}>NEXTAUTH_SECRET</span>, used for JWT signing</li>
                <li><strong>Audit logs:</strong> passwords, API keys, and access tokens are never written to audit logs</li>
              </ul>

              <h3 className={h3}>Role-Based Access</h3>
              <div className="overflow-x-auto mb-4">
                <table className={`w-full text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  <thead>
                    <tr className={darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}>
                      <th className="p-2 text-left rounded-l-xl">Role</th>
                      <th className="p-2 text-left">Create Tasks</th>
                      <th className="p-2 text-left">Complete Tasks</th>
                      <th className="p-2 text-left">Manage Facilities</th>
                      <th className="p-2 text-left">View History</th>
                      <th className="p-2 text-left">Revert</th>
                      <th className="p-2 text-left">Chatbot Admin</th>
                      <th className="p-2 text-left rounded-r-xl">Config Sync</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['administrator', '✓', '✓', '✓', '✓', '✓', '✓', '✓'],
                      ['manager', '✓', '✓', '✓', '✓', '✓', '✓', '✓'],
                      ['Brema', '✓', '✓', '—', '—', '—', '—', '—'],
                      ['cleaner', '—', '✓', '—', '—', '—', '—', '—'],
                      ['bed_maker', '—', '✓', '—', '—', '—', '—', '—'],
                      ['night_shift', '—', '✓', '—', '—', '—', '—', '—'],
                      ['viewer', '—', '—', '—', '—', '—', '—', '—'],
                    ].map(([role, ...perms]) => (
                      <tr key={role} className="border-t border-slate-200 dark:border-slate-800">
                        <td className="p-2 font-bold">{role}</td>
                        {perms.map((p, i) => (
                          <td key={i} className={`p-2 ${p === '✓' ? 'text-emerald-500' : 'text-slate-400'}`}>{p}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className={h3}>Authorization Rules</h3>
              <ul className={`list-disc list-inside space-y-1 ${p}`}>
                <li>All mutation endpoints (POST/PUT/DELETE) require a valid session</li>
                <li>Chatbot actions check the user&apos;s role before execution</li>
                <li>Bulk and destructive operations require explicit confirmation</li>
                <li>Hiding a button in the UI is not sufficient — authorization is enforced server-side</li>
                <li>Cleaners cannot alter audit history, delete logs, change Cloudbeds credentials, or reassign tasks without permission</li>
              </ul>

              <div className={warn}>
                <strong>Never expose:</strong> DeepSeek API key in browser code, Cloudbeds credentials in client bundles, 
                passwords in audit logs, or stack traces to end users. All are protected server-side.
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}
