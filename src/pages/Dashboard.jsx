import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import DashboardCard from '../components/DashboardCard';
import '../styles/dashboard.css';
import axios from 'axios';

function Dashboard() {
  // Estados para almacenar los datos de la API
  const [tickets, setTickets] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ventasRegistradas, setVentasRegistradas] = useState(0);
  const [gananciasDelDia, setGananciasDelDia] = useState(0);
  const [gananciasHora, setGananciasHora] = useState([]);
  const [bebidasPopulares, setBebidasPopulares] = useState([]);

  // Colores para el gráfico de pie
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];

  // Función para obtener los datos de la API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Obtener tickets
        const ticketsResponse = await axios.get('http://127.0.0.1:8000/club/tickets/');
        
        // Obtener órdenes
        const ordenesResponse = await axios.get('http://127.0.0.1:8000/club/ordenes-de-compra/');
        
        setTickets(ticketsResponse.data);
        setOrdenes(ordenesResponse.data);
        
        // Procesar los datos
        procesarDatos(ticketsResponse.data, ordenesResponse.data);
        
        setLoading(false);
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Función para procesar los datos obtenidos de la API
  const procesarDatos = (ticketsData, ordenesData) => {
    // Filtrar tickets de hoy
    const hoy = new Date().toISOString().split('T')[0];
    const ticketsHoy = ticketsData.filter(ticket => 
      ticket.fecha.startsWith(hoy)
    );

    // 1. Calcular ventas registradas (cantidad de tickets de hoy)
    setVentasRegistradas(ticketsHoy.length);

    // 2. Calcular ganancias del día (suma de totales de tickets de hoy)
    const ganancias = ticketsHoy.reduce((total, ticket) => 
      total + parseFloat(ticket.total), 0
    );
    setGananciasDelDia(`$${ganancias.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    // 3. Calcular ganancias por hora
    const gananciasHorarias = calcularGananciasHorarias(ticketsHoy);
    setGananciasHora(gananciasHorarias);

    // 4. Calcular bebidas más populares (de la última semana)
    const bebidasSemanales = calcularBebidasPopulares(ordenesData);
    setBebidasPopulares(bebidasSemanales);
  };

  // Función para calcular ganancias por hora
  const calcularGananciasHorarias = (tickets) => {
    // Crear objeto para almacenar ganancias por hora
    const gananciasHora = {};
    
    // Formato de hora en 12h (por ejemplo, '1 PM', '2 PM', etc.)
    tickets.forEach(ticket => {
      const fecha = new Date(ticket.fecha);
      let hora = fecha.getHours();
      const ampm = hora >= 12 ? 'PM' : 'AM';
      hora = hora % 12;
      hora = hora ? hora : 12; // La hora '0' debería ser '12'
      const horaFormateada = `${hora} ${ampm}`;
      
      if (!gananciasHora[horaFormateada]) {
        gananciasHora[horaFormateada] = 0;
      }
      
      gananciasHora[horaFormateada] += parseFloat(ticket.total);
    });
    
    // Convertir a array para el gráfico
    return Object.keys(gananciasHora).map(hora => ({
      hora,
      ganancias: gananciasHora[hora]
    })).sort((a, b) => {
      // Ordenar por AM/PM y luego por hora
      const aHour = parseInt(a.hora.split(' ')[0]);
      const bHour = parseInt(b.hora.split(' ')[0]);
      const aAmPm = a.hora.split(' ')[1];
      const bAmPm = b.hora.split(' ')[1];
      
      if (aAmPm === bAmPm) {
        return aHour - bHour;
      }
      return aAmPm === 'AM' ? -1 : 1;
    });
  };

  // Función para calcular bebidas más populares de la última semana
  const calcularBebidasPopulares = (ordenesData) => {
    // Obtener la fecha de hace una semana
    const unaSemanaAtras = new Date();
    unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
    const fechaSemanaAtras = unaSemanaAtras.toISOString().split('T')[0];
    
    // Aplanar los datos de órdenes (ya que parecen estar anidados por algún ID)
    let todasLasOrdenes = [];
    Object.values(ordenesData).forEach(ordenesGrupo => {
      todasLasOrdenes = [...todasLasOrdenes, ...ordenesGrupo];
    });
    
    // Filtrar órdenes de la última semana
    const ordenesSemana = todasLasOrdenes.filter(orden => 
      orden.fecha_de_orden >= fechaSemanaAtras
    );
    
    // Contar la cantidad de cada bebida
    const contadorBebidas = {};
    ordenesSemana.forEach(orden => {
      const nombreBebida = orden.nombre_producto;
      if (!contadorBebidas[nombreBebida]) {
        contadorBebidas[nombreBebida] = 0;
      }
      contadorBebidas[nombreBebida] += orden.cantidad;
    });
    
    // Convertir a array y ordenar de mayor a menor
    return Object.keys(contadorBebidas)
      .map(nombre => ({
        nombre,
        cantidad: contadorBebidas[nombre]
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6); // Tomar las 6 más populares
  };

  // Customizar el tooltip del gráfico de barras
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-value">{`Ganancias: $${payload[0].value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
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
        {`${name.length > 10 ? name.substring(0, 10) + '...' : name} (${(percent * 100).toFixed(0)}%)`}
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
        
        {loading ? (
          <div className="text-center my-5">
            <h3 className="text-light">Cargando datos...</h3>
          </div>
        ) : (
          <>
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
                  {gananciasHora.length > 0 ? (
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
                  ) : (
                    <div className="text-center my-5">
                      <h4 className="text-light">No hay datos de ventas para hoy</h4>
                    </div>
                  )}
                </div>
              </Col>
              
              <Col xs={12} lg={4} className="mb-4">
                <div className="chart-container">
                  <h2 className="chart-title">Bebidas Más Populares</h2>
                  {bebidasPopulares.length > 0 ? (
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
                  ) : (
                    <div className="text-center my-5">
                      <h4 className="text-light">No hay datos de bebidas para la última semana</h4>
                    </div>
                  )}
                </div>
              </Col>
            </Row>
          </>
        )}
      </Container>
    </div>
  );
}

export default Dashboard;