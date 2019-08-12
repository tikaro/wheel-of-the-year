export const isToday = (d) => {
  const today = new Date();
  const months = "January February March April May June July August September October November December".split(' ');
  const currentMonthIndex = today.getMonth();
  const currentMonthName = months[currentMonthIndex];
  const currentDay = today.getDate();
  const dayToMatch = `${currentMonthName} ${currentDay}`;
  var isToday = ( d === dayToMatch );
  // console.log(`Today is ${today.toString()}. ${d} ${isToday? 'is':'is not'} today.`)
  return isToday;
}