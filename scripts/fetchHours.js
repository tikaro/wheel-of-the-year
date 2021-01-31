const fetch = require('node-fetch');

function fetchHours(date = new Date(2019,4,1)) {
    (async () => {
      try {
        // West Chester, PA is lat 39.9444, lon -75.1638
        const darkSkyApiKey = "c9347fa8676b53635fc1ed28f4d43d46";
        const apiLat = '39.9444';
        const apiLon = '-75.1638';
        var unixDate = date.getTime() / 1000;
        var apiUrl = `https://api.darksky.net/forecast/${darkSkyApiKey}/${apiLat},${apiLon},${unixDate}?exclude=flags,minutely,daily,alerts`;
    
        const response = await fetch(apiUrl)
        const json = await response.json()
        console.table(json.hourly.data);
      } catch (error) {
        console.log(error.response.body);
      }
    })();
  }

fetchHours();