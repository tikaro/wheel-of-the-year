export const isToday = (d) => {
  console.log(d);
  const today = new Date();
  const months = "January February March April May June July August September October November December".split(' ');
  const currentMonthNumber = today.getMonth();
  const currentMonthName = months[currentMonthNumber];
  const currentDay = today.getDay();
  const dayToMatch = `${currentMonthName} ${currentDay}`;
  return d === dayToMatch;
}