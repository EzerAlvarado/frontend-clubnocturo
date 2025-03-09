import React, { useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import DashboardCard from '../components/DashboardCard';
import '../styles/dashboard.css';

function Dashboard() {
  // Datos de ejemplo: ganancias por hora
  const gananciasHora = [
    { hora: '12 PM', ganancias: 1200 },
    { hora: '1 PM', ganancias: 1800 },
    { hora: '2 PM', ganancias: 1400 },
    { hora: '3 PM', ganancias: 1100 },
    { hora: '4 PM', ganancias: 1300 },
    { hora: '5 PM', ganancias: 1900 },
    { hora: '6 PM', ganancias: 2200 },
    { hora: '7 PM', ganancias: 2500 },
    { hora: '8 PM', ganancias: 2800 },
    { hora: '9 PM', ganancias: 3100 },
    { hora: '10 PM', ganancias: 2900 },
    { hora: '11 PM', ganancias: 2400 },
    { hora: '12 AM', ganancias: 1700 },
    { hora: '1 AM', ganancias: 1300 },
    { hora: '2 AM', ganancias: 800 }
  ];

  // Datos de ejemplo: bebidas más populares
  const bebidasPopulares = [
    { nombre: 'Margarita', cantidad: 145 },
    { nombre: 'Cerveza', cantidad: 240 },
    { nombre: 'Mojito', cantidad: 110 },
    { nombre: 'Whisky', cantidad: 85 },
    { nombre: 'Tequila', cantidad: 95 },
    { nombre: 'Piña Colada', cantidad: 60 }
  ];

  // Colores para el gráfico de pie
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];

  // Total ventas y ganancias (para las tarjetas)
  const ventasRegistradas = 128;
  const gananciasDelDia = '$4,820';

  // Customizar el tooltip del gráfico de barras
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-value">{`Ganancias: $${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Customizar el tooltip del gráfico de pie
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${payload[0].name}`}</p>
          <p className="tooltip-value">{`Cantidad: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  // Renderizado personalizado de etiquetas en el gráfico de pie
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.1;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={COLORS[index % COLORS.length]}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <div>
      <Container fluid className="dashboard-container">
        <Row className="mb-4">
          <Col xs={12}>
            <h1 className="dashboard-title">Dashboard del Bar</h1>
          </Col>
        </Row>
        
        {/* Tarjetas de resumen */}
        <Row className="mb-4">
          <Col xs={12} md={6} className="mb-3">
            <DashboardCard 
              title="Ventas Registradas" 
              value={ventasRegistradas} 
              color="#3498db"
              icon="fas fa-cash-register" 
            />
          </Col>
          <Col xs={12} md={6} className="mb-3">
            <DashboardCard 
              title="Ganancias del Día" 
              value={gananciasDelDia} 
              color="#2ecc71"
              icon="fas fa-dollar-sign" 
            />
          </Col>
        </Row>
        
        {/* Gráficas */}
        <Row className="mb-4">
          <Col xs={12} lg={8} className="mb-4">
            <div className="chart-container">
              <h2 className="chart-title">Ganancias del Día por Hora</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={gananciasHora} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis 
                    dataKey="hora" 
                    angle={-45} 
                    textAnchor="end"
                    height={60}
                    tick={{ fill: '#cfcfcf', fontSize: 12 }} 
                  />
                  <YAxis tick={{ fill: '#cfcfcf' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="ganancias" 
                    name="Ganancias" 
                    fill="#3498db" 
                    radius={[5, 5, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Col>
          
          <Col xs={12} lg={4} className="mb-4">
            <div className="chart-container">
              <h2 className="chart-title">Bebidas Más Populares</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={bebidasPopulares}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="cantidad"
                    nameKey="nombre"
                    label={renderCustomizedLabel}
                    animationDuration={1500}
                  >
                    {bebidasPopulares.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Dashboard;