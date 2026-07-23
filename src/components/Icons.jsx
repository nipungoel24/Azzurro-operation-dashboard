import React from "react";

export const Icons = {
  Board: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      view_kanban
    </span>
  ),
  Tracker: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      analytics
    </span>
  ),
  Plus: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      add
    </span>
  ),
  Export: ({ className = "mr-2" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      file_download
    </span>
  ),
  Copy: ({ className = "mr-2" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      content_copy
    </span>
  ),
  MessageCircle: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      chat
    </span>
  ),
  Repeat: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[15px] leading-none ${className}`}
    >
      repeat
    </span>
  ),
  Check: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      check
    </span>
  ),
  Bell: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      notifications
    </span>
  ),
  BellSolid: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
      notifications
    </span>
  ),
  ChevronLeft: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      chevron_left
    </span>
  ),
  ChevronRight: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      chevron_right
    </span>
  ),
  ChevronDown: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      expand_more
    </span>
  ),
  Trash: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      delete
    </span>
  ),
  Sun: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      light_mode
    </span>
  ),
  Moon: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      dark_mode
    </span>
  ),
  Bed: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}
    >
      bed
    </span>
  ),
  Wrench: ({ className = "" }) => (
    <span
      className={`material-symbols-outlined select-none text-[18px] leading-none ${className}`}
    >
      build
    </span>
  ),
};
