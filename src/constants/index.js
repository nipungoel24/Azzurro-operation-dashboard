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
    brandColor: '#c97f67',
    badgeBg: darkMode ? 'bg-[#c97f67]/20' : 'bg-[#f4e6e1]', 
    badgeText: darkMode ? 'text-[#e5aba0]' : 'text-[#a3523b]',
    colBg: darkMode ? 'bg-[#483733]/15' : 'bg-[#f8edea]/80',
    colBorder: darkMode ? 'border-[#a3523b]/25' : 'border-[#eed9d3]/60',
    trackerRowBg: darkMode ? 'bg-[#483733]/20 border-[#a3523b]/30 text-[#e5aba0]' : 'bg-[#faf0ed] border-[#eed9d3]/50 text-[#a3523b]',
    headerBg: darkMode ? 'bg-[#3d2e2b]/60' : 'bg-[#eed9d3]/70',
    cardBg: darkMode ? 'bg-[#292220]/95 border-[#a3523b]/20 hover:bg-[#342b29]/95 shadow-xs' : 'bg-[#fffcfb]/95 hover:bg-[#faf4f2]/95 border-[#eed9d3]/35 shadow-xs',
    titleText: darkMode ? 'text-[#f6d7d2]' : 'text-[#a3523b]',
    descText: darkMode ? 'text-[#d7c0bc]' : 'text-[#7d564e]',
    divider: darkMode ? 'border-[#a3523b]/25' : 'border-[#eed9d3]/40'
  },
  { 
    id: 'In progress', 
    label: 'In progress', 
    brandColor: '#868e65',
    badgeBg: darkMode ? 'bg-[#868e65]/20' : 'bg-[#eaebe1]', 
    badgeText: darkMode ? 'text-[#bcc49f]' : 'text-[#575e3a]',
    colBg: darkMode ? 'bg-[#393b2f]/15' : 'bg-[#f2f4ec]/80',
    colBorder: darkMode ? 'border-[#575e3a]/25' : 'border-[#e4e7d8]/60',
    trackerRowBg: darkMode ? 'bg-[#393b2f]/20 border-[#575e3a]/30 text-[#bcc49f]' : 'bg-[#f6f8f2] border-[#e4e7d8]/50 text-[#575e3a]',
    headerBg: darkMode ? 'bg-[#2e3026]/60' : 'bg-[#e4e7d8]/70',
    cardBg: darkMode ? 'bg-[#23241f]/95 border-[#575e3a]/20 hover:bg-[#2d2f28]/95 shadow-xs' : 'bg-[#fcfdfa]/95 hover:bg-[#f6f7f2]/95 border-[#e4e7d8]/35 shadow-xs',
    titleText: darkMode ? 'text-[#e6ead7]' : 'text-[#575e3a]',
    descText: darkMode ? 'text-[#c6caa9]' : 'text-[#4b5133]',
    divider: darkMode ? 'border-[#575e3a]/25' : 'border-[#e4e7d8]/40'
  },
  { 
    id: 'Review', 
    label: 'Review', 
    brandColor: '#c49c5e',
    badgeBg: darkMode ? 'bg-[#c49c5e]/20' : 'bg-[#f3ecd8]', 
    badgeText: darkMode ? 'text-[#e5cc9f]' : 'text-[#87652e]',
    colBg: darkMode ? 'bg-[#483d2f]/15' : 'bg-[#f6f1e6]/80',
    colBorder: darkMode ? 'border-[#87652e]/25' : 'border-[#eee3cc]/60',
    trackerRowBg: darkMode ? 'bg-[#483d2f]/20 border-[#87652e]/30 text-[#e5cc9f]' : 'bg-[#f9f5ed] border-[#eee3cc]/50 text-[#87652e]',
    headerBg: darkMode ? 'bg-[#3d3326]/60' : 'bg-[#eee3cc]/70',
    cardBg: darkMode ? 'bg-[#28241e]/95 border-[#87652e]/20 hover:bg-[#322d25]/95 shadow-xs' : 'bg-[#fdfcf9]/95 hover:bg-[#f8f5ed]/95 border-[#eee3cc]/35 shadow-xs',
    titleText: darkMode ? 'text-[#f5ebd7]' : 'text-[#87652e]',
    descText: darkMode ? 'text-[#d6c7b0]' : 'text-[#6e532a]',
    divider: darkMode ? 'border-[#87652e]/25' : 'border-[#eee3cc]/40'
  },
  { 
    id: 'Done', 
    label: 'Done', 
    brandColor: '#6c6861',
    badgeBg: darkMode ? 'bg-[#6c6861]/20' : 'bg-[#eae8e6]', 
    badgeText: darkMode ? 'text-[#b8b5b0]' : 'text-[#44423e]',
    colBg: darkMode ? 'bg-[#363533]/15' : 'bg-[#f3f2f0]/80',
    colBorder: darkMode ? 'border-[#44423e]/25' : 'border-[#e4e2de]/60',
    trackerRowBg: darkMode ? 'bg-[#363533]/20 border-[#44423e]/30 text-[#b8b5b0]' : 'bg-[#f6f5f4] border-[#e4e2de]/50 text-[#44423e]',
    headerBg: darkMode ? 'bg-[#2b2a29]/60' : 'bg-[#e4e2de]/70',
    cardBg: darkMode ? 'bg-[#21201f]/95 border-[#44423e]/20 hover:bg-[#2a2928]/95 shadow-xs' : 'bg-[#fafafa]/95 hover:bg-[#f4f3f2]/95 border-[#e4e2de]/35 shadow-xs',
    titleText: darkMode ? 'text-[#e5e3e0]' : 'text-[#44423e]',
    descText: darkMode ? 'text-[#c2c0bc]' : 'text-[#585652]',
    divider: darkMode ? 'border-[#44423e]/25' : 'border-[#e4e2de]/40'
  }
];
