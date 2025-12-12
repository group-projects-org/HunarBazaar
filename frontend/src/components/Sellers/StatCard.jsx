import React from 'react';

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '24px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div>
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#6B7280',
          margin: '0 0 8px 0'
        }}>{title}</p>
        <p style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#111827',
          margin: '0 0 4px 0'
        }}>{value}</p>
        {change && (
          <p style={{
            fontSize: '14px',
            color: change.startsWith('+') ? '#10B981' : '#EF4444',
            margin: '0'
          }}>{change}</p>
        )}
      </div>
      <Icon style={{ height: '32px', width: '32px', color: color }} />
    </div>
  </div>
);

export default StatCard;