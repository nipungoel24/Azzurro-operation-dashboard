"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { PROPERTIES, RESPONSIBLE_USERS, getStatusesConfig } from "../constants";
import { Icons } from "../components/Icons";
import Sidebar from "../components/Sidebar";
import SprintBoard from "../components/SprintBoard";
import EmptyRoomsLive from "../components/EmptyRoomsLive";
import TaskDetailsModal from "../components/TaskDetailsModal";
import TaskModal from "../components/TaskModal";
import ReminderModal from "../components/ReminderModal";
import ReminderOverlay from "../components/ReminderOverlay";
import FloatingControlPill from "../components/FloatingControlPill";
import FacilityManager from "../components/FacilityManager";
import ScheduleView from "../components/ScheduleView";
import ActivityHistory from "../components/ActivityHistory";
import ShiftHandoffPanel from "../components/ShiftHandoffPanel";
import ChatbotPanel from "../components/ChatbotPanel";
import PropertyInventory from "../components/PropertyInventory";
import RoomInventory from "../components/RoomInventory";
import BathroomInventory from "../components/BathroomInventory";
import ReviewQueue from "../components/ReviewQueue";
import GuideBook from "../components/GuideBook";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

const INITIAL_TASKS = [
  {
    id: "t1",
    title: "Gas and Oil Consulting Agencies",
    description:
      "Create a list of consulting agencies for Oil and Gas across multiple countries.",
    status: "To do",
    property: "Central Sydney",
    responsible: "Sarah J.",
    dueDate: "2026-07-10",
    lastUpdated: "07 Jul 2026, 09:50 am",
    recurrence: "none",
    reminderActive: true,
    reminderTime: "2026-07-10T09:00",
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [
      {
        id: "u_1_1",
        author: "alvinrustia@azzurrohotels.com",
        text: "Initiated outline checks for European firms.",
        timestamp: "06 Jul 2026 · 10:30 am",
      },
    ],
  },
  {
    id: "t2",
    title: "Robotics Partnership Outreach",
    description:
      "Research and contact humanoid robotics companies regarding potential partnerships.",
    status: "To do",
    property: "Darling Harbour",
    responsible: "Mike T.",
    dueDate: "2026-07-09",
    lastUpdated: "06 Jul 2026, 08:51 am",
    recurrence: "none",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [
      {
        id: "u_2_1",
        author: "alvinrustia@azzurrohotels.com",
        text: "Identified top 5 robotics vendors in APAC.",
        timestamp: "05 Jul 2026 · 02:15 pm",
      },
    ],
  },
  {
    id: "t3",
    title: "Sanitary bins collection",
    description: "Contact few sanitary bins collector and ask for quotes.",
    status: "In progress",
    property: "Potts Point",
    responsible: "Elena R.",
    dueDate: "2026-07-09",
    lastUpdated: "08 Jul 2026, 10:11 am",
    recurrence: "weekly",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [],
  },
  {
    id: "t4",
    title: "Olympic Renovation",
    description:
      "Status of the rooms. See detailed updates in the google sheet.",
    status: "In progress",
    property: "Olympic Hotel",
    responsible: "David B.",
    dueDate: "2026-07-15",
    lastUpdated: "08 Jul 2026, 04:56 am",
    recurrence: "none",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [],
  },
  {
    id: "t5",
    title: "Cleaning Supplies Price Comparison",
    description: `Cleaners Warehouse
vs
Bunnings
vs
Star Hygiene
vs
Central Cleaning`,
    status: "In progress",
    property: "Surry Hills",
    responsible: "Sarah J.",
    dueDate: "2026-07-12",
    lastUpdated: "07 Jul 2026, 11:40 am",
    recurrence: "daily",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [
      {
        id: "u_5_1",
        author: "alvinrustia@azzurrohotels.com",
        text: "Creating a spreadsheet",
        timestamp: "04 Jul 2026 · 06:52 am",
      },
      {
        id: "u_5_2",
        author: "alvinrustia@azzurrohotels.com",
        text: "Contact Person? | Contact numbers | Click and Collect? | Discount? | Delivery? |",
        timestamp: "04 Jul 2026 · 06:53 am",
      },
      {
        id: "u_5_3",
        author: "alvinrustia@azzurrohotels.com",
        text: `We need to get the price of these items from every shops

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
11. Laundry Powder`,
        timestamp: "07 Jul 2026 · 11:25 am",
      },
      {
        id: "u_5_4",
        author: "alvinrustia@azzurrohotels.com",
        text: "Handed over to Nipun",
        timestamp: "07 Jul 2026 · 11:40 am",
      },
    ],
  },
  {
    id: "t6",
    title: "Cross-Border Telehealth Insurance",
    description: "Get in touch with Medical Professionals Insurance.",
    status: "Review",
    property: "The Pyrmont Budget Hotel",
    responsible: "Elena R.",
    dueDate: "2026-07-08",
    lastUpdated: "03 Jul 2026, 05:02 am",
    recurrence: "none",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [],
  },
  {
    id: "t7",
    title: "Credit Repair -> LH Sydney",
    description: "Determine the status of the outstanding invoices.",
    status: "Review",
    property: "Central Sydney",
    responsible: "Mike T.",
    dueDate: "2026-07-09",
    lastUpdated: "06 Jul 2026, 10:23 am",
    recurrence: "none",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [],
  },
  {
    id: "t8",
    title: "Bathrooms Deep Cleaning",
    description: "Allen 19 hours - 29 Bathrooms - Approved.",
    status: "Review",
    property: "Potts Point",
    responsible: "David B.",
    dueDate: "2026-07-09",
    lastUpdated: "09 Jul 2026, 08:14 am",
    recurrence: "daily",
    reminderActive: false,
    reminderTime: null,
    snoozeDuration: 10,
    reminderTriggered: false,
    updates: [],
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const getTodayStr = () => new Date().toISOString().split("T")[0];

  const [tasks, setTasks] = useState([]);
  const [activeView, setActiveView] = useState("board");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [filterProperty, setFilterProperty] = useState("All");
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return localStorage.getItem("ops_dashboard_dark") === "true";
  });
  const [toast, setToast] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => () => clearTimeout(toastTimerRef.current), []);

  useEffect(() => {
    if (status !== "authenticated") {
      return undefined;
    }

    let ignore = false;

    async function loadTasks() {
      try {
        const res = await fetch("/api/tasks");
        if (!res.ok || ignore) {
          return;
        }

        const data = await res.json();
        if (!ignore) {
          setTasks(data);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to fetch tasks from database", err);
        }
      }
    }

    loadTasks();

    return () => {
      ignore = true;
    };
  }, [status]);

  const updateTaskInDb = async (taskId, updatedFields) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const savedTask = await res.json();
        setTasks(prev => prev.map(t => t.id === taskId ? savedTask : t));
        if (selectedDetailsTask && selectedDetailsTask.id === taskId) {
          setSelectedDetailsTask(savedTask);
        }
        return savedTask;
      }
    } catch (err) {
      console.error("Network error updating task in DB:", err);
    }
    return null;
  };

  // Modal Form Inputs
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskModalMode, setTaskModalMode] = useState("create");
  const [taskModalId, setTaskModalId] = useState("");
  const [taskTitleInput, setTaskTitleInput] = useState("");
  const [taskDescInput, setTaskDescInput] = useState("");
  const [taskPropertyInput, setTaskPropertyInput] = useState("Potts Point");
  const [taskStatusInput, setTaskStatusInput] = useState("To do");
  const [taskResponsibleInput, setTaskResponsibleInput] = useState("Sarah J.");
  const [taskDueDateInput, setTaskDueDateInput] = useState("");
  const [taskRecurrenceInput, setTaskRecurrenceInput] = useState("none");
  const [customIntervalInput, setCustomIntervalInput] = useState(3);
  const [customUnitInput, setCustomUnitInput] = useState("days");

  // Reminder Inputs
  const [reminderModalTask, setReminderModalTask] = useState(null);
  const [reminderTimeInput, setReminderTimeInput] = useState("");
  const [snoozeDurationInput, setSnoozeDurationInput] = useState(10);

  // Task Details Modal
  const [selectedDetailsTask, setSelectedDetailsTask] = useState(null);
  const [newUpdateText, setNewUpdateText] = useState("");

  // Chatbot state
  const [chatbotOpen, setChatbotOpen] = useState(false);

  // Pill dock generation state
  const [generatingFromPill, setGeneratingFromPill] = useState(null);

  // Schedule export ref
  const scheduleExportRef = useRef(null);

  const handleGenerateFromPill = async (mode) => {
    setGeneratingFromPill(mode);
    try {
      const res = await fetch('/api/scheduled-tasks/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Generated ${data.totalTasks} task(s)`);
      } else {
        showToast(data.error || 'Failed');
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setGeneratingFromPill(null);
    }
  };

  const handleSyncEmptyRooms = async () => {
    setGeneratingFromPill('sync');
    try {
      const res = await fetch('/api/empty-rooms/sync', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast(`Synced: ${data.roomsUpdated || 0} rooms`);
      } else {
        showToast(data.error || 'Sync failed');
      }
    } catch (err) {
      showToast(err.message);
    } finally {
      setGeneratingFromPill(null);
    }
  };

  const handleAddFacility = () => setActiveView('facilities');
  const handleAddHandoff = () => setActiveView('handoffs');

  // Hydrate theme and permissions
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newVal = !prev;
      localStorage.setItem("ops_dashboard_dark", newVal.toString());
      showToast(`Dark mode ${newVal ? "enabled" : "disabled"}.`);
      return newVal;
    });
  };

  const STATUSES = getStatusesConfig(darkMode);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 3000);

    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Azzurro Operations", {
          body: msg,
          icon: "/favicon.ico",
          tag: "ops-toast",
        });
      } catch (e) {
        console.error("Failed to trigger browser notification", e);
      }
    }
  };

  const getFutureTimeStr = (minutesOffset = 60) => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + minutesOffset);
    const tzoffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzoffset).toISOString().slice(0, 16);
  };

  const openCreateTaskModal = () => {
    setTaskModalMode("create");
    setTaskModalId("");
    setTaskTitleInput("");
    setTaskDescInput("");
    setTaskPropertyInput(
      filterProperty === "All" ? "Potts Point" : filterProperty,
    );
    setTaskStatusInput("To do");
    setTaskResponsibleInput("Sarah J.");
    setTaskDueDateInput(getTodayStr());
    setTaskRecurrenceInput("none");
    setCustomIntervalInput(3);
    setCustomUnitInput("days");
    setTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setTaskModalMode("edit");
    setTaskModalId(task.id);
    setTaskTitleInput(task.title);
    setTaskDescInput(task.description);
    setTaskPropertyInput(task.property);
    setTaskStatusInput(task.status);
    setTaskResponsibleInput(task.responsible);
    setTaskDueDateInput(task.dueDate);
    if (task.recurrence && task.recurrence.startsWith("custom:")) {
      const parts = task.recurrence.split(":");
      setTaskRecurrenceInput("custom");
      setCustomIntervalInput(parseInt(parts[1], 10) || 3);
      setCustomUnitInput(parts[2] || "days");
    } else {
      setTaskRecurrenceInput(task.recurrence || "none");
      setCustomIntervalInput(3);
      setCustomUnitInput("days");
    }
    setTaskModalOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitleInput.trim()) {
      showToast("Please enter a task title.");
      return;
    }

    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");
    const finalRecurrence =
      taskRecurrenceInput === "custom"
        ? `custom:${customIntervalInput}:${customUnitInput}`
        : taskRecurrenceInput;

    if (taskModalMode === "create") {
      const newTask = {
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
        updates: [],
      };

      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTask)
        });
        if (res.ok) {
          const savedTask = await res.json();
          setTasks((prev) => [savedTask, ...prev]);
          showToast("New task created successfully!");
        } else {
          const errData = await res.json();
          showToast(`Error: ${errData.error || 'Failed to save'}`);
        }
      } catch (err) {
        showToast("Network error creating task.");
      }
    } else {
      const updatedFields = {
        title: taskTitleInput.trim(),
        description: taskDescInput.trim(),
        property: taskPropertyInput,
        status: taskStatusInput,
        responsible: taskResponsibleInput,
        dueDate: taskDueDateInput,
        lastUpdated: nowStr,
        recurrence: finalRecurrence
      };

      try {
        const res = await fetch(`/api/tasks/${taskModalId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedFields)
        });
        if (res.ok) {
          const savedTask = await res.json();
          setTasks((prev) => prev.map((t) => t.id === taskModalId ? savedTask : t));
          showToast("Task updated successfully!");
        } else {
          const errData = await res.json();
          showToast(`Error: ${errData.error || 'Failed to update'}`);
        }
      } catch (err) {
        showToast("Network error updating task.");
      }
    }
    setTaskModalOpen(false);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        showToast("Task deleted.");
      } else {
        const errData = await res.json();
        showToast(`Error: ${errData.error || 'Failed to delete'}`);
      }
    } catch (err) {
      showToast("Network error deleting task.");
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const handleOpenReminderModal = (task) => {
    setReminderModalTask(task);
    setReminderTimeInput(task.reminderTime || getFutureTimeStr(60));
    setSnoozeDurationInput(task.snoozeDuration || 10);
  };

  const handleSaveReminderFromModal = async () => {
    if (!reminderTimeInput) {
      showToast("Please enter a valid date and time.");
      return;
    }
    const updated = await updateTaskInDb(reminderModalTask.id, {
      reminderActive: true,
      reminderTime: reminderTimeInput,
      snoozeDuration: snoozeDurationInput,
      reminderTriggered: false,
    });
    if (updated) {
      showToast(`Reminder scheduled for "${reminderModalTask.title}".`);
    }
    setReminderModalTask(null);
  };

  const handleRemoveReminderFromModal = async () => {
    const updated = await updateTaskInDb(reminderModalTask.id, {
      reminderActive: false,
      reminderTime: null,
      reminderTriggered: false,
    });
    if (updated) {
      showToast(`Reminders cleared for "${reminderModalTask.title}".`);
    }
    setReminderModalTask(null);
  };

  const handleSnoozeReminder = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const snoozeMinutes = task.snoozeDuration || 10;
    const newTimeStr = getFutureTimeStr(snoozeMinutes);
    const updated = await updateTaskInDb(taskId, {
      reminderTime: newTimeStr,
      reminderTriggered: false,
    });
    if (updated) {
      showToast(`Reminder snoozed for ${snoozeMinutes}m.`);
    }
  };

  const handleDismissReminder = async (taskId) => {
    const updated = await updateTaskInDb(taskId, {
      reminderActive: false,
      reminderTriggered: false,
    });
    if (updated) {
      showToast("Reminder dismissed.");
    }
  };

  const triggerNotification = (task) => {
    if ("Notification" in window && Notification.permission === "granted") {
      try {
        new Notification("Azzurro Task Reminder!", {
          body: `Time to check: ${task.title} at ${task.property}. Assignee: ${task.responsible}`,
          icon: "/favicon.ico",
          tag: task.id,
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
      const toNotify = [];
      setTasks((prev) => {
        let changed = false;
        const nextTasks = prev.map((t) => {
          if (t.reminderActive && t.reminderTime && !t.reminderTriggered) {
            const remDate = new Date(t.reminderTime);
            if (now >= remDate) {
              changed = true;
              toNotify.push(t);
              return { ...t, reminderTriggered: true };
            }
          }
          return t;
        });
        return changed ? nextTasks : prev;
      });
      toNotify.forEach(t => triggerNotification(t));
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const handleUpdateRecurrence = async (taskId, newRecurrence) => {
    const updated = await updateTaskInDb(taskId, { recurrence: newRecurrence });
    if (updated) {
      showToast("Recurrence updated.");
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdateText.trim()) return;
    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " ·");
    const newUpdate = {
      id: "u_" + Date.now().toString(),
      authorName: session?.user?.name || "Anonymous",
      authorEmail: session?.user?.email || "anonymous@azzurrohotels.com",
      text: newUpdateText.trim(),
      timestamp: nowStr,
    };

    const currentUpdates = selectedDetailsTask.updates || [];
    const updatedUpdates = [...currentUpdates, newUpdate];

    const updated = await updateTaskInDb(selectedDetailsTask.id, { updates: updatedUpdates });
    if (updated) {
      setNewUpdateText("");
      showToast("Update added!");
    }
  };

  const handleEditUpdate = async (updateId, newText) => {
    if (!newText.trim()) return;
    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(",", " ·");

    const updatedUpdates = (selectedDetailsTask.updates || []).map((up) => {
      if (up.id === updateId) {
        return {
          ...up,
          text: newText.trim(),
          timestamp: nowStr,
          authorName: session?.user?.name || "Anonymous",
          authorEmail: session?.user?.email || "anonymous@azzurrohotels.com",
        };
      }
      return up;
    });

    const updated = await updateTaskInDb(selectedDetailsTask.id, { updates: updatedUpdates });
    if (updated) {
      showToast("Update saved!");
    }
  };

  const handleCompleteTask = async (task) => {
    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");

    let nextFields = {};
    if (task.recurrence === "daily") {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 1);
      nextFields = {
        status: "To do",
        dueDate: nextDate.toISOString().split("T")[0],
        lastUpdated: nowStr,
        reminderActive: false,
        reminderTriggered: false,
      };
      showToast(
        `Task reset! Next due date: ${nextFields.dueDate}`,
      );
    } else if (task.recurrence === "weekly") {
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + 7);
      nextFields = {
        status: "To do",
        dueDate: nextDate.toISOString().split("T")[0],
        lastUpdated: nowStr,
        reminderActive: false,
        reminderTriggered: false,
      };
      showToast(
        `Task reset! Next due date: ${nextFields.dueDate}`,
      );
    } else if (task.recurrence && task.recurrence.startsWith("custom:")) {
      const parts = task.recurrence.split(":");
      const count = parseInt(parts[1], 10) || 1;
      const unit = parts[2] || "days";

      const nextDate = new Date();
      if (unit === "days") {
        nextDate.setDate(nextDate.getDate() + count);
      } else if (unit === "weeks") {
        nextDate.setDate(nextDate.getDate() + count * 7);
      } else if (unit === "months") {
        nextDate.setMonth(nextDate.getMonth() + count);
      }

      nextFields = {
        status: "To do",
        dueDate: nextDate.toISOString().split("T")[0],
        lastUpdated: nowStr,
        reminderActive: false,
        reminderTriggered: false,
      };
      showToast(
        `Task reset! Next due date: ${nextFields.dueDate}`,
      );
    } else {
      nextFields = {
        status: "Done",
        lastUpdated: nowStr,
        reminderActive: false,
        reminderTriggered: false,
      };
      showToast(`Task marked as Done.`);
    }

    await updateTaskInDb(task.id, nextFields);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    const nowStr = new Date()
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
      .replace(",", "");

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (newStatus === "Done") {
      await handleCompleteTask(task);
    } else {
      await updateTaskInDb(taskId, { status: newStatus, lastUpdated: nowStr });
    }
  };

  const handleCopyFollowUp = (task) => {
    const msg = `Hi ${task.responsible || 'team'} 👋\n\nQuick update needed on the task:\n\n*Task:* ${task.title}\n*Property:* _${task.property}_\n*Status:* ${task.status}\n\nCan you please update on progress? Thank you!`;
    copyToClipboard(msg, "WhatsApp follow-up template copied to clipboard!");
  };

  const copyToClipboard = (text, successMsg) => {
    navigator.clipboard
      .writeText(text)
      .then(() => showToast(successMsg || "Copied to clipboard!"))
      .catch((err) => {
        console.error("Clipboard failure", err);
        showToast("Failed to copy to clipboard.");
      });
  };

  const filteredPropertyTasks = tasks.filter((t) => {
    if (filterProperty === "All") return true;
    return t.property === filterProperty;
  });

  const showStandardFilters = activeView === "board";

  // Calculate live count totals for headers
  const pendingCount = useMemo(() => {
    const todayStr = getTodayStr();
    return tasks.filter((t) => t.status !== "Done" && t.dueDate === todayStr)
      .length;
  }, [tasks]);

  const activeCount = useMemo(() => {
    return tasks.filter((t) => t.status !== "Done").length;
  }, [tasks]);

  const completedCount = useMemo(() => {
    return tasks.filter((t) => t.status === "Done").length;
  }, [tasks]);

  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-[#181614] flex items-center justify-center select-none font-sans">
        <div className="flex flex-col items-center gap-4">
          <svg className="animate-spin h-8 w-8 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-xs font-semibold tracking-widest text-[#a8a090] uppercase animate-pulse">Loading operations dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen font-sans antialiased overflow-hidden selection:bg-[#dfd7f3] transition-colors duration-300 ${darkMode ? "dark bg-[#181614] text-slate-200" : "bg-[#faf8f5] text-slate-700"}`}
    >
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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
              {activeView === "board"
                ? "Task Schedule"
                : activeView === "empty-rooms-live"
                  ? "Cloudbeds Integration"
                  : activeView === "schedule"
                    ? "Cleaning & Maintenance"
                    : activeView === "facilities"
                      ? "Property Infrastructure"
                      : activeView === "handoffs"
                        ? "Shift Management"
                        : activeView === "history"
                          ? "Audit & Compliance"
                          : "Scheduled Activities"}
            </span>
            <h2 className="text-3xl font-black font-serif-display leading-tight tracking-tight mt-1">
              {activeView === "board"
                ? "Daily Operations"
                : activeView === "empty-rooms-live"
                  ? "Empty Rooms — Live"
                  : activeView === "schedule"
                    ? "Scheduled Activities"
                    : activeView === "facilities"
                      ? "Facility Inventory"
                      : activeView === "property-inventory"
                        ? "Property Overview"
                        : activeView === "room-inventory"
                          ? "Room Inventory"
                          : activeView === "bathroom-inventory"
                            ? "Bathroom Inventory"
                            : activeView === "review-queue"
                              ? "Review Queue"
                              : activeView === "handoffs"
                                ? "Shift Handoffs"
                                : activeView === "history"
                                  ? "Activity History"
                                  : "Scheduled Activities"}
            </h2>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-8 bg-transparent pr-4">
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Pending Today
              </span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">
                {pendingCount}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Active Tasks
              </span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">
                {activeCount}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                Completed
              </span>
              <span className="text-2xl font-black font-serif-display text-slate-800 dark:text-slate-100">
                {completedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Location selector filters bar */}
        {showStandardFilters && (
          <div className="flex flex-col gap-4 flex-shrink-0">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Filter by Location
              </span>
              <div className="flex gap-2.5 overflow-x-auto pb-1 custom-scrollbar">
                {PROPERTIES.map((prop) => (
                  <button
                    key={prop}
                    onClick={() => setFilterProperty(prop)}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer ${
                      filterProperty === prop
                        ? darkMode
                          ? "bg-slate-100 text-slate-900 shadow-sm font-semibold"
                          : "bg-slate-900 text-white shadow-sm font-semibold"
                        : darkMode
                          ? "bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white font-medium"
                          : "bg-slate-100/80 text-slate-650 hover:bg-slate-200/80 hover:text-slate-900 font-medium"
                    }`}
                  >
                    {prop}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Dynamic Inner View Content */}
        <div className="flex-1 min-h-0">
          {activeView === "board" ? (
            <div className="flex-1 min-h-0 h-full">
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
            </div>
          ) : activeView === "empty-rooms-live" ? (
            <EmptyRoomsLive darkMode={darkMode} />
          ) : activeView === "schedule" ? (
            <ScheduleView darkMode={darkMode} scheduleExportRef={scheduleExportRef} />
          ) : activeView === "facilities" ? (
            <FacilityManager darkMode={darkMode} />
          ) : activeView === "handoffs" ? (
            <ShiftHandoffPanel darkMode={darkMode} />
          ) : activeView === "history" ? (
            <ActivityHistory darkMode={darkMode} />
          ) : activeView === "property-inventory" ? (
            <PropertyInventory darkMode={darkMode} />
          ) : activeView === "room-inventory" ? (
            <RoomInventory darkMode={darkMode} />
          ) : activeView === "bathroom-inventory" ? (
            <BathroomInventory darkMode={darkMode} />
          ) : activeView === "review-queue" ? (
            <ReviewQueue darkMode={darkMode} />
          ) : activeView === "guide" ? (
            <GuideBook darkMode={darkMode} />
          ) : (
            <ScheduleView darkMode={darkMode} scheduleExportRef={scheduleExportRef} />
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
        onGenerateBathrooms={handleGenerateFromPill}
        onGenerateVents={handleGenerateFromPill}
        onGenerateDaily={handleGenerateFromPill}
        onSyncEmptyRooms={handleSyncEmptyRooms}
        onAddFacility={handleAddFacility}
        onAddHandoff={handleAddHandoff}
        scheduleExportRef={scheduleExportRef}
        generatingState={generatingFromPill}
      />

      {/* Chatbot Toggle Button */}
      <button
        onClick={() => setChatbotOpen(!chatbotOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:shadow-indigo-300/25'}`}
        title="Operations Assistant"
      >
        <span className="material-symbols-outlined select-none text-[26px] leading-none">smart_toy</span>
      </button>

      {chatbotOpen && (
        <ChatbotPanel darkMode={darkMode} onClose={() => setChatbotOpen(false)} />
      )}

      {/* Task Details & Updates Modal */}
      <TaskDetailsModal
        selectedDetailsTask={selectedDetailsTask}
        setSelectedDetailsTask={setSelectedDetailsTask}
        newUpdateText={newUpdateText}
        setNewUpdateText={setNewUpdateText}
        handleAddUpdate={handleAddUpdate}
        handleEditUpdate={handleEditUpdate}
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
