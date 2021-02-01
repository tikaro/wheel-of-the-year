const fetch = require('node-fetch');

function fetchHours(date = new Date(2019,4,1)) {
    (async () => {
      try {
        // West Chester, PA is lat 39.9444, lon -75.1638
        const darkSkyApiKey = process.env.DARK_SKY_API_KEY;
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
