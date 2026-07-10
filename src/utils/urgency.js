export const getUrgencyLevel = (dueDateStr, status) => {
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
