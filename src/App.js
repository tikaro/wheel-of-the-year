import React from 'react';
import { VictoryPie } from 'victory';
import { calendarDates } from './calendarDates.js';
import { isToday } from './js/isToday.js';

import './App.scss';

function App() {
  return (
    <div className="App">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <VictoryPie
        standalone={false}
        width={400} height={400}
        data={calendarDates}
        innerRadius={120}
        labelRadius={160}
        labels={() => null}
        style={{
          labels: { 
            fontFamily: "'Noto Sans TC', sans-serif;",
            fontSize: "14px",
            fill: "#6AFF19"
          },
          data: {
            fill: ({ datum }) => ( isToday(datum.x) ? "#EA00EB" : datum.fill )
          }
        }}
      />
      <circle cx="200" cy="200" r="115" fill="none" stroke="#9E009E" strokeWidth={3} />
    </svg>
    
    </div>
  );
}

export default App;