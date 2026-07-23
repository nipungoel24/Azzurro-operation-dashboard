import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useSession } from "next-auth/react";

const NavIcon = ({ name, className = "" }) => (
  <span className={`material-symbols-outlined select-none text-[20px] leading-none ${className}`}>
    {name}
  </span>
);

export default function Sidebar({
  activeView,
  setActiveView,
  sidebarCollapsed,
  setSidebarCollapsed,
  darkMode,
  toggleDarkMode,
  openCreateTaskModal,
  handleLogout
}) {
  const { data: session } = useSession();
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@azzurrohotels.com";
  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || "U";

  const [sydneyTime, setSydneyTime] = useState('');
  const [sydneyDate, setSydneyDate] = useState('');
  const [trackersOpen, setTrackersOpen] = useState(false);
  const [facilitiesOpen, setFacilitiesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isFacilitiesActive = ['facilities', 'property-inventory', 'room-inventory', 'bathroom-inventory', 'review-queue'].includes(activeView);

  useEffect(() => {
    if (isFacilitiesActive && !sidebarCollapsed) setFacilitiesOpen(true);
  }, [activeView, sidebarCollapsed]);

  useEffect(() => {
    const updateTime = () => {
      const optionsTime = { timeZone: 'Australia/Sydney', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
      const optionsDate = { timeZone: 'Australia/Sydney', weekday: 'short', month: 'short', day: 'numeric' };
      const formatterTime = new Intl.DateTimeFormat('en-US', optionsTime);
      const formatterDate = new Intl.DateTimeFormat('en-US', optionsDate);
      const now = new Date();
      setSydneyTime(formatterTime.format(now));
      setSydneyDate(formatterDate.format(now));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const sidebarBtn = (active, text, icon) => (
    `w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer ${sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-3 py-2.5'} ${active ? (darkMode ? 'bg-[#3d3730] text-white font-semibold' : 'bg-[#e3ded0] text-[#5c5446] font-semibold shadow-xs') : (darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]')}`
  );

  const subBtn = (active, text, icon) => (
    `w-full flex items-center gap-3 rounded-xl px-3 py-2 text-left text-[13px] transition-all ${active ? (darkMode ? 'bg-white/10 text-white' : 'bg-white text-[#3d3730] shadow-sm') : (darkMode ? 'text-slate-300 hover:bg-white/5 hover:text-white' : 'text-[#877d6c] hover:bg-white/70 hover:text-[#5c5446]')}`
  );

  const handleNav = (view) => { handleNav(view); setMobileOpen(false); };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className={`lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${darkMode ? 'bg-[#24211d] text-slate-300 border border-white/10' : 'bg-white text-slate-700 border border-slate-200'}`}
      >
        <span className="material-symbols-outlined select-none text-xl">{mobileOpen ? 'close' : 'menu'}</span>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'} backdrop-blur-md border-r flex flex-col z-40 flex-shrink-0 relative
        max-lg:fixed max-lg:top-0 max-lg:left-0 max-lg:h-full max-lg:w-64 max-lg:z-50 ${mobileOpen ? 'max-lg:translate-x-0' : 'max-lg:-translate-x-full'} ${darkMode ? 'bg-[#24211d]/95 border-[#3d3730] text-[#c2baa9]' : 'bg-[#f0ece1]/95 border-[#e3ded0] text-[#5c5446]'}`}
      >
      <div className={`transition-all duration-300 flex items-center border-b ${sidebarCollapsed ? 'flex-col gap-3 p-4 py-5 justify-center' : 'flex-row justify-between p-6 py-5'} ${darkMode ? 'border-slate-800/65' : 'border-slate-100/65'}`}>
        {!sidebarCollapsed && (
          <h1 className="text-[20px] font-black leading-tight tracking-tight animate-fade-in font-serif-display select-none">
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
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#3d3730]'}`}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <Icons.ChevronRight /> : <Icons.ChevronLeft />}
        </button>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        {!sidebarCollapsed && (
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 animate-fade-in">Dashboard</div>
        )}
        {sidebarCollapsed && (
          <div className={`border-t my-4 mx-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100/60'}`} />
        )}
        
        <button onClick={() => handleNav('board')} className={sidebarBtn(activeView === 'board', 'Sprint Board')} title="Sprint Board">
          <Icons.Board />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Sprint Board</span>}
        </button>

        {!sidebarCollapsed && (
          <div className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 animate-fade-in">Operations</div>
        )}
        {sidebarCollapsed && (
          <div className={`border-t my-4 mx-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100/60'}`} />
        )}

        <button onClick={() => handleNav("schedule")} className={sidebarBtn(activeView === 'schedule')} title="Scheduled Activities">
          <NavIcon name="calendar_month" />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Scheduled Activities</span>}
        </button>

        <button onClick={() => handleNav("empty-rooms-live")} className={sidebarBtn(activeView === 'empty-rooms-live')} title="Empty Rooms Live">
          <NavIcon name="hotel" />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Empty Rooms — Live</span>}
        </button>

        {/* Facilities Section */}
        <div className="space-y-1">
          <button
            onClick={() => {
              if (sidebarCollapsed) { handleNav('facilities'); return; }
              setFacilitiesOpen(!facilitiesOpen);
              if (!isFacilitiesActive) handleNav('facilities');
            }}
            className={sidebarBtn(isFacilitiesActive, 'Facilities')}
            title="Facility Inventory"
          >
            <NavIcon name="handyman" />
            {!sidebarCollapsed && (
              <>
                <span className="animate-fade-in font-medium flex-1 text-left">Facility Inventory</span>
                <Icons.ChevronDown className={`transition-transform ${facilitiesOpen ? 'rotate-0' : '-rotate-90'}`} />
              </>
            )}
          </button>

          {!sidebarCollapsed && facilitiesOpen && (
            <div className={`ml-4 space-y-1 rounded-2xl border px-2 py-2 mt-1 ${darkMode ? 'border-white/8 bg-white/[0.03]' : 'border-[#e7e1d3] bg-white/40'}`}>
              <button onClick={() => handleNav("facilities")} className={subBtn(activeView === "facilities")}>
                <NavIcon name="construction" />
                <span className="font-medium">All Facilities</span>
              </button>
              <button onClick={() => handleNav("property-inventory")} className={subBtn(activeView === "property-inventory")}>
                <NavIcon name="apartment" />
                <span className="font-medium">Property Overview</span>
              </button>
              <button onClick={() => handleNav("room-inventory")} className={subBtn(activeView === "room-inventory")}>
                <NavIcon name="door_front" />
                <span className="font-medium">Room Inventory</span>
              </button>
              <button onClick={() => handleNav("bathroom-inventory")} className={subBtn(activeView === "bathroom-inventory")}>
                <NavIcon name="shower" />
                <span className="font-medium">Bathroom Inventory</span>
              </button>
              <button onClick={() => handleNav("review-queue")} className={subBtn(activeView === "review-queue")}>
                <NavIcon name="rate_review" />
                <span className="font-medium">Review Queue</span>
              </button>
            </div>
          )}
        </div>

        <button onClick={() => handleNav("handoffs")} className={sidebarBtn(activeView === 'handoffs')} title="Shift Handoffs">
          <NavIcon name="swap_horiz" />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Shift Handoffs</span>}
        </button>

        <button onClick={() => handleNav("history")} className={sidebarBtn(activeView === 'history')} title="Activity History">
          <NavIcon name="history" />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Activity History</span>}
        </button>

        <button onClick={() => handleNav("guide")} className={sidebarBtn(activeView === 'guide')} title="Usage Guide">
          <NavIcon name="book" />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Usage Guide</span>}
        </button>

        {!sidebarCollapsed && (
          <div className="mt-8 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4 px-3 animate-fade-in">Actions</div>
        )}
        {sidebarCollapsed && (
          <div className={`border-t my-6 mx-2 ${darkMode ? 'border-slate-800/60' : 'border-slate-100/60'}`} />
        )}
        
        <button onClick={openCreateTaskModal} className={sidebarBtn(false, 'New Task')} title="New Task">
          <Icons.Plus />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">New Task</span>}
        </button>
      </nav>

      <div className={`p-4 mt-auto border-t flex flex-col items-start gap-3 ${sidebarCollapsed ? 'py-6 items-center w-full' : 'p-6 pb-8'} ${darkMode ? 'border-[#3d3730]' : 'border-[#e3ded0]'}`}>
        {!sidebarCollapsed && (
          <div className="w-full animate-fade-in flex flex-col gap-4">
            <div className={`w-full p-3 rounded-xl border flex flex-col gap-1 ${darkMode ? 'bg-slate-800/10 border-slate-800/60 text-slate-200' : 'bg-[#e3ded0]/35 border-[#e3ded0]/60 text-[#3d3730]'}`}>
              <div className="flex justify-between items-center">
                <span className={`text-[9px] font-extrabold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-700'}`}>Sydney, AU</span>
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-[16px] font-black tracking-tight font-serif-display mt-0.5">
                {sydneyTime || '--:--:-- --'}
              </div>
              <div className={`text-[10px] font-semibold leading-none ${darkMode ? 'text-slate-400' : 'text-slate-650'}`}>
                {sydneyDate || '---, --- --'}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help flex-shrink-0 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`} title={`${userName} - Logged in as ${userEmail}`}>
                {initials}
              </span>
              <div className="flex-1 min-w-0">
                <p className={`text-[10px] font-medium leading-none mb-1 ${darkMode ? 'text-slate-400' : 'text-slate-650'}`}>Logged in as:</p>
                <p className={`text-[12px] font-bold truncate ${darkMode ? 'text-slate-200' : 'text-[#5c5446]'}`}>{userEmail}</p>
                <button onClick={handleLogout} className="text-[11px] text-red-500 hover:text-red-750 transition-colors font-extrabold cursor-pointer mt-1 block">
                  Logout
                </button>
              </div>
            </div>

            <button onClick={toggleDarkMode} className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer gap-4 px-3 py-2.5 ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]'}`} title="Toggle Dark Mode">
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
              <span className="font-medium">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
            </button>
          </div>
        )}
        {sidebarCollapsed && (
          <div className="flex flex-col items-center gap-4 animate-fade-in">
            <div className={`p-1 rounded-lg border flex flex-col items-center justify-center cursor-help transition-all w-12 ${darkMode ? 'bg-slate-800/10 border-slate-800/60 text-slate-200' : 'bg-[#e3ded0]/35 border-[#e3ded0]/60 text-[#5c5446]'}`} title={`Sydney, AU Time: ${sydneyTime || '--'} (${sydneyDate || '--'})`}>
              <span className="material-symbols-outlined text-[15px] text-slate-400 select-none">schedule</span>
              <span className="text-[9px] font-black tracking-tighter mt-0.5 leading-none">
                {sydneyTime ? sydneyTime.split(':')[0] + ':' + sydneyTime.split(':')[1] : '--:--'}
              </span>
            </div>
            <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`} title={`${userName} - Logged in as ${userEmail}`}>
              {initials}
            </span>
            <button onClick={toggleDarkMode} className={`p-1.5 rounded transition-colors cursor-pointer ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3]'}`} title="Toggle Dark Mode">
              {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            </button>
            <button onClick={handleLogout} className="text-[11px] text-red-500 hover:text-red-750 transition-colors font-extrabold cursor-pointer" title="Logout">
              Exit
            </button>
          </div>
        )}
      </div>
    </aside>
    </>
  );
}
