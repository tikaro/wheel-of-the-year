export const getCalendarLabel = (datum, calendarSystem) => {
  const labelValue = datum.calendarLabels?.[calendarSystem];
  return labelValue ? String(labelValue) : '';
};

export const hasCalendarLabel = (datum, calendarSystem) => {
  return Boolean(datum.calendarLabels?.[calendarSystem]);
};
