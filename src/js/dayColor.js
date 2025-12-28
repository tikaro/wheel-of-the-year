import { hasCalendarLabel } from '../utils/calendarUtils.js';

export const dayColor = (datum, calendarSystem) => {

    // if the date is today, return #EA00EB
    const today = new Date();
    const months = "January February March April May June July August September October November December".split(' ');
    const currentMonthIndex = today.getMonth();
    const currentMonthName = months[currentMonthIndex];
    const currentDay = today.getDate();
    const dayToMatch = `${currentMonthName} ${currentDay}`;
    if ( datum.x === dayToMatch ) { return "#EA00EB" }
    
    // Check if label exists for the currently active calendar system
    if ( hasCalendarLabel(datum, calendarSystem) ) { return "#9E009E" }

    const colors = "#003300 #004400 #005500 #006600 #009900 #00CC00 #00FF00".split(' ');
    return colors[datum.sandex];
  }