"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { PROPERTIES, RESPONSIBLE_USERS, getStatusesConfig } from '../constants';
import { getRecurrenceLabel } from '../utils/recurrence';
import { Icons } from '../components/Icons';
import Sidebar from '../components/Sidebar';
import SprintBoard from '../components/SprintBoard';
import TrackerSheet from '../components/TrackerSheet';
import TaskDetailsModal from '../components/TaskDetailsModal';
import TaskModal from '../components/TaskModal';
import ReminderModal from '../components/ReminderModal';
import ReminderOverlay from '../components/ReminderOverlay';
import FloatingControlPill from '../components/FloatingControlPill';

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

export default function Home() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [activeView, setActiveView] = useState('board');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterProperty, setFilterProperty] = useState('All');
  const [darkMode, setDarkMode] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal Form Inputs
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

  // Reminder Inputs
  const [reminderModalTask, setReminderModalTask] = useState(null);
  const [reminderTimeInput, setReminderTimeInput] = useState('');
  const [snoozeDurationInput, setSnoozeDurationInput] = useState(10);

  // Task Details Modal
  const [selectedDetailsTask, setSelectedDetailsTask] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState('');

  // Hydrate theme and permissions
  useEffect(() => {
    const savedMode = localStorage.getItem('ops_dashboard_dark');
    if (savedMode === 'true') {
      setDarkMode(true);
    }
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
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

  const STATUSES = useMemo(() => getStatusesConfig(darkMode), [darkMode]);

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
        console.error("Failed to trigger browser notification", e);
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
        reminderTriggered: false,
        updates: []
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

  const handleOpenReminderModal = (task) => {
    setReminderModalTask(task);
    setReminderTimeInput(task.reminderTime || getFutureTimeStr(60));
    setSnoozeDurationInput(task.snoozeDuration || 10);
  };

  const handleSaveReminderFromModal = () => {
    if (!reminderTimeInput) {
      showToast("Please enter a valid date and time.");
      return;
    }
    setTasks(prev => prev.map(t => {
      if (t.id === reminderModalTask.id) {
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
    showToast(`Reminder scheduled for "${reminderModalTask.title}".`);
    setReminderModalTask(null);
  };

  const handleRemoveReminderFromModal = () => {
    setTasks(prev => prev.map(t => {
      if (t.id === reminderModalTask.id) {
        return { 
          ...t, 
          reminderActive: false, 
          reminderTime: null, 
          reminderTriggered: false 
        };
      }
      return t;
    }));
    showToast(`Reminders cleared for "${reminderModalTask.title}".`);
    setReminderModalTask(null);
  };

  const handleSnoozeReminder = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const snoozeMinutes = t.snoozeDuration || 10;
        const newTimeStr = getFutureTimeStr(snoozeMinutes);
        showToast(`Reminder snoozed for ${snoozeMinutes}m.`);
        return { 
          ...t, 
          reminderTime: newTimeStr, 
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
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Azzurro Task Reminder!", {
          body: `Time to check: ${task.title} at ${task.property}. Assignee: ${task.responsible}`,
          icon: "/favicon.ico",
          tag: task.id
        });
      } catch (e) {
        console.error("Notification crash", e);
      }
    }
  };

  // Alarm checker loop
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setTasks(prev => {
        let changed = false;
        const nextTasks = prev.map(t => {
          if (t.reminderActive && t.reminderTime && !t.reminderTriggered) {
            const remDate = new Date(t.reminderTime);
            if (now >= remDate) {
              changed = true;
              triggerNotification(t);
              return { ...t, reminderTriggered: true };
            }
          }
          return t;
        });
        return changed ? nextTasks : prev;
      });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateRecurrence = (taskId, newRecurrence) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, recurrence: newRecurrence } : t));
    showToast("Recurrence updated.");
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
    const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', '');
    setTasks(prev => prev.map(t => {
      if (t.id !== task.id) return t;

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
    const nowStr = new Date().toLocaleString('en-GB', {day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute:'2-digit'}).replace(',', '');
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (newStatus === 'Done') {
          // Trigger the standard completion engine
          handleCompleteTask(t);
        }
        return { ...t, status: newStatus, lastUpdated: nowStr };
      }
      return t;
    }));
  };

  const handleCopyFollowUp = (task) => {
    const msg = `Hi ${task.responsible || 'team'}, quick update needed on Azzurro task "${task.title}" at ${task.property}. Can you please let us know how this is going? Thank you!`;
    copyToClipboard(msg, "WhatsApp follow-up template copied to clipboard!");
  };

  const copyToClipboard = (text, successMsg) => {
    navigator.clipboard.writeText(text)
      .then(() => showToast(successMsg || "Copied to clipboard!"))
      .catch(err => {
        console.error("Clipboard failure", err);
        showToast("Failed to copy to clipboard.");
      });
  };

  const copyTrackerData = () => {
    const propertiesToRender = PROPERTIES.filter(p => p !== 'All');
    
    // Group active tasks by property
    const tasksByProperty = {};
    propertiesToRender.forEach(p => {
      tasksByProperty[p] = tasks.filter(t => t.property === p && t.status !== 'Done');
    });

    let text = `========================================\nAZZURRO HOTEL - DAILY OPERATIONS TRACKER REPORT\nDate: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}\n========================================\n\n`;

    propertiesToRender.forEach(prop => {
      text += `📍 ${prop.toUpperCase()}\n`;
      tasksByProperty[prop].forEach(t => {
        const recurrenceStr = t.recurrence && t.recurrence !== 'none' ? ` | Recurrence: ${getRecurrenceLabel(t.recurrence)}` : '';
        text += `  • [${t.status.toUpperCase()}] ${t.title} (Due: ${t.dueDate})\n`;
        text += `    Assignee: ${t.responsible}${recurrenceStr}\n`;
        text += `    Last Update: ${t.lastUpdated}\n`;
        if (t.updates && t.updates.length > 0) {
          text += `    Updates:\n`;
          t.updates.forEach(u => {
            text += `      - [${u.timestamp}] ${u.text}\n`;
          });
        }
        text += `\n`;
      });
      if (tasksByProperty[prop].length === 0) {
        text += `  • All tasks completed or clear for today.\n\n`;
      }
    });

    copyToClipboard(text, "Executive Tracker Report copied to clipboard!");
  };

  const exportToWord = () => {
    const propertiesToRender = PROPERTIES.filter(p => p !== 'All');
    const tasksByProperty = {};
    propertiesToRender.forEach(p => {
      tasksByProperty[p] = tasks.filter(t => t.property === p);
    });

    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <title>Ops Tracker Report</title>
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #333333; margin: 1in; }
        h1 { color: #0a1b33; border-bottom: 2px solid #e3ded0; padding-bottom: 8px; font-size: 20pt; }
        h2 { color: #5c5446; font-size: 14pt; margin-top: 20pt; }
        table { border-collapse: collapse; width: 100%; margin-top: 10px; }
        th, td { border: 1px solid #e3ded0; padding: 10px; text-align: left; }
        th { background-color: #f0ece1; color: #5c5446; font-weight: bold; }
        .status { font-weight: bold; text-transform: uppercase; font-size: 9pt; }
      </style>
    </head>
    <body>
      <h1>AZZURRO HOTEL - DAILY OPERATIONS TRACKER</h1>
      <p>Report Date: ${new Date().toLocaleDateString('en-GB', {day: '2-digit', month: 'short', year: 'numeric'})}</p>`;

    let content = "";
    propertiesToRender.forEach(prop => {
      content += `<h2>📍 Property: ${prop}</h2>`;
      content += `<table>
        <tr>
          <th>Task / Tracker Item</th>
          <th>Assignee</th>
          <th>Status</th>
          <th>Recurrence</th>
          <th>Due Date</th>
        </tr>`;
      
      tasksByProperty[prop].forEach(t => {
        content += `<tr>
          <td><b>${t.title}</b><br/><small style="color:#777">${t.description || ''}</small></td>
          <td>${t.responsible}</td>
          <td class="status">${t.status}</td>
          <td>${getRecurrenceLabel(t.recurrence)}</td>
          <td>${t.dueDate}</td>
        </tr>`;
      });

      if (tasksByProperty[prop].length === 0) {
        content += `<tr><td colspan="5" style="text-align:center; color:#888">No tracked items for this location.</td></tr>`;
      }
      content += `</table>`;
    });

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

  const filteredPropertyTasks = tasks.filter(t => {
    if (filterProperty === 'All') return true;
    return t.property === filterProperty;
  });

  // Calculate live count totals for headers
  const pendingCount = useMemo(() => {
    const todayStr = getTodayStr();
    return tasks.filter(t => t.status !== 'Done' && t.dueDate === todayStr).length;
  }, [tasks]);

  const activeCount = useMemo(() => {
    return tasks.filter(t => t.status !== 'Done').length;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter(t => t.status === 'Done').length;
  }, [tasks]);

  return (
    <div className={`flex h-screen font-sans antialiased overflow-hidden selection:bg-[#dfd7f3] transition-colors duration-300 ${darkMode ? 'bg-[#181614] text-slate-200' : 'bg-[#faf8f5] text-slate-700'}`}>
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/80 backdrop-blur-md text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 animate-fade-in-up border border-white/10">
          <Icons.Check />
          <span className="text-sm font-medium">{toast}</span>
        </div>
      )}

      <Sidebar 
        activeView={activeView}
        setActiveView={setActiveView}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        openCreateTaskModal={openCreateTaskModal}
        handleLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto p-8 relative space-y-8 flex flex-col min-h-0">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-shrink-0">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Task Schedule</span>
            <h2 className="text-3xl font-black font-serif-display leading-tight tracking-tight mt-1">
              Daily Operations
            </h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-8 bg-transparent pr-4">
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Pending Today</span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">{pendingCount}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Active Tasks</span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">{activeCount}</span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Completed</span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">{completedCount}</span>
            </div>
          </div>
        </div>

        {/* Location selector filters bar */}
        <div className="flex flex-col gap-4 flex-shrink-0">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filter by Location</span>
            <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
              {PROPERTIES.map(prop => (
                <button 
                  key={prop}
                  onClick={() => setFilterProperty(prop)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                    filterProperty === prop 
                      ? (darkMode ? 'bg-slate-100 text-slate-900 shadow-sm font-semibold' : 'bg-slate-900 text-white shadow-sm font-semibold') 
                      : (darkMode ? 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white font-medium' : 'bg-slate-100/80 text-slate-650 hover:bg-slate-200/80 hover:text-slate-900 font-medium')
                  }`}
                >
                  {prop}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Inner View Content */}
        <div className="flex-1 min-h-0">
          {activeView === 'board' ? (
            <SprintBoard 
              tasks={tasks}
              statuses={STATUSES}
              darkMode={darkMode}
              filterProperty={filterProperty}
              openEditTaskModal={openEditTaskModal}
              handleDeleteTask={handleDeleteTask}
              handleCopyFollowUp={handleCopyFollowUp}
              handleOpenReminderModal={handleOpenReminderModal}
              setSelectedDetailsTask={setSelectedDetailsTask}
              handleStatusChange={handleStatusChange}
            />
          ) : (
            <TrackerSheet 
              tasks={tasks}
              statuses={STATUSES}
              darkMode={darkMode}
              filterProperty={filterProperty}
              openEditTaskModal={openEditTaskModal}
              handleDeleteTask={handleDeleteTask}
              handleCompleteTask={handleCompleteTask}
              handleCopyFollowUp={handleCopyFollowUp}
              handleOpenReminderModal={handleOpenReminderModal}
              handleStatusChange={handleStatusChange}
              handleUpdateRecurrence={handleUpdateRecurrence}
              showToast={showToast}
              copyTrackerData={copyTrackerData}
              exportToWord={exportToWord}
            />
          )}
        </div>

      </main>

      {/* Floating Center-Bottom Pill Dock */}
      <FloatingControlPill 
        activeView={activeView}
        setActiveView={setActiveView}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        openCreateTaskModal={openCreateTaskModal}
        copyTrackerData={copyTrackerData}
      />

      {/* Task Details & Updates Modal */}
      <TaskDetailsModal 
        selectedDetailsTask={selectedDetailsTask}
        setSelectedDetailsTask={setSelectedDetailsTask}
        newUpdateText={newUpdateText}
        setNewUpdateText={setNewUpdateText}
        handleAddUpdate={handleAddUpdate}
        handleDeleteTask={handleDeleteTask}
        openEditTaskModal={openEditTaskModal}
        darkMode={darkMode}
        statuses={STATUSES}
      />

      {/* Task Creation & Editing Modal Form */}
      <TaskModal 
        taskModalOpen={taskModalOpen}
        setTaskModalOpen={setTaskModalOpen}
        taskModalMode={taskModalMode}
        activeView={activeView}
        taskTitleInput={taskTitleInput}
        setTaskTitleInput={setTaskTitleInput}
        taskDescInput={taskDescInput}
        setTaskDescInput={setTaskDescInput}
        taskPropertyInput={taskPropertyInput}
        setTaskPropertyInput={setTaskPropertyInput}
        taskStatusInput={taskStatusInput}
        setTaskStatusInput={setTaskStatusInput}
        taskResponsibleInput={taskResponsibleInput}
        setTaskResponsibleInput={setTaskResponsibleInput}
        taskDueDateInput={taskDueDateInput}
        setTaskDueDateInput={setTaskDueDateInput}
        taskRecurrenceInput={taskRecurrenceInput}
        setTaskRecurrenceInput={setTaskRecurrenceInput}
        customIntervalInput={customIntervalInput}
        setCustomIntervalInput={setCustomIntervalInput}
        customUnitInput={customUnitInput}
        setCustomUnitInput={setCustomUnitInput}
        handleSaveTask={handleSaveTask}
        darkMode={darkMode}
        statuses={STATUSES}
      />

      {/* Reminder Config Modal */}
      <ReminderModal 
        reminderModalTask={reminderModalTask}
        setReminderModalTask={setReminderModalTask}
        reminderTimeInput={reminderTimeInput}
        setReminderTimeInput={setReminderTimeInput}
        snoozeDurationInput={snoozeDurationInput}
        setSnoozeDurationInput={setSnoozeDurationInput}
        handleSaveReminderFromModal={handleSaveReminderFromModal}
        handleRemoveReminderFromModal={handleRemoveReminderFromModal}
        darkMode={darkMode}
      />

      {/* Alarms Overlay Banners */}
      <ReminderOverlay 
        tasks={tasks}
        handleSnoozeReminder={handleSnoozeReminder}
        handleDismissReminder={handleDismissReminder}
        darkMode={darkMode}
      />

    </div>
  );
}
