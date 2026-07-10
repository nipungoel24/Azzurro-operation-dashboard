"use client";

import React, { useState, useMemo, useEffect } from 'react';

// --- MOCK DATA & CONSTANTS ---
const PROPERTIES = [
  "All",
  "Potts Point",
  "Surry Hills",
  "Darling Harbour",
  "Olympic Hotel",
  "Central Sydney",
  "The Pyrmont Budget Hotel"
];

const INITIAL_TASKS = [
  { 
    id: 't1', 
    title: 'Gas and Oil Consulting Agencies', 
    description: 'Create a list of consulting agencies for Oil and Gas across multiple countries.', 
    status: 'To do', 
    property: 'Central Sydney', 
    responsible: 'Sarah J.', 
    dueDate: '2026-07-10', 
    lastUpdated: '07 Jul 2026, 09:50 am', 
    recurrence: 'none', 
    reminderActive: true, 
    reminderTime: '2026-07-10T09:00', 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: [
      { id: 'u_1_1', author: 'alvinrustia@azzurrohotels.com', text: 'Initiated outline checks for European firms.', timestamp: '06 Jul 2026 · 10:30 am' }
    ]
  },
  { 
    id: 't2', 
    title: 'Robotics Partnership Outreach', 
    description: 'Research and contact humanoid robotics companies regarding potential partnerships.', 
    status: 'To do', 
    property: 'Darling Harbour', 
    responsible: 'Mike T.', 
    dueDate: '2026-07-09', 
    lastUpdated: '06 Jul 2026, 08:51 am', 
    recurrence: 'none', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: [
      { id: 'u_2_1', author: 'alvinrustia@azzurrohotels.com', text: 'Identified top 5 robotics vendors in APAC.', timestamp: '05 Jul 2026 · 02:15 pm' }
    ]
  },
  { 
    id: 't3', 
    title: 'Sanitary bins collection', 
    description: 'Contact few sanitary bins collector and ask for quotes.', 
    status: 'In progress', 
    property: 'Potts Point', 
    responsible: 'Elena R.', 
    dueDate: '2026-07-09', 
    lastUpdated: '08 Jul 2026, 10:11 am', 
    recurrence: 'weekly', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: []
  },
  { 
    id: 't4', 
    title: 'Olympic Renovation', 
    description: 'Status of the rooms. See detailed updates in the google sheet.', 
    status: 'In progress', 
    property: 'Olympic Hotel', 
    responsible: 'David B.', 
    dueDate: '2026-07-15', 
    lastUpdated: '08 Jul 2026, 04:56 am', 
    recurrence: 'none', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: []
  },
  { 
    id: 't5', 
    title: 'Cleaning Supplies Price Comparison', 
    description: `Cleaners Warehouse
vs
Bunnings
vs
Star Hygiene
vs
Central Cleaning`, 
    status: 'In progress', 
    property: 'Surry Hills', 
    responsible: 'Sarah J.', 
    dueDate: '2026-07-12', 
    lastUpdated: '07 Jul 2026, 11:40 am', 
    recurrence: 'daily', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: [
      { id: 'u_5_1', author: 'alvinrustia@azzurrohotels.com', text: 'Creating a spreadsheet', timestamp: '04 Jul 2026 · 06:52 am' },
      { id: 'u_5_2', author: 'alvinrustia@azzurrohotels.com', text: 'Contact Person? | Contact numbers | Click and Collect? | Discount? | Delivery? |', timestamp: '04 Jul 2026 · 06:53 am' },
      { id: 'u_5_3', author: 'alvinrustia@azzurrohotels.com', text: `We need to get the price of these items from every shops

1. Bleach 2L, 5L, 20L
2. Spray and Wipe / Disinfectant - 500ml
3. Dishwashing liquid
4. Glass Cleaner
5. Pest Spray - Cockroach spray and insect spray (2 separate sprays)
6. Cleaning Gloves (Disposable)
7. 27L 120L - Bin Liners
8. Toilet Rolls (Jumbo Rolls)
9. Sponge
10. Laundry Pods
11. Laundry Powder`, timestamp: '07 Jul 2026 · 11:25 am' },
      { id: 'u_5_4', author: 'alvinrustia@azzurrohotels.com', text: 'Handed over to Nipun', timestamp: '07 Jul 2026 · 11:40 am' }
    ]
  },
  { 
    id: 't6', 
    title: 'Cross-Border Telehealth Insurance', 
    description: 'Get in touch with Medical Professionals Insurance.', 
    status: 'Review', 
    property: 'The Pyrmont Budget Hotel', 
    responsible: 'Elena R.', 
    dueDate: '2026-07-08', 
    lastUpdated: '03 Jul 2026, 05:02 am', 
    recurrence: 'none', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: []
  },
  { 
    id: 't7', 
    title: 'Credit Repair -> LH Sydney', 
    description: 'Determine the status of the outstanding invoices.', 
    status: 'Review', 
    property: 'Central Sydney', 
    responsible: 'Mike T.', 
    dueDate: '2026-07-09', 
    lastUpdated: '06 Jul 2026, 10:23 am', 
    recurrence: 'none', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: []
  },
  { 
    id: 't8', 
    title: 'Bathrooms Deep Cleaning', 
    description: 'Allen 19 hours - 29 Bathrooms - Approved.', 
    status: 'Review', 
    property: 'Potts Point', 
    responsible: 'David B.', 
    dueDate: '2026-07-09', 
    lastUpdated: '09 Jul 2026, 08:14 am', 
    recurrence: 'daily', 
    reminderActive: false, 
    reminderTime: null, 
    snoozeDuration: 10, 
    reminderTriggered: false,
    updates: []
  },
];

const RESPONSIBLE_USERS = ['Sarah J.', 'Mike T.', 'Elena R.', 'David B.'];

// --- TASK DUE-DATE URGENCY UTILS ---
const getUrgencyLevel = (dueDateStr, status) => {
  if (status === 'Done') return { level: 4, label: 'Completed', colors: ['bg-[#868e65]', 'bg-[#868e65]', 'bg-[#868e65]'] };
  if (!dueDateStr) return { level: 0, label: 'No due date', colors: ['bg-[#dcd8cc]/40', 'bg-[#dcd8cc]/30', 'bg-[#dcd8cc]/20'] };
  
  const today = new Date();
  today.setHours(0,0,0,0);
  const due = new Date(dueDateStr);
  due.setHours(0,0,0,0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { level: 3, label: 'Overdue', colors: ['bg-[#c97f67] animate-pulse', 'bg-[#c97f67] animate-pulse', 'bg-[#c97f67] animate-pulse'] };
  } else if (diffDays === 0) {
    return { level: 3, label: 'Due today', colors: ['bg-[#c97f67]', 'bg-[#c97f67]', 'bg-[#c97f67]'] };
  } else if (diffDays <= 2) {
    return { level: 2, label: 'Due soon', colors: ['bg-[#c49c5e]', 'bg-[#c49c5e]', 'bg-[#dcd8cc]/40'] };
  } else {
    return { level: 1, label: 'Safe', colors: ['bg-[#8ba69b]', 'bg-[#dcd8cc]/40', 'bg-[#dcd8cc]/40'] };
  }
};

// --- TASK RECURRENCE UTILS ---
const getRecurrenceLabel = (recurrenceStr) => {
  if (!recurrenceStr || recurrenceStr === 'none') return 'Once-off';
  if (recurrenceStr === 'daily') return 'Daily';
  if (recurrenceStr === 'weekly') return 'Weekly';
  if (recurrenceStr.startsWith('custom:')) {
    const parts = recurrenceStr.split(':');
    const count = parts[1] || '1';
    const unit = parts[2] || 'days';
    return `Every ${count} ${unit.charAt(0).toUpperCase() + unit.slice(1)}`;
  }
  return recurrenceStr;
};


// --- GOOGLE ICONS (Material Symbols Outlined) ---
const Icons = {
  Board: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>view_kanban</span>,
  Tracker: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>analytics</span>,
  Plus: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>add</span>,
  Export: ({ className = "mr-2" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}>file_download</span>,
  Copy: ({ className = "mr-2" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}>content_copy</span>,
  MessageCircle: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}>chat</span>,
  Repeat: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[15px] leading-none ${className}`}>repeat</span>,
  Check: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}>check</span>,
  Bell: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>notifications</span>,
  BellSolid: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`} style={{ fontVariationSettings: "'FILL' 1" }}>notifications</span>,
  ChevronLeft: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>chevron_left</span>,
  ChevronRight: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>chevron_right</span>,
  Trash: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}>delete</span>,
  Sun: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>light_mode</span>,
  Moon: ({ className = "" }) => <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>dark_mode</span>
};

