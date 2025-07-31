import React from 'react';
import './StatsSection.css';

const statsData = [
  { label: 'SUCCESSFUL PROJECTS', value: 1043 },
  { label: 'PEOPLE IMPACTED', value: 206400 },
  { label: 'TOTAL AMOUNT RAISED', value: '₹78,96,300' },
  { label: 'TOTAL VOLUNTEERS', value: 217 },
];

const StatsSection = () => {
  return (
    <section className="stats-section">
      <div className="stats-scroller">
        <div className="stats-track">
          {statsData.map((stat, index) => (
            <div className="stat-card" key={`${stat.label}-${index}`}>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
