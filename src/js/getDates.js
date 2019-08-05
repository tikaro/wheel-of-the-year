export default function getDates (year) {
  var arr = [];
  var len = 365;
  var date = new Date(year,5,20);
  var today = new Date();
  var todayColor = "#CCC";

  for (var i = 0; i < len; i++) {
      
      arr.push({
          x: date,
          y: 1,
          color: setTodayColor(date)
      });
      date.setDate(date.getDate() + 1);
      // console.log(`$x: ${date.toDateString()}, y: 1, color: ${setTodayColor(date)}`)
  }
  return arr;
}

const setTodayColor = (someDate) => {
  if ( isToday(someDate) ) { return "#00F" }
  return "#CCC"
}

const isToday = (someDate) => {
  const today = new Date()
  return someDate.getDate() == today.getDate() &&
    someDate.getMonth()     == today.getMonth() &&
    someDate.getFullYear()  == today.getFullYear()
}
