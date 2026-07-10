import React from 'react';
import { Icons } from './Icons';

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
  return (
    <aside className={`transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-20' : 'w-64'} backdrop-blur-md border-r flex flex-col z-10 flex-shrink-0 relative ${darkMode ? 'bg-[#24211d]/90 border-[#3d3730] text-[#c2baa9]' : 'bg-[#f0ece1]/90 border-[#e3ded0] text-[#5c5446]'}`}>
      
      {/* Logo/Title Area with Toggle Button */}
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
          className={`p-1 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-slate-850 ${darkMode ? 'hover:bg-slate-800 hover:text-white' : 'hover:bg-slate-100/60'}`}
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
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Sprint Board</span>}
        </button>
        
        <button 
          onClick={() => setActiveView('tracker')}
          className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer ${sidebarCollapsed ? 'justify-center p-3' : 'gap-4 px-3 py-2.5'} ${activeView === 'tracker' ? (darkMode ? 'bg-[#3d3730] text-white font-semibold' : 'bg-[#e3ded0] text-[#5c5446] font-semibold shadow-xs') : (darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]')}`}
          title="Trackers & Exports"
        >
          <Icons.Tracker />
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">Trackers & Exports</span>}
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
          {!sidebarCollapsed && <span className="animate-fade-in font-medium">New Task</span>}
        </button>

        {/* Theme Mode Switcher in Sidebar */}
        {!sidebarCollapsed && (
          <button 
            onClick={toggleDarkMode}
            className={`w-full flex items-center rounded-lg transition-all text-[14px] cursor-pointer gap-4 px-3 py-2.5 mt-4 ${darkMode ? 'text-[#a8a090] hover:bg-[#38332c] hover:text-white' : 'text-[#877d6c] hover:bg-[#e7e1d3] hover:text-[#5c5446]'}`}
            title="Toggle Dark Mode"
          >
            {darkMode ? <Icons.Sun /> : <Icons.Moon />}
            <span className="animate-fade-in font-medium">{darkMode ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
        )}
      </nav>

      {/* Footer Area retractable view */}
      <div className={`p-4 mt-auto border-t flex flex-col items-start gap-3 ${sidebarCollapsed ? 'py-6 items-center w-full' : 'p-6 pb-8'} ${darkMode ? 'border-[#3d3730]' : 'border-[#e3ded0]'}`}>
         {!sidebarCollapsed && (
           <div className="w-full animate-fade-in flex items-center gap-3">
             <span 
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help flex-shrink-0 ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`} 
              title="NG - Logged in as nipun24.goel@gmail.com"
             >
               NG
             </span>
             <div className="flex-1 min-w-0">
               <p className="text-[10px] text-slate-400 font-medium leading-none mb-1">Logged in as:</p>
               <p className={`text-[12px] font-bold truncate ${darkMode ? 'text-slate-200' : 'text-[#5c5446]'}`}>nipun24.goel@gmail.com</p>
               <button 
                onClick={handleLogout}
                className="text-[11px] text-red-500 hover:text-red-750 transition-colors font-extrabold cursor-pointer mt-1 block"
               >
                 Logout
               </button>
             </div>
           </div>
         )}
         {sidebarCollapsed && (
           <div className="flex flex-col items-center gap-4 animate-fade-in">
             <span 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs cursor-help ${darkMode ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-800'}`} 
              title="NG - Logged in as nipun24.goel@gmail.com"
             >
               NG
             </span>
             
             <button 
               onClick={toggleDarkMode}
               className={`p-1.5 rounded transition-colors cursor-pointer text-[#a8a090] hover:text-white ${darkMode ? 'hover:bg-[#38332c]' : 'hover:bg-[#e7e1d3]'}`}
               title="Toggle Dark Mode"
             >
               {darkMode ? <Icons.Sun /> : <Icons.Moon />}
             </button>

             <button 
              onClick={handleLogout}
              className="text-[11px] text-red-500 hover:text-red-750 transition-colors font-extrabold cursor-pointer"
              title="Logout"
             >
               Exit
             </button>
           </div>
         )}
      </div>
    </aside>
  );
}
