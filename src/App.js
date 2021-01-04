import React from 'react';
import { VictoryPie, VictoryLabel } from 'victory';
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
      <VictoryLabel
          textAnchor="middle"
          style={{ 
            fontFamily: "'Noto Sans TC', sans-serif;",
            fontSize: "14px",
            fill: "#379E00"
           }}
          x={200} y={200}
          text= { () => {
              const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
              return new Date().toLocaleDateString("en-US", options)
            }
          }
        />
      <circle cx="200" cy="200" r="115" fill="none" stroke="#9E009E" strokeWidth={3} />
    </svg>
    
    </div>
  );
}

export default App;