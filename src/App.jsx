import React, { useState } from 'react';
import { VictoryPie, VictoryLabel } from 'victory';
import { calendarDates } from './calendarDates.js';
import { dayColor } from './js/dayColor.js';
import { CALENDAR_SYSTEMS, CALENDAR_CONFIG } from './constants/calendarSystems.js';
import { getCalendarLabel } from './utils/calendarUtils.js';

import './App.scss';

function App() {
  const [calendarSystem, setCalendarSystem] = useState(CALENDAR_SYSTEMS.LUNISOLAR);
  const [hoveredDate, setHoveredDate] = useState(null);

  const handleToggle = () => {
    setCalendarSystem(
      calendarSystem === CALENDAR_SYSTEMS.LUNISOLAR 
        ? CALENDAR_SYSTEMS.PAGAN 
        : CALENDAR_SYSTEMS.LUNISOLAR
    );
  };

  const currentConfig = CALENDAR_CONFIG[calendarSystem];

  const centerText = hoveredDate
    ? hoveredDate
    : (() => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date().toLocaleDateString("en-US", options);
      })();

  return (
    <div className="App">
    <div className="calendar-selector">
      <span className="calendar-label">{CALENDAR_CONFIG[CALENDAR_SYSTEMS.LUNISOLAR].displayName}</span>
      <label className="toggle-switch">
        <input 
          type="checkbox"
          checked={calendarSystem === CALENDAR_SYSTEMS.PAGAN}
          onChange={handleToggle}
        />
        <span className="slider"></span>
      </label>
      <span className="calendar-label">{CALENDAR_CONFIG[CALENDAR_SYSTEMS.PAGAN].displayName}</span>
    </div>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 400"
      role="img"
      aria-label="Wheel of the Year pie chart. Hover over a slice to reveal its calendar date."
    >
      <VictoryPie
        standalone={false}
        width={400} height={400}
        data={calendarDates}
        innerRadius={120}
        labelRadius={160}
        labels={({ datum }) => getCalendarLabel(datum, calendarSystem)}
        events={[{
          target: "data",
          eventHandlers: {
            onMouseOver: () => [{
              target: "data",
              mutation: (props) => {
                setHoveredDate(props.datum.x);
                return { style: { ...props.style, fill: "#EA00EB", cursor: "pointer" } };
              }
            }],
            onMouseOut: () => [{
              target: "data",
              mutation: () => {
                setHoveredDate(null);
                return null;
              }
            }]
          }
        }]}
        style={{
          labels: { 
            fontFamily: "'Noto Sans TC', sans-serif",
            fontSize: currentConfig.labelFontSize,
            fill: "#6AFF19"
          },
          data: {
            fill: ({ datum }) => dayColor( datum, calendarSystem ),
            cursor: "pointer"
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
          text={centerText}
        />
      <circle cx="200" cy="200" r="115" fill="none" stroke="#9E009E" strokeWidth={3} />
    </svg>
    <div
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {hoveredDate ? hoveredDate : ''}
    </div>
    </div>
  );
}

export default App;