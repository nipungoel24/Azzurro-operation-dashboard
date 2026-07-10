export const PROPERTIES = [
  "All",
  "Potts Point",
  "Surry Hills",
  "Darling Harbour",
  "Olympic Hotel",
  "Central Sydney",
  "The Pyrmont Budget Hotel"
];

export const RESPONSIBLE_USERS = ['Sarah J.', 'Mike T.', 'Elena R.', 'David B.'];

export const getStatusesConfig = (darkMode) => [
  { 
    id: 'To do', 
    label: 'To do', 
    brandColor: '#e05a47', // Vibrant Terracotta Coral
    badgeBg: darkMode ? 'bg-[#e05a47]/20' : 'bg-[#feeae6]', 
    badgeText: darkMode ? 'text-[#ffa394]' : 'text-[#b4321d]',
    colBg: darkMode ? 'bg-[#e05a47]/5' : 'bg-[#fff5f2]/80',
    colBorder: darkMode ? 'border-[#e05a47]/20' : 'border-[#feeae6]',
    trackerRowBg: darkMode ? 'bg-[#e05a47]/10 border-[#e05a47]/20 text-[#ffa394]' : 'bg-[#fff8f6] border-[#feeae6] text-[#b4321d]',
    headerBg: darkMode ? 'bg-[#502119]/40' : 'bg-[#feeae6]/40',
    cardBg: darkMode ? 'bg-[#291e1d]/95 border-[#e05a47]/15 hover:bg-[#342422]/95 shadow-xs' : 'bg-[#fffcfb]/95 hover:bg-[#fff9f7]/95 border-[#feeae6]/80 shadow-xs',
    titleText: darkMode ? 'text-[#ffd3cc]' : 'text-[#b4321d]',
    descText: darkMode ? 'text-[#e5bfba]' : 'text-[#7d3e33]',
    divider: darkMode ? 'border-[#e05a47]/15' : 'border-[#feeae6]/70'
  },
  { 
    id: 'In progress', 
    label: 'In progress', 
    brandColor: '#4e9b67', // Vibrant Forest Green
    badgeBg: darkMode ? 'bg-[#4e9b67]/20' : 'bg-[#e8f5ec]', 
    badgeText: darkMode ? 'text-[#82d89b]' : 'text-[#23683c]',
    colBg: darkMode ? 'bg-[#4e9b67]/5' : 'bg-[#f4faf6]/80',
    colBorder: darkMode ? 'border-[#4e9b67]/20' : 'border-[#e8f5ec]',
    trackerRowBg: darkMode ? 'bg-[#4e9b67]/10 border-[#4e9b67]/20 text-[#82d89b]' : 'bg-[#f8fcf9] border-[#e8f5ec] text-[#23683c]',
    headerBg: darkMode ? 'bg-[#1c3825]/40' : 'bg-[#e8f5ec]/40',
    cardBg: darkMode ? 'bg-[#1a231d]/95 border-[#4e9b67]/15 hover:bg-[#202b24]/95 shadow-xs' : 'bg-[#fafdfb]/95 hover:bg-[#f3f9f5]/95 border-[#e8f5ec]/80 shadow-xs',
    titleText: darkMode ? 'text-[#d2ffd6]' : 'text-[#23683c]',
    descText: darkMode ? 'text-[#bfdcb6]' : 'text-[#234e32]',
    divider: darkMode ? 'border-[#4e9b67]/15' : 'border-[#e8f5ec]/70'
  },
  { 
    id: 'Review', 
    label: 'Review', 
    brandColor: '#d99c26', // Vibrant Sand Gold
    badgeBg: darkMode ? 'bg-[#d99c26]/20' : 'bg-[#fef6e0]', 
    badgeText: darkMode ? 'text-[#ffd785]' : 'text-[#8f5e0a]',
    colBg: darkMode ? 'bg-[#d99c26]/5' : 'bg-[#fffcf3]/80',
    colBorder: darkMode ? 'border-[#d99c26]/20' : 'border-[#fef6e0]',
    trackerRowBg: darkMode ? 'bg-[#d99c26]/10 border-[#d99c26]/20 text-[#ffd785]' : 'bg-[#fffdf7] border-[#fef6e0] text-[#8f5e0a]',
    headerBg: darkMode ? 'bg-[#4c360d]/40' : 'bg-[#fef6e0]/40',
    cardBg: darkMode ? 'bg-[#292215]/95 border-[#d99c26]/15 hover:bg-[#342a1a]/95 shadow-xs' : 'bg-[#fffdf9]/95 hover:bg-[#fffbf2]/95 border-[#fef6e0]/80 shadow-xs',
    titleText: darkMode ? 'text-[#ffebd2]' : 'text-[#8f5e0a]',
    descText: darkMode ? 'text-[#e5cca4]' : 'text-[#694811]',
    divider: darkMode ? 'border-[#d99c26]/15' : 'border-[#fef6e0]/70'
  },
  { 
    id: 'Done', 
    label: 'Done', 
    brandColor: '#5a8b9e', // Vibrant Sage Teal
    badgeBg: darkMode ? 'bg-[#5a8b9e]/20' : 'bg-[#ebf4f6]', 
    badgeText: darkMode ? 'text-[#a2d4e7]' : 'text-[#265b6e]',
    colBg: darkMode ? 'bg-[#5a8b9e]/5' : 'bg-[#f5fbfd]/80',
    colBorder: darkMode ? 'border-[#5a8b9e]/20' : 'border-[#ebf4f6]',
    trackerRowBg: darkMode ? 'bg-[#5a8b9e]/10 border-[#5a8b9e]/20 text-[#a2d4e7]' : 'bg-[#fafefe] border-[#ebf4f6] text-[#265b6e]',
    headerBg: darkMode ? 'bg-[#203239]/40' : 'bg-[#ebf4f6]/40',
    cardBg: darkMode ? 'bg-[#1b2326]/95 border-[#5a8b9e]/15 hover:bg-[#222c30]/95 shadow-xs' : 'bg-[#fafdfd]/95 hover:bg-[#f3f9fb]/95 border-[#ebf4f6]/80 shadow-xs',
    titleText: darkMode ? 'text-[#d6f1ff]' : 'text-[#265b6e]',
    descText: darkMode ? 'text-[#b6d2df]' : 'text-[#224452]',
    divider: darkMode ? 'border-[#5a8b9e]/15' : 'border-[#ebf4f6]/70'
  }
];
