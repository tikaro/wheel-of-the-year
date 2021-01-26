getHistory();

function getHistory() {
  
  console.log('ping');

  var date = new Date(2019,0,1)
  var days = []
  
  for ( i = 0; i <= 20; i++ ) {
    var hours = fetchHours(date);
    var day = {
      theDate: date.toDateString(),
      isSandex: doesDayContainSandex(hours)
    }
    days = days.concat(day);
    date.setDate(date.getDate() + 1);
  }
  console.table(days);
}

function fetchHours(date) {
  // West Chester, PA is lat 39.9444, lon -75.1638
  const darkSkyApiKey = "c9347fa8676b53635fc1ed28f4d43d46";
  const apiLat = '39.9444';
  const apiLon = '-75.1638';
  var unixDate = date.getTime() / 1000;
  var apiUrl = `https://api.darksky.net/forecast/${darkSkyApiKey}/${apiLat},${apiLon},${unixDate}?exclude=flags,minutely,daily,alerts`;
  
  var result = UrlFetchApp.fetch(apiUrl);
  var json = JSON.parse(result);
  
  var hours = [];
  hours = hours.concat(json.hourly.data);
  return hours;
}
  
function doesDayContainSandex(hours) {
  if ( hours == null ) { return false }
  for ( var i = 0; i <= 23; i++ ) {
    if ( hours[i] == null ) { return false }
    if ( isSandex(hours[i].temperature, hours[i].humidity ) ) {
      return true;
    }
  }
  return false
}

function isSandex(temperature, humidity) {
  if ( ( +humidity >= 0.3) && 
    ( +humidity <= 0.6 ) && 
    ( temperature >= temperatureLowerBound(humidity) ) &&
    ( temperature <= temperatureUpperBound(humidity ) )
  ) {
      return true;
    }
  return false;
}
  
function temperatureLowerBound ( humidity ) { return (-3.3333333 * +humidity) + 70; }
  
function temperatureUpperBound ( humidity ) { return (-13.3333333 * +humidity) + 86; }
  