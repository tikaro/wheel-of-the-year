import React, { useState } from 'react';
import { VictoryPie, VictoryLabel } from 'victory';
import { calendarDates } from './calendarDates.js';
import { dayColor } from './js/dayColor.js';

import './App.scss';

function App() {
  const [calendarSystem, setCalendarSystem] = useState('lunisolar');

  const handleToggle = () => {
    setCalendarSystem(calendarSystem === 'lunisolar' ? 'pagan' : 'lunisolar');
  };

  return (
    <div className="App">
    <div className="calendar-selector">
      <span className="calendar-label">Chinese Lunisolar</span>
      <label className="toggle-switch">
        <input 
          type="checkbox"
          checked={calendarSystem === 'pagan'}
          onChange={handleToggle}
        />
        <span className="slider"></span>
      </label>
      <span className="calendar-label">Pagan</span>
    </div>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
      <VictoryPie
        standalone={false}
        width={400} height={400}
        data={calendarDates}
        innerRadius={120}
        labelRadius={160}
        labels={({ datum }) => {
          const labelValue = datum.calendarLabels[calendarSystem];
          return labelValue ? String(labelValue) : '';
        }}
        style={{
          labels: { 
            fontFamily: "'Noto Sans TC', sans-serif",
            fontSize: calendarSystem === 'pagan' ? "10px" : "14px",
            fill: "#6AFF19"
          },
          data: {
            fill: ({ datum }) => dayColor( datum, calendarSystem )
          }
        }}
      />
      <VictoryLabel
          textAnchor="middle"
          style={{ 
            fontFamily: "'Noto Sans TC', sans-serif",
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