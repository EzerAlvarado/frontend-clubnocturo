import React from 'react';
import { Card } from 'react-bootstrap';

function DashboardCard({ title, value, color, icon }) {
  return (
    <Card className="dashboard-card">
      <Card.Body>
        <div className="card-title">{title}</div>
        <div className="card-value" style={{ color }}>
          {value}
        </div>
        {icon && <i className={`${icon} card-icon`} style={{ color }}></i>}
      </Card.Body>
    </Card>
  );
}

export default DashboardCard;