export default function App() {
  const [activeView, setActiveView] = useState('board');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [toast, setToast] = useState(null);
  
  // Theme State
  const [darkMode, setDarkMode] = useState(false);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Tracker Filters
  const [filterProperty, setFilterProperty] = useState('All');
  const [filterDateRange, setFilterDateRange] = useState('all');

  // Card Context Menu state
  const [cardMenuTaskId, setCardMenuTaskId] = useState(null);

  // Task Modal States
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState('create');
  const [taskModalId, setTaskModalId] = useState('');
  const [taskTitleInput, setTaskTitleInput] = useState('');
  const [taskDescInput, setTaskDescInput] = useState('');
  const [taskPropertyInput, setTaskPropertyInput] = useState('Potts Point');
  const [taskStatusInput, setTaskStatusInput] = useState('To do');
  const [taskResponsibleInput, setTaskResponsibleInput] = useState('Sarah J.');
  const [taskDueDateInput, setTaskDueDateInput] = useState('');
  const [taskRecurrenceInput, setTaskRecurrenceInput] = useState('none');
  const [customIntervalInput, setCustomIntervalInput] = useState(3);
  const [customUnitInput, setCustomUnitInput] = useState('days');

  // Task Details & Updates States
  const [selectedDetailsTask, setSelectedDetailsTask] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState('');

  // Reminder Configuration States
  const [reminderModalTask, setReminderModalTask] = useState(null);
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [snoozeDurationInput, setSnoozeDurationInput] = useState(10);

  // --- MOUNT EFFECT & THEME CHECK ---
  useEffect(() => {
    const savedMode = localStorage.getItem('ops_dashboard_dark');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newVal = !prev;
      localStorage.setItem('ops_dashboard_dark', newVal.toString());
      showToast(`Dark mode ${newVal ? 'enabled' : 'disabled'}.`);
      return newVal;
    });
  };

  // --- STATUS DESIGN SPECIFICATIONS (DYNAMIC BASED ON DARK MODE) ---
  const STATUSES = useMemo(() => [
    { 
      id: 'To do', 
      label: 'To do', 
      brandColor: '#c84ba6',
      badgeBg: darkMode ? 'bg-[#eed8eb]/20' : 'bg-[#eed8eb]/90', 
      badgeText: darkMode ? 'text-[#e4badc]' : 'text-[#8e4883]',
      colBg: darkMode ? 'bg-[#4a2e47]/15 backdrop-blur-[2px]' : 'bg-[#fce5f7]/60 backdrop-blur-[2px]',
      colBorder: darkMode ? 'border-[#8e4883]/25' : 'border-[#f4dbf2]/55',
      trackerRowBg: darkMode ? 'bg-[#4a2e47]/25 border-[#8e4883]/30 text-[#f5d0eb]' : 'bg-[#ffeaf5] border-[#f4dbf2]/50 text-[#8e4883]',
      headerBg: darkMode ? 'bg-[#3b2138]/60' : 'bg-[#fcecf9]/80',
      cardBg: darkMode ? 'bg-[#221822]/95 border-[#8e4883]/20 hover:bg-[#2c1e2c]/95' : 'bg-[#fff8fe]/95 hover:bg-[#fff0fc]/95 border-[#f4dbf2]/30 shadow-xs',
      titleText: darkMode ? 'text-[#f5d0eb]' : 'text-[#8e4883]',
      descText: darkMode ? 'text-[#cfaac7]' : 'text-[#6a5267]',
      divider: darkMode ? 'border-[#8e4883]/25' : 'border-[#f3dced]/40'
    },
    { 
      id: 'In progress', 
      label: 'In progress', 
      brandColor: '#7c5dfa',
      badgeBg: darkMode ? 'bg-[#dfd7f3]/20' : 'bg-[#dfd7f3]/90', 
      badgeText: darkMode ? 'text-[#c6b6eb]' : 'text-[#634e9e]',
      colBg: darkMode ? 'bg-[#342e4a]/15 backdrop-blur-[2px]' : 'bg-[#eae3fc]/60 backdrop-blur-[2px]',
      colBorder: darkMode ? 'border-[#634e9e]/25' : 'border-[#e3dbfa]/55',
      trackerRowBg: darkMode ? 'bg-[#342e4a]/25 border-[#634e9e]/30 text-[#dfd7f3]' : 'bg-[#f0ebff] border-[#e3dbfa]/50 text-[#634e9e]',
      headerBg: darkMode ? 'bg-[#252037]/60' : 'bg-[#f0eafc]/80',
      cardBg: darkMode ? 'bg-[#1b1728]/90 border-[#634e9e]/20 hover:bg-[#252037]/95' : 'bg-[#f8f5ff]/95 hover:bg-[#f2edff]/95 border-[#e3dbfa]/30 shadow-xs',
      titleText: darkMode ? 'text-[#dfd7f3]' : 'text-[#634e9e]',
      descText: darkMode ? 'text-[#b9b2d3]' : 'text-[#55506a]',
      divider: darkMode ? 'border-[#634e9e]/25' : 'border-[#decffa]/40'
    },
    { 
      id: 'Review', 
      label: 'Review', 
      brandColor: '#e29c09',
      badgeBg: darkMode ? 'bg-[#ffe8b3]/20' : 'bg-[#ffe8b3]/90', 
      badgeText: darkMode ? 'text-[#f5d278]' : 'text-[#a37c10]',
      colBg: darkMode ? 'bg-[#713f12]/15 backdrop-blur-[2px]' : 'bg-[#fef0c7]/60 backdrop-blur-[2px]',
      colBorder: darkMode ? 'border-[#a37c10]/25' : 'border-[#fde68a]/55',
      trackerRowBg: darkMode ? 'bg-[#713f12]/25 border-[#a37c10]/30 text-[#ffe8b3]' : 'bg-[#fffbeb] border-[#fde68a]/50 text-[#a37c10]',
      headerBg: darkMode ? 'bg-[#40260e]/60' : 'bg-[#fff9db]/80',
      cardBg: darkMode ? 'bg-[#292215]/90 border-[#a37c10]/20 hover:bg-[#342b1b]/95' : 'bg-[#fffdf2]/95 hover:bg-[#fff9e0]/95 border-[#fde68a]/30 shadow-xs',
      titleText: darkMode ? 'text-[#ffe8b3]' : 'text-[#a37c10]',
      descText: darkMode ? 'text-[#d6c196]' : 'text-[#8c6d32]',
      divider: darkMode ? 'border-[#a37c10]/25' : 'border-[#ffe4b3]/40'
    },
    { 
      id: 'Done', 
      label: 'Done', 
      brandColor: '#10b981',
      badgeBg: darkMode ? 'bg-[#d1fae5]/25' : 'bg-[#d1fae5]/90', 
      badgeText: darkMode ? 'text-[#a7f3d0]' : 'text-[#059669]',
      colBg: darkMode ? 'bg-[#064e3b]/10 backdrop-blur-[2px]' : 'bg-[#d1fae5]/60 backdrop-blur-[2px]',
      colBorder: darkMode ? 'border-[#059669]/25' : 'border-[#a7f3d0]/55',
      trackerRowBg: darkMode ? 'bg-[#064e3b]/25 border-[#059669]/30 text-[#a7f3d0]' : 'bg-[#e6fffa] border-[#a7f3d0]/50 text-[#059669]',
      headerBg: darkMode ? 'bg-[#0f342a]/60' : 'bg-[#d1fae5]/80',
      cardBg: darkMode ? 'bg-[#132c23]/90 border-[#059669]/20 hover:bg-[#1a382d]/95' : 'bg-[#f6fffb]/95 hover:bg-[#eefff6]/95 border-[#a7f3d0]/30 shadow-xs',
      titleText: darkMode ? 'text-[#a7f3d0]' : 'text-[#059669]',
      descText: darkMode ? 'text-[#8fa39a]' : 'text-[#356050]',
      divider: darkMode ? 'border-[#059669]/25' : 'border-[#a7f3d0]/40'
    }
  ], [darkMode]);

  // --- UTILS ---
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Azzurro Operations", {
          body: msg,
          icon: "/favicon.ico",
          tag: "ops-toast"
        });
      } catch (e) {
        console.error("Failed to trigger system browser notification", e);
      }
    }
  };

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const getFutureTimeStr = (minutesOffset = 60) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesOffset);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  // --- CORE TASK CREATION & EDITING LOGIC ---
  const openCreateTaskModal = () => {
    setTaskModalMode('create');
    setTaskModalId('');
    setTaskTitleInput('');
    setTaskDescInput('');
    setTaskPropertyInput(filterProperty === 'All' ? 'Potts Point' : filterProperty);
    setTaskStatusInput('To do');
    setTaskResponsibleInput('Sarah J.');
    setTaskDueDateInput(getTodayStr());
    setTaskRecurrenceInput('none');
    setCustomIntervalInput(3);
    setCustomUnitInput('days');
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskModalMode('edit');
    setTaskModalId(task.id);
    setTaskTitleInput(task.title);
    setTaskDescInput(task.description);
    setTaskPropertyInput(task.property);
    setTaskStatusInput(task.status);
    setTaskResponsibleInput(task.responsible);
    setTaskDueDateInput(task.dueDate);
    if (task.recurrence && task.recurrence.startsWith('custom:')) {
      const parts = task.recurrence.split(':');
      setTaskRecurrenceInput('custom');
      setCustomIntervalInput(parseInt(parts[1], 10) || 3);
      setCustomUnitInput(parts[2] || 'days');
    } else {
      setTaskRecurrenceInput(task.recurrence || 'none');
      setCustomIntervalInput(3);
      setCustomUnitInput('days');
    }
    setTaskModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!taskTitleInput.trim()) {
      showToast("Please enter a task title.");
      return;
    }
    
    const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', '');
    const finalRecurrence = taskRecurrenceInput === 'custom' 
      ? `custom:${customIntervalInput}:${customUnitInput}`
      : taskRecurrenceInput;

    if (taskModalMode === 'create') {
      const newTask = {
        id: 't_' + Date.now().toString(),
        title: taskTitleInput.trim(),
        description: taskDescInput.trim(),
        property: taskPropertyInput,
        status: taskStatusInput,
        responsible: taskResponsibleInput,
        dueDate: taskDueDateInput,
        lastUpdated: nowStr,
        recurrence: finalRecurrence,
        reminderActive: false,
        reminderTime: null,
        reminderTriggered: false
      };
      setTasks(prev => [newTask, ...prev]);
      showToast("New task created successfully!");
    } else {
      setTasks(prev => prev.map(t => {
        if (t.id === taskModalId) {
          return {
            ...t,
            title: taskTitleInput.trim(),
            description: taskDescInput.trim(),
            property: taskPropertyInput,
            status: taskStatusInput,
            responsible: taskResponsibleInput,
            dueDate: taskDueDateInput,
            lastUpdated: nowStr,
            recurrence: finalRecurrence
          };
        }
        return t;
      }));
      showToast("Task updated successfully!");
    }
    setTaskModalOpen(false);
  };

  const handleDeleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast("Task deleted.");
  };

  const handleLogout = () => {
    showToast("Logged out successfully! In-memory session cleared.");
  };

  // --- CORE REMINDER LOGIC ---
  const handleOpenReminderModal = (task) => {
    setReminderModalTask(task);
    setReminderTimeInput(task.reminderTime || getFutureTimeStr(10));
    setSnoozeDurationInput(task.snoozeDuration || 10);
  };

  const handleSaveReminderFromModal = () => {
    if (!reminderTimeInput) {
      showToast("Please select a date and time.");
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === reminderModalTask.id) {
        showToast("Reminder scheduled!");
        return { 
          ...t, 
          reminderActive: true, 
          reminderTime: reminderTimeInput, 
          snoozeDuration: snoozeDurationInput,
          reminderTriggered: false 
        };
      }
      return t;
    }));
    setReminderModalTask(null);
  };

  const handleRemoveReminderFromModal = () => {
    setTasks(prev => prev.map(t => {
      if (t.id === reminderModalTask.id) {
        showToast("Reminder removed.");
        return { 
          ...t, 
          reminderActive: false, 
          reminderTime: null, 
          reminderTriggered: false 
        };
      }
      return t;
    }));
    setReminderModalTask(null);
  };

  const handleSnoozeReminder = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const snoozeMinutes = t.snoozeDuration || 10;
        const newRemTime = new Date();
        newRemTime.setMinutes(newRemTime.getMinutes() + snoozeMinutes);
        
        const tzoffset = newRemTime.getTimezoneOffset() * 60000;
        const localISOTime = new Date(newRemTime.getTime() - tzoffset).toISOString().slice(0, 16);

        showToast(`Snoozed for ${snoozeMinutes} minutes.`);
        return { 
          ...t, 
          reminderTime: localISOTime, 
          reminderActive: true, 
          reminderTriggered: false 
        };
      }
      return t;
    }));
  };

  const handleDismissReminder = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        showToast("Reminder dismissed.");
        return { ...t, reminderActive: false, reminderTriggered: false };
      }
      return t;
    }));
  };

  const triggerNotification = (task) => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.15);
      
      setTimeout(() => {
        const osc2 = audioCtx.createOscillator();
        osc2.connect(gainNode);
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc2.start();
        osc2.stop(audioCtx.currentTime + 0.25);
      }, 150);
    } catch (e) {
      console.log("Audio play blocked", e);
    }

    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(`Operations Board Reminder`, {
          body: `Reminder: "${task.title}" at ${task.property}`,
          icon: "/favicon.ico"
        });
      }
    }
  };

  // Notification Permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Reminder Checker Loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prevTasks => {
        let changed = false;
        const newTasks = prevTasks.map(t => {
          if (t.reminderActive && t.reminderTime && !t.reminderTriggered) {
            const remTime = new Date(t.reminderTime);
            if (now >= remTime) {
              changed = true;
              triggerNotification(t);
              return { ...t, reminderTriggered: true };
            }
          }
          return t;
        });
        return changed ? newTasks : prevTasks;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // --- CORE TASK ACTIONS ---
  const handleUpdateRecurrence = (taskId, newRecurrence) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, recurrence: newRecurrence } : t));
  };

  const handleAddUpdate = () => {
    if (!newUpdateText.trim()) return;
    const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit', hour12: true}).replace(',', ' ·');
    const newUpdate = {
      id: 'u_' + Date.now().toString(),
      author: 'nipun24.goel@gmail.com',
      text: newUpdateText.trim(),
      timestamp: nowStr
    };
    
    setTasks(prev => prev.map(t => {
      if (t.id === selectedDetailsTask.id) {
        const updatedUpdates = t.updates ? [...t.updates, newUpdate] : [newUpdate];
        setSelectedDetailsTask(prevTask => ({ ...prevTask, updates: updatedUpdates }));
        return { ...t, updates: updatedUpdates };
      }
      return t;
    }));
    setNewUpdateText('');
    showToast("Update added!");
  };

  const handleCompleteTask = (task) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== task.id) return t;
      
      const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', '');
      
      if (t.recurrence === 'daily') {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 1);
        showToast(`Task reset! Next due date: ${nextDate.toISOString().split('T')[0]}`);
        return { ...t, status: 'To do', dueDate: nextDate.toISOString().split('T')[0], lastUpdated: nowStr, reminderActive: false, reminderTriggered: false };
      } else if (t.recurrence === 'weekly') {
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + 7);
        showToast(`Task reset! Next due date: ${nextDate.toISOString().split('T')[0]}`);
        return { ...t, status: 'To do', dueDate: nextDate.toISOString().split('T')[0], lastUpdated: nowStr, reminderActive: false, reminderTriggered: false };
      } else if (t.recurrence && t.recurrence.startsWith('custom:')) {
        const parts = t.recurrence.split(':');
        const count = parseInt(parts[1], 10) || 1;
        const unit = parts[2] || 'days';
        
        const nextDate = new Date();
        if (unit === 'days') {
          nextDate.setDate(nextDate.getDate() + count);
        } else if (unit === 'weeks') {
          nextDate.setDate(nextDate.getDate() + (count * 7));
        } else if (unit === 'months') {
          nextDate.setMonth(nextDate.getMonth() + count);
        }
        
        showToast(`Task reset! Next due date: ${nextDate.toISOString().split('T')[0]}`);
        return { ...t, status: 'To do', dueDate: nextDate.toISOString().split('T')[0], lastUpdated: nowStr, reminderActive: false, reminderTriggered: false };
      }
      
      showToast(`Task marked as Done.`);
      return { ...t, status: 'Done', lastUpdated: nowStr, reminderActive: false, reminderTriggered: false };
    }));
  };

  const handleStatusChange = (taskId, newStatus) => {
    if (newStatus === 'Done') {
      const task = tasks.find(t => t.id === taskId);
      if (task) handleCompleteTask(task);
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', '');
        return { ...t, status: newStatus, lastUpdated: nowStr };
      }
      return t;
    }));
  };

  // --- DRAG AND DROP LOGIC (HTML5) ---
  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); 
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      handleStatusChange(taskId, newStatus);
    }
  };

  // --- DATA COMPUTATION ---
  const filteredPropertyTasks = useMemo(() => {
    return tasks.filter(task => {
      return filterProperty === 'All' || task.property === filterProperty;
    });
  }, [tasks, filterProperty]);

  const filteredTrackerTasks = useMemo(() => {
    return filteredPropertyTasks.filter(task => {
      const today = getTodayStr();
      const dateMatch = filterDateRange === 'all' || (filterDateRange === 'today' && task.dueDate === today);
      return dateMatch;
    });
  }, [filteredPropertyTasks, filterDateRange]);

  const stats = useMemo(() => {
    const today = getTodayStr();
    return {
      pendingToday: filteredPropertyTasks.filter(t => t.dueDate === today && t.status !== 'Done').length,
      totalActive: filteredPropertyTasks.filter(t => t.status !== 'Done').length,
      completed: filteredPropertyTasks.filter(t => t.status === 'Done').length
    };
  }, [filteredPropertyTasks]);

  // --- EXPORT & COPY LOGIC ---
  const handleCopyFollowUp = (task) => {
    const text = `Hi ${task.responsible}, just following up on the task: "${task.title}" at ${task.property}. Could you provide a quick update on its status? Thanks!`;
    copyToClipboard(text, `Follow-up text for ${task.responsible} copied!`);
  };

  const copyToClipboard = (text, successMsg) => {
    const textCopyArea = document.createElement("textarea");
    textCopyArea.value = text;
    document.body.appendChild(textCopyArea);
    textCopyArea.focus();
    textCopyArea.select();
    try {
      document.execCommand('copy');
      showToast(successMsg);
    } catch (err) {
      showToast('Failed to copy');
    }
    document.body.removeChild(textCopyArea);
  };

  const copyTrackerData = () => {
    const todayStr = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    let text = `📋 AZZURRO HOTEL - OPERATIONS STATUS REPORT\n`;
    text += `Date: ${todayStr} | Generated at ${timeStr}\n`;
    text += `Location: ${filterProperty === 'All' ? 'All Hotel Locations' : filterProperty}\n`;
    text += `Timeframe Filter: ${filterDateRange === 'all' ? 'All Time' : 'Due Today'}\n`;
    text += `==================================================\n`;
    text += `SUMMARY STATISTICS:\n`;
    text += `• Pending Today: ${stats.pendingToday}\n`;
    text += `• Active Tasks: ${stats.totalActive}\n`;
    text += `• Completed Tasks: ${stats.completed}\n`;
    text += `==================================================\n\n`;

    // Group tasks by location
    const tasksByProperty = {};
    filteredTrackerTasks.forEach(t => {
      if (!tasksByProperty[t.property]) {
        tasksByProperty[t.property] = [];
      }
      tasksByProperty[t.property].push(t);
    });

    const propertiesToRender = Object.keys(tasksByProperty);
    if (propertiesToRender.length === 0) {
      text += `No tasks found matching the active filters.\n`;
    } else {
      propertiesToRender.forEach(prop => {
        text += `📍 ${prop.toUpperCase()}\n`;
        tasksByProperty[prop].forEach(t => {
          const recurrenceStr = t.recurrence && t.recurrence !== 'none' ? ` | Recurrence: ${getRecurrenceLabel(t.recurrence)}` : '';
          text += `  • [${t.status.toUpperCase()}] ${t.title} (Due: ${t.dueDate})\n`;
          text += `    Assignee: ${t.responsible}${recurrenceStr}\n`;
          text += `    Last Update: ${t.lastUpdated}\n`;
        });
        text += `\n`;
      });
    }

    text += `--------------------------------------------------\n`;
    text += `Report generated automatically by Azzurro Operations Dashboard.`;

    copyToClipboard(text, "Executive report summary copied to clipboard!");
  };

  const exportToWord = () => {
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>Operations Export</title>
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; }
      h2 { color: #5a3d2b; }
      table { border-collapse: collapse; width: 100%; margin-top: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2e9e4; color: #4a3b32; }
      .status { font-weight: bold; }
    </style>
    </head><body>`;
    
    let content = `<h2>Operations Task Tracker</h2>`;
    content += `<p><strong>Date Generated:</strong> ${new Date().toLocaleString()}</p>`;
    content += `<p><strong>Filters Applied:</strong> Property: ${filterProperty}, Timeframe: ${filterDateRange}</p>`;
    
    content += `<table>
      <tr><th>Task</th><th>Property</th><th>Status</th><th>Responsible</th><th>Due Date</th></tr>`;
    
    filteredTrackerTasks.forEach(t => {
      content += `<tr>
        <td>${t.title}</td>
        <td>${t.property}</td>
        <td class="status">${t.status}</td>
        <td>${t.responsible}</td>
        <td>${t.dueDate}</td>
      </tr>`;
    });
    content += `</table>`;
    
    const footer = "</body></html>";
    const sourceHTML = header + content + footer;
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `Ops_Tracker_${new Date().toISOString().slice(0,10)}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    showToast("Word document generated.");
  };

  // --- RENDER HELPERS ---
  const renderBoard = () => (
    <div className="flex h-full gap-6 overflow-x-auto pb-24 custom-scrollbar">
      {STATUSES.map(col => {
        const colTasks = filteredPropertyTasks.filter(t => t.status === col.id);
        return (
          <div 
            key={col.id} 
            className={`flex-shrink-0 w-80 flex flex-col ${col.colBg} rounded-2xl border ${col.colBorder} shadow-xs`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Header */}
            <div className={`p-4 border-b ${col.divider} flex justify-between items-center ${col.headerBg} rounded-t-2xl`}>
              <h3 className={`font-bold text-base tracking-tight font-serif-display ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{col.label}</h3>
              <span className={`text-[11px] font-extrabold w-6 h-6 rounded-full flex items-center justify-center ${col.badgeBg} ${col.badgeText}`}>
                {colTasks.length}
              </span>
            </div>

            {/* Cards container */}
            <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {colTasks.length === 0 && (
                <div className={`h-full flex items-center justify-center text-xs border-2 border-dashed rounded-xl py-12 ${darkMode ? 'border-slate-800/80 text-slate-600' : 'border-slate-200/50 text-slate-400'}`}>
                  Drop here
                </div>
              )}
              {colTasks.map(task => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, task.id)}
                  onDragEnd={handleDragEnd}
                  onClick={() => setSelectedDetailsTask(task)}
                  className={`${col.cardBg} p-4 pl-5 rounded-xl shadow-xs border-y border-r border-l-4 cursor-pointer hover:shadow-md transition-all relative overflow-hidden`}
                  style={{ borderLeftColor: col.brandColor }}
                >
                  
                  
                  <div className="flex justify-between items-start gap-2">
                    <h4 className={`font-bold ${col.titleText} text-[14px] leading-snug mb-1`}>{task.title}</h4>
                    
                    {/* Glass Options Dropdown */}
                    <div className="relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardMenuTaskId(cardMenuTaskId === task.id ? null : task.id);
                        }}
                        className={`transition-colors text-xs font-extrabold cursor-pointer px-1.5 py-0.5 rounded ${darkMode ? 'text-slate-600 hover:text-slate-400 hover:bg-slate-850/50' : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100/50'}`}
                      >
                        •••
                      </button>
                      {cardMenuTaskId === task.id && (
                        <div className={`absolute right-0 top-6 w-32 backdrop-blur-lg rounded-lg shadow-lg border z-40 py-1 text-left animate-fade-in ${darkMode ? 'bg-[#15181e]/90 border-slate-800' : 'bg-white/90 border-white/60'}`}>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditTaskModal(task);
                              setCardMenuTaskId(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50/50'}`}
                          >
                            <span className="material-symbols-outlined text-[16px] text-slate-500">edit</span>
                            Edit Task
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopyFollowUp(task);
                              setCardMenuTaskId(null);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors cursor-pointer flex items-center gap-1.5 ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-50/50'}`}
                          >
                            <Icons.MessageCircle />
                            Follow Up
                          </button>
                          <div className={`border-t my-1 ${darkMode ? 'border-slate-800' : 'border-slate-100/60'}`} />
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTask(task.id);
                              setCardMenuTaskId(null);
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs text-red-600 hover:bg-red-50/55 transition-colors cursor-pointer flex items-center gap-1.5 font-semibold"
                          >
                            <Icons.Trash />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className={`${col.descText} text-[12px] line-clamp-3 leading-normal mt-1`}>{task.description}</p>
                  
                  {/* Smart Proximity / Urgency Indicator Bar */}
                  {(() => {
                    const urgency = getUrgencyLevel(task.dueDate, task.status);
                    return (
                      <div className="flex items-center gap-2 my-3" title={`Urgency: ${urgency.label}`}>
                        <div className="flex gap-1">
                          <span className={`h-1.5 w-6 rounded-full transition-all duration-300 ${urgency.colors[0]}`}></span>
                          <span className={`h-1.5 w-10 rounded-full transition-all duration-300 ${urgency.colors[1]}`}></span>
                          <span className={`h-1.5 w-4 rounded-full transition-all duration-300 ${urgency.colors[2]}`}></span>
                        </div>
                        <span className={`text-[9px] font-bold uppercase tracking-wider ${
                          urgency.level === 3 ? 'text-[#c97f67] font-extrabold' :
                          urgency.level === 2 ? 'text-[#c49c5e] font-bold' :
                          urgency.level === 4 ? 'text-[#868e65] font-bold' : 'text-[#8ba69b] font-medium'
                        }`}>
                          {urgency.label}
                        </span>
                      </div>
                    );
                  })()}

                  <div className="flex flex-col gap-2 mt-auto">
                    <div className={`flex justify-between items-center border-t pt-2.5 mt-1 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold leading-none ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>{task.responsible}</span>
                        <span className="text-[10px] text-slate-500 font-semibold mt-1">{task.dueDate}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <button 
                          onClick={() => handleOpenReminderModal(task)}
                          className={`p-1 rounded-full hover:bg-slate-100/50 transition-colors cursor-pointer ${task.reminderActive ? 'text-amber-500' : 'text-slate-400'}`}
                          title="Set Reminder"
                        >
                          {task.reminderActive ? <Icons.BellSolid /> : <Icons.Bell />}
                        </button>
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs ${darkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'}`} title={task.responsible}>
                          {task.responsible.charAt(0)}
                        </span>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderTracker = () => (
    <div className="flex flex-col h-full space-y-6">
      {/* Glass Filters & Actions Bar */}
      <div className={`backdrop-blur-md p-4 rounded-xl border shadow-xs flex flex-col gap-4 ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={`text-[15px] font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Timeframe:</span>
            <select 
              className={`border text-[15px] rounded-md focus:ring-0 block px-3 py-1.5 cursor-pointer outline-none ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-200' : 'bg-white/60 border-slate-200 text-slate-700'}`}
              value={filterDateRange}
              onChange={(e) => setFilterDateRange(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="today">Due Today</option>
            </select>
          </div>
          
          <div className="flex gap-3">
            <button onClick={copyTrackerData} className={`flex items-center px-4 py-2 text-sm font-medium border rounded-md transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white/60 border-slate-200 text-slate-600 hover:bg-slate-100/80'}`}>
              <Icons.Copy /> Copy Text
            </button>
            <button onClick={exportToWord} className="flex items-center px-4 py-2 text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors shadow-sm cursor-pointer border border-transparent">
              <Icons.Export /> Export Word
            </button>
          </div>
        </div>
      </div>

      {/* Glass List View (Table) */}
      <div className={`backdrop-blur-md rounded-xl overflow-hidden shadow-xs flex-1 flex border relative ${darkMode ? 'bg-[#15181e]/60 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
        <div className="flex-1 overflow-x-auto relative">
          <table className="w-full text-sm text-left">
            <thead className={`text-[12px] uppercase font-bold tracking-wider ${darkMode ? 'text-slate-400 bg-slate-900/40 border-b border-slate-800' : 'text-slate-600 bg-slate-100 border-b border-slate-200'}`}>
              <tr>
                <th className="px-6 py-4 font-medium tracking-wide">Task</th>
                <th className="px-6 py-4 font-medium tracking-wide">Property</th>
                <th className="px-6 py-4 font-medium tracking-wide">Status & Recurrence</th>
                <th className="px-6 py-4 font-medium tracking-wide">Due</th>
                <th className="px-6 py-4 font-medium tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrackerTasks.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    No tasks found for selected filters.
                  </td>
                </tr>
              ) : (
                filteredTrackerTasks.map((task) => {
                  const statusConfig = STATUSES.find(s => s.id === task.status) || STATUSES[0];
                  return (
                    <tr 
                      key={task.id} 
                      className={`border-y border-r border-l-4 transition-colors group ${statusConfig.colBorder} ${statusConfig.trackerRowBg} hover:opacity-95 ${task.reminderActive ? (darkMode ? 'bg-amber-955/25 border-amber-900/40' : 'bg-amber-50/25 border-amber-202/40') : ''}`}
                      style={{ borderLeftColor: statusConfig.brandColor }}
                    >
                      <td className="px-6 py-4 w-1/3">
                        <div className={`font-semibold text-[15px] pr-4 ${statusConfig.titleText}`}>{task.title}</div>
                      </td>
                      <td className={`px-6 py-4 w-1/6 text-[13px] font-bold leading-snug ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {task.property}
                      </td>
                      <td className="px-6 py-4 w-1/6">
                        <div className="flex flex-col gap-2 items-start">
                          <div className="relative">
                            <select
                              value={task.status}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className={`px-3 py-1 rounded-md text-[13px] font-semibold cursor-pointer border focus:ring-0 focus:outline-none appearance-none pr-8 w-[120px] ${statusConfig.badgeBg} ${statusConfig.badgeText} border-transparent shadow-xs`}
                            >
                              {STATUSES.map(s => (
                                <option key={s.id} value={s.id} className={`text-[13px] ${darkMode ? 'text-slate-200 bg-slate-900' : 'text-slate-700 bg-white'}`}>
                                  {s.label}
                                </option>
                              ))}
                            </select>
                            <svg className={`w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${statusConfig.badgeText}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                          
                          <div className="flex items-center text-slate-400 hover:text-slate-650 transition-colors relative">
                            <Icons.Repeat />
                            <select 
                              value={task.recurrence && task.recurrence.startsWith('custom:') ? 'custom' : (task.recurrence || 'none')}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'custom') {
                                  openEditTaskModal(task);
                                  showToast("Configure custom recurrence intervals in the details form.");
                                } else {
                                  handleUpdateRecurrence(task.id, val);
                                }
                              }}
                              className="text-[12px] bg-transparent border-none cursor-pointer focus:ring-0 p-0 pl-1.5 pr-4 outline-none appearance-none w-[90px]"
                            >
                              <option value="none">Once-off</option>
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              {task.recurrence && task.recurrence.startsWith('custom:') && (
                                <option value="custom">{getRecurrenceLabel(task.recurrence)}</option>
                              )}
                            </select>
                            <svg className="w-3 h-3 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-4 w-1/6 text-[13px] font-bold ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {task.dueDate}
                      </td>
                      <td className="px-6 py-4 w-1/6 text-right">
                        <div className={`flex justify-end items-center gap-1 transition-opacity ${task.reminderActive ? 'opacity-100' : 'opacity-55 group-hover:opacity-100'}`}>
                           
                           {/* Edit Button */}
                           <button 
                            onClick={() => openEditTaskModal(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-700'}`}
                            title="Edit Task"
                           >
                             <span className="material-symbols-outlined text-[16px]">edit</span>
                           </button>

                           {/* Reminder Bell Button */}
                           <button 
                            onClick={() => handleOpenReminderModal(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${task.reminderActive ? 'text-amber-600 bg-amber-50 hover:bg-amber-100' : (darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-slate-200' : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-700')}`}
                            title={task.reminderActive ? "Edit Reminder" : "Set Reminder"}
                           >
                            {task.reminderActive ? <Icons.BellSolid /> : <Icons.Bell />}
                           </button>

                           {/* Complete Button */}
                           <button 
                            onClick={() => handleCompleteTask(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-green-955/40 hover:text-green-400' : 'text-slate-400 hover:bg-green-50 hover:text-green-705'}`}
                            title="Mark Complete / Trigger Recurrence"
                           >
                            <Icons.Check />
                           </button>
                           
                           {/* Follow Up WhatsApp Message Button */}
                           <button 
                            onClick={() => handleCopyFollowUp(task)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-green-955/40 hover:text-green-400' : 'text-slate-400 hover:bg-green-50 hover:text-green-705'}`}
                            title="Copy WhatsApp message"
                           >
                            <Icons.MessageCircle /> 
                           </button>

                           {/* Delete Button */}
                           <button 
                            onClick={() => handleDeleteTask(task.id)}
                            className={`flex items-center p-2 rounded transition-colors cursor-pointer ${darkMode ? 'text-slate-400 hover:bg-red-950/40 hover:text-red-400' : 'text-slate-400 hover:bg-red-50 hover:text-red-700'}`}
                            title="Delete Task"
                           >
                            <Icons.Trash /> 
                           </button>

                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Scrollbar overlay */}
        <div className="absolute right-2 top-8 bottom-4 w-2.5 bg-slate-100/20 rounded-full pointer-events-none opacity-50 flex flex-col items-center pt-1">
           <svg className="w-2 h-2 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/></svg>
           <div className="w-2.5 bg-slate-400 rounded-full h-1/3 mt-1 shadow-sm"></div>
        </div>

      </div>
    </div>
  );

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden selection:bg-[#dfd7f3] transition-colors duration-300 ${darkMode ? 'bg-[#181614] text-slate-200' : 'bg-[#faf8f5] text-slate-700'}`}>
      
      {/* Glass Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/80 backdrop-blur-md text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <Icons.Check />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      {/* Card Menu Backdrop Catcher */}
      {cardMenuTaskId && (
        <div 
          className="fixed inset-0 z-30 bg-transparent cursor-default" 
          onClick={() => setCardMenuTaskId(null)} 
        />
      )}

      {/* Glass Active Fired Reminders Overlay */}
      {tasks.filter(t => t.reminderTriggered).length > 0 && (
        <div className="fixed top-6 right-6 z-40 flex flex-col gap-3 max-w-sm w-full animate-fade-in-up">
          {tasks.filter(t => t.reminderTriggered).map(task => (
            <div key={task.id} className={`backdrop-blur-lg border p-4 rounded-r-lg shadow-xl flex flex-col gap-2 ${darkMode ? 'bg-[#15181e]/80 border-slate-800' : 'bg-white/70 border-white/40'}`}>
              <div className="flex justify-between items-start">
                <h4 className={`font-bold text-sm leading-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>Reminder: {task.title}</h4>
                <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${darkMode ? 'bg-slate-800 text-slate-350' : 'bg-slate-200/55 text-slate-600'}`}>{task.property}</span>
              </div>
              <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-606'}`}>It's time to check status or follow up with {task.responsible}.</p>
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  onClick={() => handleSnoozeReminder(task.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors cursor-pointer border ${darkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-205/70 text-slate-705 border-slate-200/50'}`}
                >
                  Snooze ({task.snoozeDuration || 10}m)
                </button>
                <button 
                  onClick={() => handleDismissReminder(task.id)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-sm transition-colors cursor-pointer border border-transparent"
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SIDEBAR (Light/Dark Glass Layout) - Retractable width with smooth transition */}
      <aside className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'} backdrop-blur-md border-r flex flex-col z-10 flex-shrink-0 relative ${darkMode ? 'bg-[#24211d]/90 border-[#3d3730] text-[#c2baa9]' : 'bg-[#f0ece1]/90 border-[#e3ded0] text-[#5c5446]'}`}>
        
        {/* Logo/Title Area with Toggle Button */}
        <div className={`transition-all duration-300 flex items-center border-b ${sidebarCollapsed ? 'flex-col gap-3 p-4 py-5 justify-center' : 'flex-row justify-between p-6 py-5'} ${darkMode ? 'border-slate-800/65' : 'border-slate-100/65'}`}>
          {!sidebarCollapsed && (
            <h1 className={`text-[18px] font-black leading-tight tracking-tight animate-fade-in flex items-center gap-2 font-serif-display ${darkMode ? 'text-white' : 'text-slate-900'}`}>
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>A</span>
              Azzurro Hotel
            </h1>
          )}
          {sidebarCollapsed && (
            <h1 className={`text-[20px] font-black leading-tight tracking-tight animate-fade-in w-8 h-8 rounded-lg flex items-center justify-center text-sm font-serif-display ${darkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}>
              A
            </h1>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-800 ${darkMode ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100/60'}`}
            title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {sidebarCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
          </button>
        </div>
        
        <nav className="flex-1 py-6 px-4 space-y-2">
          {!sidebarCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 animate-fade-in">
              Dashboard
            </div>
          )}
          {sidebarCollapsed && (
            <div className={`border-t my-4 mx-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100/60'}`} />
          )}
          
          <button 
            onClick={() => setActiveView('board')}
            className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer ${sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-3 py-2.5'} ${activeView === 'board' ? (darkMode ? 'bg-[#3d3730] text-white font-semibold' : 'bg-[#e3ded0] text-[#5c5446] font-semibold shadow-xs') : (darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]')}`}
            title="Sprint Board"
          >
            <Icons.Board />
            {!sidebarCollapsed && <span className="animate-fade-in">Sprint Board</span>}
          </button>
          
          <button 
            onClick={() => setActiveView('tracker')}
            className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer ${sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-3 py-2.5'} ${activeView === 'tracker' ? (darkMode ? 'bg-[#3d3730] text-white font-semibold' : 'bg-[#e3ded0] text-[#5c5446] font-semibold shadow-xs') : (darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]')}`}
            title="Trackers & Exports"
          >
            <Icons.Tracker />
            {!sidebarCollapsed && <span className="animate-fade-in">Trackers & Exports</span>}
          </button>

          {!sidebarCollapsed && (
            <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 animate-fade-in">
              Actions
            </div>
          )}
          {sidebarCollapsed && (
            <div className={`border-t my-6 mx-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100/60'}`} />
          )}
          
          {/* New Task Trigger */}
          <button 
            onClick={openCreateTaskModal}
            className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer ${sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-3 py-2.5'} ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]'}`}
            title="New Task"
          >
            <Icons.Plus />
            {!sidebarCollapsed && <span className="animate-fade-in">New Task</span>}
          </button>

          {/* Theme Mode Switcher in Sidebar */}
          {!sidebarCollapsed && (
            <button 
              onClick={toggleDarkMode}
              className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer gap-4 px-3 py-2.5 mt-4 ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]'}`}
              title="Toggle Dark Mode"
            >
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              <span className="animate-fade-in">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          )}
        </nav>

        {/* Footer Area retractable view */}
        <div className={`p-4 mt-auto border-t flex flex-col items-start gap-3 ${sidebarCollapsed ? 'py-6 items-center w-full' : 'p-6 pb-8'} ${darkMode ? 'border-slate-800/60' : 'border-slate-200/60'}`}>
           {!sidebarCollapsed && (
             <div className="w-full animate-fade-in flex items-center gap-3">
               <span 
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help flex-shrink-0 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`} 
                title="NG - Logged in as nipun24.goel@gmail.com"
               >
                 NG
               </span>
               <div className="flex-1 min-w-0">
                 <p className="text-[10px] text-slate-400 font-medium leading-none mb-1">Logged in as:</p>
                 <p className={`text-[12px] font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>nipun24.goel@gmail.com</p>
                 <button 
                  onClick={handleLogout}
                  className="text-[11px] text-red-500 hover:text-red-700 transition-colors font-extrabold cursor-pointer mt-1 block"
                 >
                   Logout
                 </button>
               </div>
             </div>
           )}
           {sidebarCollapsed && (
             <div className="flex flex-col items-center gap-4 animate-fade-in">
               <span 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`} 
                title="NG - Logged in as nipun24.goel@gmail.com"
               >
                 NG
               </span>
               
               <button 
                 onClick={toggleDarkMode}
                 className={`p-1.5 rounded transition-colors cursor-pointer text-slate-400 hover:text-slate-800 ${darkMode ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100/60'}`}
                 title="Toggle Dark Mode"
               >
                 {darkMode ? <Icons.Sun /> : <Icons.Moon />}
               </button>

               <button 
                 onClick={handleLogout}
                 className="text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                 title="Logout"
               >
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
               </button>
             </div>
           )}
        </div>
      </aside>

      {/* MAIN CONTENT WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <div className="flex-1 overflow-auto p-10">
          <div className="max-w-6xl mx-auto h-full flex flex-col space-y-6">
            
            {/* Header Title and Stats */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-2 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200/60'}`}>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Task Schedule</p>
                <h2 className={`text-3xl font-extrabold tracking-tight mt-1 font-serif-display ${darkMode ? 'text-white' : 'text-slate-900'}`}>Daily Operations</h2>
              </div>
              
              {/* Minimal Stats Row */}
              <div className={`flex items-center gap-10 ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Today</span>
                  <span className={`text-2xl font-black leading-tight mt-0.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.pendingToday}</span>
                </div>
                <div className={`h-8 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Tasks</span>
                  <span className={`text-2xl font-black leading-tight mt-0.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.totalActive}</span>
                </div>
                <div className={`h-8 w-px ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</span>
                  <span className={`text-2xl font-black leading-tight mt-0.5 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{stats.completed}</span>
                </div>
              </div>
            </div>

            {/* Glass Global Location Filters */}
            <div className={`backdrop-blur-md p-4 rounded-xl border shadow-xs ${darkMode ? 'bg-[#15181e]/40 border-slate-800' : 'bg-white/60 border-slate-200/60'}`}>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">Filter by Location</span>
              <div className="flex flex-wrap gap-2">
                {PROPERTIES.map(prop => (
                  <button
                    key={prop}
                    onClick={() => setFilterProperty(prop)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      filterProperty === prop 
                        ? (darkMode ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold' : 'bg-slate-900 text-white shadow-sm font-semibold') 
                        : (darkMode ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white font-medium' : 'bg-slate-100/80 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 font-medium')
                    }`}
                  >
                    {prop}
                  </button>
                ))}
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1 min-h-0">
               {activeView === 'board' ? renderBoard() : renderTracker()}
            </div>
          </div>
        </div>

        {/* Modern Glass Center-Bottom Pill Dock */}
        <div 
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-30 shadow-lg rounded-full px-6 py-2.5 flex items-center gap-4 transition-all hover:shadow-xl hover:scale-[1.01]"
          style={{
            background: darkMode ? 'rgba(15, 17, 21, 0.35)' : 'rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderColor: darkMode ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.12)',
            borderWidth: '1.5px',
          }}
        >
          {/* View Toggle Icon */}
          <button 
            onClick={() => setActiveView(activeView === 'board' ? 'tracker' : 'board')}
            className={`flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${activeView === 'board' ? (darkMode ? 'text-white bg-white/15' : 'text-slate-900 bg-slate-900/10') : (darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5')}`}
            title={activeView === 'board' ? "Switch to Tracker View" : "Switch to Board View"}
          >
            {activeView === 'board' ? <Icons.Tracker /> : <Icons.Board />}
          </button>

          {/* Quick theme toggler in pill dock */}
          <button 
            onClick={toggleDarkMode}
            className={`flex items-center justify-center p-2 rounded-full transition-all cursor-pointer ${darkMode ? 'text-amber-400 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
          </button>

          <div className={`h-4 w-px ${darkMode ? 'bg-white/10' : 'bg-slate-900/10'}`} />

          {/* Big Add Button in Center (Opens Modal) */}
          <button 
            onClick={openCreateTaskModal}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md hover:scale-105 active:scale-95 cursor-pointer border ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-white/20' : 'bg-slate-900 text-white hover:bg-slate-800 border-transparent'}`}
            title="Add New Task"
          >
            <Icons.Plus />
          </button>

          {/* Copy Report */}
          <button 
            onClick={copyTrackerData}
            className={`flex items-center justify-center p-2 transition-colors rounded-full cursor-pointer ${darkMode ? 'text-slate-400 hover:text-slate-200 hover:bg-white/5' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-900/5'}`}
            title="Copy Report Data"
          >
            <Icons.Copy />
          </button>
        </div>
      </main>

      {/* Glass Task Details & Updates Modal Dialog */}
      {selectedDetailsTask && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
          <div className={`backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl p-6 border flex flex-col max-h-[85vh] animate-fade-in-up ${darkMode ? 'bg-[#1b1917]/95 border-slate-800 text-slate-200' : 'bg-[#fffdfb]/95 border-slate-200/60 text-slate-700'}`}>
            {/* Header */}
            <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-extrabold text-lg font-serif-display text-slate-400 uppercase tracking-wider">
                Task Details
              </h3>
              <button 
                onClick={() => setSelectedDetailsTask(null)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Task Info Area (Scrollable if description is very long) */}
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 custom-scrollbar">
              <div>
                <h2 className="font-extrabold text-xl font-serif-display leading-tight">
                  {selectedDetailsTask.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1 font-semibold">
                  Status: <span className="capitalize">{selectedDetailsTask.status}</span> · Location: {selectedDetailsTask.property} · Assignee: {selectedDetailsTask.responsible}
                </p>
              </div>

              {/* Description box */}
              {selectedDetailsTask.description && (
                <div className={`p-4 rounded-xl border text-sm whitespace-pre-line leading-relaxed ${darkMode ? 'bg-[#292622]/90 border-slate-800/80 text-slate-300' : 'bg-[#faf8f4]/90 border-[#eee3cc]/60 text-[#5c5446]'}`}>
                  {selectedDetailsTask.description}
                </div>
              )}

              {/* Updates Thread */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Updates
                </h4>
                
                <div className="space-y-3">
                  {!selectedDetailsTask.updates || selectedDetailsTask.updates.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No progress updates logged yet.</p>
                  ) : (
                    selectedDetailsTask.updates.map((up) => {
                      const statusConfig = STATUSES.find(s => s.id === selectedDetailsTask.status) || STATUSES[0];
                      return (
                        <div 
                          key={up.id}
                          className={`p-3.5 rounded-lg border-y border-r border-l-4 leading-normal ${darkMode ? 'bg-[#292622]/40 border-slate-850' : 'bg-[#faf8f4]/50 border-slate-200/50'}`}
                          style={{ borderLeftColor: statusConfig.brandColor }}
                        >
                          <p className="text-[10px] font-bold text-slate-400 mb-1">
                            {up.timestamp} · {up.author}
                          </p>
                          <p className={`text-xs whitespace-pre-line leading-relaxed ${darkMode ? 'text-slate-200' : 'text-[#443e35]'}`}>
                            {up.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Add update input block */}
              <div className="flex flex-col gap-2 pt-2 border-t border-slate-500/10">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Add update
                </label>
                <textarea 
                  value={newUpdateText}
                  onChange={(e) => setNewUpdateText(e.target.value)}
                  placeholder="Write the latest progress update..."
                  rows="3"
                  className={`w-full border rounded-lg p-2.5 text-xs outline-none transition-colors resize-none ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-[#5c5446] focus:border-slate-450'}`}
                />
              </div>
            </div>

            {/* Buttons Row */}
            <div className="flex justify-between items-center mt-6 border-t pt-4 border-slate-500/10 flex-shrink-0">
              <button 
                onClick={() => {
                  handleDeleteTask(selectedDetailsTask.id);
                  setSelectedDetailsTask(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Delete
              </button>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    openEditTaskModal(selectedDetailsTask);
                    setSelectedDetailsTask(null);
                  }}
                  className={`px-4 py-2 border font-semibold text-xs rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                >
                  Edit
                </button>
                
                <button 
                  onClick={handleAddUpdate}
                  className={`px-4 py-2 font-semibold text-xs rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                >
                  Add Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glass Create / Edit Task Modal Dialog */}
      {taskModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
          <div className={`backdrop-blur-xl w-full max-w-lg rounded-2xl shadow-2xl p-6 border animate-fade-in-up ${darkMode ? 'bg-[#15181e]/90 border-slate-800 text-slate-200' : 'bg-white/80 border-white/50 text-slate-700'}`}>
            <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-extrabold text-xl font-serif-display">
                {taskModalMode === 'create' ? (activeView === 'board' ? 'Create Sprint Operations Task' : 'Add Location Tracker Item') : 'Edit Item Details'}
              </h3>
              <button 
                onClick={() => setTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-4">
              {/* Task Title */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  {activeView === 'board' ? 'Task Title' : 'Item to Track'}
                </label>
                <input 
                  type="text" 
                  value={taskTitleInput}
                  onChange={(e) => setTaskTitleInput(e.target.value)}
                  placeholder={activeView === 'board' ? "Enter a descriptive task title" : "e.g. Sanitary Bins Collection, Bathrooms Cleaning"}
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 focus:border-slate-400'}`}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea 
                  value={taskDescInput}
                  onChange={(e) => setTaskDescInput(e.target.value)}
                  placeholder={activeView === 'board' ? "Details and specifications about the operations task..." : "Details about the location status, routine checks, or pricing details..."}
                  rows="3"
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors resize-none ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800 focus:border-slate-400'}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Location / Property */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
                  <select 
                    value={taskPropertyInput}
                    onChange={(e) => setTaskPropertyInput(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
                  >
                    {PROPERTIES.filter(p => p !== 'All').map(p => (
                      <option key={p} value={p} className={darkMode ? 'bg-slate-900 text-white' : ''}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Responsible Person */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assignee</label>
                  <select 
                    value={taskResponsibleInput}
                    onChange={(e) => setTaskResponsibleInput(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
                  >
                    {RESPONSIBLE_USERS.map(user => (
                      <option key={user} value={user} className={darkMode ? 'bg-slate-900 text-white' : ''}>{user}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={`grid ${activeView === 'board' ? 'grid-cols-2' : 'grid-cols-3'} gap-4`}>
                {/* Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Status</label>
                  <select 
                    value={taskStatusInput}
                    onChange={(e) => setTaskStatusInput(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
                  >
                    {STATUSES.map(s => (
                      <option key={s.id} value={s.id} className={darkMode ? 'bg-slate-900 text-white' : ''}>{s.label}</option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <input 
                    type="date" 
                    value={taskDueDateInput}
                    onChange={(e) => setTaskDueDateInput(e.target.value)}
                    className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
                  />
                </div>

                {/* Recurrence (Tracker Only) */}
                {activeView !== 'board' && (
                  <div className="flex flex-col gap-1.5 animate-fade-in col-span-1">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Recurrence</label>
                    <select 
                      value={taskRecurrenceInput}
                      onChange={(e) => setTaskRecurrenceInput(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-850 focus:border-slate-400'}`}
                    >
                      <option value="none" className={darkMode ? 'bg-slate-900' : ''}>Once-off</option>
                      <option value="daily" className={darkMode ? 'bg-slate-900' : ''}>Daily</option>
                      <option value="weekly" className={darkMode ? 'bg-slate-900' : ''}>Weekly</option>
                      <option value="custom" className={darkMode ? 'bg-slate-900' : ''}>Custom...</option>
                    </select>
                  </div>
                )}

                {/* Custom Recurrence Interval Sub-Inputs */}
                {activeView !== 'board' && taskRecurrenceInput === 'custom' && (
                  <div className="col-span-full grid grid-cols-2 gap-4 mt-1 p-3.5 rounded-lg border animate-fade-in bg-slate-500/5 border-slate-500/10">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Repeat Every</label>
                      <input 
                        type="number" 
                        min="1"
                        value={customIntervalInput}
                        onChange={(e) => setCustomIntervalInput(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-slate-800 focus:border-slate-400'}`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Time Unit</label>
                      <select 
                        value={customUnitInput}
                        onChange={(e) => setCustomUnitInput(e.target.value)}
                        className={`w-full border rounded-lg p-2 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-white border-slate-200 text-slate-850 focus:border-slate-400'}`}
                      >
                        <option value="days" className={darkMode ? 'bg-slate-900' : ''}>Days</option>
                        <option value="weeks" className={darkMode ? 'bg-slate-900' : ''}>Weeks</option>
                        <option value="months" className={darkMode ? 'bg-slate-900' : ''}>Months</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 border-t pt-4 border-slate-100/60">
              <button 
                onClick={() => setTaskModalOpen(false)}
                className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-slate-100 border-slate-200/40 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSaveTask}
                className={`px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                {taskModalMode === 'create' ? (activeView === 'board' ? 'Create Sprint Task' : 'Add Tracker Item') : 'Save Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Glass Reminder Config Modal */}
      {reminderModalTask && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs ${darkMode ? 'bg-black/45' : 'bg-black/20'}`}>
          <div className={`backdrop-blur-xl w-full max-w-md rounded-2xl shadow-2xl p-6 border animate-fade-in-up ${darkMode ? 'bg-[#15181e]/90 border-slate-800 text-slate-200' : 'bg-white/85 border-white/50 text-slate-700'}`}>
            <div className={`flex justify-between items-center border-b pb-4 mb-4 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <h3 className="font-bold text-xl font-serif-display">Set Task Reminder</h3>
              <button 
                onClick={() => setReminderModalTask(null)}
                className="text-slate-400 hover:text-slate-800 cursor-pointer flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <p className="text-[13px] text-slate-500 mb-4">
              Set a date and time to be reminded about:
              <span className={`block font-bold mt-1 text-[14px] ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>"{reminderModalTask.title}"</span>
            </p>

            <div className="space-y-4">
              {/* Reminder Date/Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Reminder Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={reminderTimeInput}
                  onChange={(e) => setReminderTimeInput(e.target.value)}
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors ${darkMode ? 'bg-slate-800/85 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800'}`}
                />
              </div>

              {/* Snooze duration */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default Snooze Duration</label>
                <select 
                  value={snoozeDurationInput}
                  onChange={(e) => setSnoozeDurationInput(Number(e.target.value))}
                  className={`w-full border rounded-lg p-2.5 text-sm outline-none transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-200 focus:border-slate-600' : 'bg-slate-50/50 border-slate-200 text-slate-800'}`}
                >
                  <option value={5} className={darkMode ? 'bg-slate-900' : ''}>5 minutes</option>
                  <option value={10} className={darkMode ? 'bg-slate-900' : ''}>10 minutes</option>
                  <option value={15} className={darkMode ? 'bg-slate-900' : ''}>15 minutes</option>
                  <option value={30} className={darkMode ? 'bg-slate-900' : ''}>30 minutes</option>
                  <option value={60} className={darkMode ? 'bg-slate-900' : ''}>1 hour</option>
                  <option value={1440} className={darkMode ? 'bg-slate-900' : ''}>1 day</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 justify-end mt-6 border-t pt-4 border-slate-100/60">
              {reminderModalTask.reminderActive && (
                <button
                  onClick={handleRemoveReminderFromModal}
                  className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer mr-auto ${darkMode ? 'bg-red-950/20 border-red-900/50 text-red-400 hover:bg-red-900/40' : 'bg-red-50/50 border-red-100/40 text-red-605 hover:bg-red-100/60'}`}
                >
                  Remove Reminder
                </button>
              )}
              
              <button 
                onClick={() => setReminderModalTask(null)}
                className={`px-4 py-2 border font-semibold text-sm rounded-lg transition-colors cursor-pointer ${darkMode ? 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-700' : 'bg-slate-100 border-slate-200/40 text-slate-600 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSaveReminderFromModal}
                className={`px-4 py-2 font-semibold text-sm rounded-lg shadow-md transition-colors cursor-pointer border border-transparent ${darkMode ? 'bg-slate-100 text-slate-900 hover:bg-slate-205' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Overrides */}
      <style dangerouslySetInnerHTML={{__html: `
        :root {
          --scrollbar-thumb: ${darkMode ? '#475569' : '#cbd5e1'};
        }
        .font-serif-display {
          font-family: var(--font-dm-serif-display), serif;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb); border-radius: 20px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .animate-fade-in-up { animation: fadeInUp 0.3s ease-out forwards; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
