export const getRecurrenceLabel = (recurrenceStr) => {
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
