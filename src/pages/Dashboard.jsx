import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import DashboardCard from '../components/DashboardCard';
import '../styles/dashboard.css';
import axios from 'axios';

function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [ordenes, setOrdenes] = useState([]);
  const [ordenesHistorico, setOrdenesHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true); // Estado para controlar la carga inicial
  const [ventasRegistradas, setVentasRegistradas] = useState(0);
  const [gananciasDelDia, setGananciasDelDia] = useState(0);
  const [gananciasHora, setGananciasHora] = useState([]);
  const [gananciasMinuto, setGananciasMinuto] = useState([]);
  const [bebidasPopulares, setBebidasPopulares] = useState([]);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(new Date());

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF5733'];

  // Cargar el histórico de órdenes desde localStorage al iniciar
  useEffect(() => {
    const historico = localStorage.getItem('ordenesHistorico');
    if (historico) {
      try {
        setOrdenesHistorico(JSON.parse(historico));
      } catch (e) {
        console.error('Error al cargar histórico desde localStorage:', e);
      }
    }
  }, []);

  // Guardar el histórico en localStorage cuando cambie
  useEffect(() => {
    if (ordenesHistorico.length > 0) {
      localStorage.setItem('ordenesHistorico', JSON.stringify(ordenesHistorico));
    }
  }, [ordenesHistorico]);

  // Componentes para los Tooltips
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

  // Función fetchData modificada para usar el nuevo endpoint con estado=pagado
  // y actualizar la hora solo cuando hay datos nuevos
  const fetchData = useCallback(async () => {
    try {
      // Solo activar loading si es la carga inicial
      if (initialLoad) {
        setLoading(true);
      }
      
      const ticketsResponse = await axios.get('http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/tickets/');
      // Usar el nuevo endpoint con filtro de estado=pagado
      const ordenesResponse = await axios.get('http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/ordenes-de-compra/?estado=pagado');
      
      setTickets(ticketsResponse.data);
      
      // Procesar las nuevas órdenes y agregarlas al histórico
      let nuevasOrdenes = [];
      if (Array.isArray(ordenesResponse.data)) {
        // Si la respuesta ya es un array, usarla directamente
        nuevasOrdenes = ordenesResponse.data;
      } else if (typeof ordenesResponse.data === 'object') {
        // Si es un objeto, procesar sus valores
        Object.values(ordenesResponse.data).forEach(ordenesGrupo => {
          if (Array.isArray(ordenesGrupo)) {
            nuevasOrdenes = [...nuevasOrdenes, ...ordenesGrupo];
          }
        });
      }
      
      // Filtrar para evitar duplicados usando algún identificador único como id
      const getOrdenId = (orden) => {
        return orden.id || `${orden.nombre_producto}-${orden.fecha_de_orden}-${orden.cantidad}`;
      };
      
      const ordenesExistentesIds = new Set(ordenesHistorico.map(orden => getOrdenId(orden)));
      const ordenesUnicas = nuevasOrdenes.filter(orden => !ordenesExistentesIds.has(getOrdenId(orden)));
      
      // Actualizar ultimaActualizacion solo si hay nuevas órdenes o es la primera carga
      if (ordenesUnicas.length > 0 || initialLoad) {
        setUltimaActualizacion(new Date());
      }
      
      // Actualizar el histórico
      const historico = [...ordenesHistorico, ...ordenesUnicas];
      setOrdenesHistorico(historico);
      
      // Guardar también las órdenes actuales
      setOrdenes(ordenesResponse.data);
      
      // Usar el histórico para procesar los datos
      procesarDatos(ticketsResponse.data, historico);
      
      // Después de la primera carga, desactivar initialLoad
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
      if (initialLoad) {
        setLoading(false);
        setInitialLoad(false);
      }
    }
  }, [initialLoad, ordenesHistorico]);

  // Efecto para la carga inicial y actualización periódica
  useEffect(() => {
    fetchData();

    // Configurar intervalo de actualización cada 10 segundos
    const intervalId = setInterval(fetchData, 10000);

    // Limpiar intervalo al desmontar el componente
    return () => clearInterval(intervalId);
  }, [fetchData]);

  // Función para calcular ganancias por minuto
  const calcularGananciasMinuto = (tickets) => {
    const gananciasMinuto = {};
    
    tickets.forEach(ticket => {
      const fecha = new Date(ticket.fecha);
      const minutosFormateados = fecha.getHours().toString().padStart(2, '0') + ':' + 
                                  fecha.getMinutes().toString().padStart(2, '0');
      
      gananciasMinuto[minutosFormateados] = (gananciasMinuto[minutosFormateados] || 0) + parseFloat(ticket.total);
    });
    
    return Object.keys(gananciasMinuto).map(minuto => ({
      minuto,
      ganancias: gananciasMinuto[minuto]
    })).sort((a, b) => {
      const [horaA, minA] = a.minuto.split(':').map(Number);
      const [horaB, minB] = b.minuto.split(':').map(Number);
      
      return horaA * 60 + minA - (horaB * 60 + minB);
    });
  };

  const procesarDatos = (ticketsData, historicoOrdenes) => {
    // Obtener fecha actual (inicio del día en hora local)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Filtrar tickets válidos y del día actual
    const ticketsValidos = ticketsData.filter(ticket => 
      ticket.fecha && !isNaN(parseFloat(ticket.total))
    );

    const ticketsHoy = ticketsValidos.filter(ticket => {
      try {
        const fechaTicket = new Date(ticket.fecha);
        return fechaTicket >= hoy && fechaTicket < new Date(hoy.getTime() + 86400000);
      } catch (e) {
        console.error('Error al parsear fecha del ticket:', ticket.fecha, e);
        return false;
      }
    });

    // Calcular métricas
    setVentasRegistradas(ticketsHoy.length);

    const ganancias = ticketsHoy.reduce((total, ticket) => 
      total + parseFloat(ticket.total), 0
    );
    setGananciasDelDia(`$${ganancias.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);

    const gananciasHorarias = calcularGananciasHorarias(ticketsHoy);
    setGananciasHora(gananciasHorarias);

    // Añadir cálculo de ganancias por minuto
    const gananciasMinutales = calcularGananciasMinuto(ticketsHoy);
    setGananciasMinuto(gananciasMinutales);

    // Usar el histórico de órdenes para bebidas populares
    const bebidasSemanales = calcularBebidasPopulares(historicoOrdenes);
    setBebidasPopulares(bebidasSemanales);
  };

  const calcularGananciasHorarias = (tickets) => {
    const gananciasHora = {};
    
    tickets.forEach(ticket => {
      const fecha = new Date(ticket.fecha);
      let hora = fecha.getHours();
      const ampm = hora >= 12 ? 'PM' : 'AM';
      hora = hora % 12;
      hora = hora ? hora : 12;
      const horaFormateada = `${hora} ${ampm}`;
      
      gananciasHora[horaFormateada] = (gananciasHora[horaFormateada] || 0) + parseFloat(ticket.total);
    });
    
    return Object.keys(gananciasHora).map(hora => ({
      hora,
      ganancias: gananciasHora[hora]
    })).sort((a, b) => {
      const [aHora, aAmPm] = a.hora.split(' ');
      const [bHora, bAmPm] = b.hora.split(' ');
      
      const a24h = parseInt(aHora) + (aAmPm === 'PM' && aHora !== '12' ? 12 : 0);
      const b24h = parseInt(bHora) + (bAmPm === 'PM' && bHora !== '12' ? 12 : 0);
      
      return a24h - b24h;
    });
  };

  // Función actualizada para usar directamente el histórico de órdenes
  const calcularBebidasPopulares = (historicoOrdenes) => {
    const unaSemanaAtras = new Date();
    unaSemanaAtras.setDate(unaSemanaAtras.getDate() - 7);
    
    // Asegurarse de que historicoOrdenes es un array
    if (!Array.isArray(historicoOrdenes)) {
      console.error('historicoOrdenes no es un array:', historicoOrdenes);
      return [];
    }
    
    const ordenesSemana = historicoOrdenes.filter(orden => {
      try {
        if (!orden || !orden.fecha_de_orden) {
          return false;
        }
        
        const fechaOrden = new Date(orden.fecha_de_orden);
        return fechaOrden >= unaSemanaAtras;
      } catch (e) {
        console.error('Error al parsear fecha de orden:', orden?.fecha_de_orden, e);
        return false;
      }
    });
    
    // Debugging
    console.log(`Total órdenes históricas: ${historicoOrdenes.length}, Órdenes de la última semana: ${ordenesSemana.length}`);
    
    const contadorBebidas = {};
    ordenesSemana.forEach(orden => {
      const nombreBebida = orden.nombre_producto;
      if (nombreBebida) {
        contadorBebidas[nombreBebida] = (contadorBebidas[nombreBebida] || 0) + (orden.cantidad || 1);
      }
    });
    
    return Object.keys(contadorBebidas)
      .map(nombre => ({
        nombre,
        cantidad: contadorBebidas[nombre]
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 6);
  };

  return (
    <div>
      <Container fluid className="dashboard-container">
        {/* Header Section */}
        <Row className="mb-4">
          <Col xs={12}>
            <h1 className="dashboard-title">
              Dashboard del Bar - {new Date().toLocaleDateString('es-MX', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </h1>
            <div className="dashboard-title">
              Última actualización: {ultimaActualizacion.toLocaleTimeString('es-MX')}
            </div>
          </Col>
        </Row>
        
        {loading ? (
          <div className="text-center my-5">
            <h3 className="text-light">Cargando datos...</h3>
          </div>
        ) : (
          <>
            {/* KPI Cards Section - Symmetrical layout */}
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
            
            {/* Main Charts Section - Symmetrical side-by-side charts */}
            <Row className="mb-4">
              {/* Left side - Hourly Chart */}
              <Col xs={12} md={6} className="mb-4">
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
                          animationDuration={0}
                          isAnimationActive={false}
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
              
              {/* Right side - Pie Chart */}
              <Col xs={12} md={6} className="mb-4">
                <div className="chart-container">
                  <h2 className="chart-title">Bebidas Más Populares (última semana)</h2>
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
                          animationDuration={0}
                          isAnimationActive={false}
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

            {/* Bottom Full-width Chart Section */}
            <Row className="mb-4">
              <Col xs={12} className="mb-4">
                <div className="chart-container">
                  <h2 className="chart-title">Ganancias del Día por Minuto</h2>
                  {gananciasMinuto.length > 0 ? (
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={gananciasMinuto} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis 
                          dataKey="minuto" 
                          angle={-45} 
                          textAnchor="end"
                          height={60}
                          tick={{ fill: '#cfcfcf', fontSize: 10 }} 
                        />
                        <YAxis tick={{ fill: '#cfcfcf' }} />
                        <Tooltip 
                          formatter={(value) => [`$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, 'Ganancias']}
                          labelStyle={{ color: 'black' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="ganancias" 
                          stroke="#e74c3c" 
                          strokeWidth={3}
                          dot={{ stroke: '#e74c3c', strokeWidth: 2, r: 5 }}
                          activeDot={{ r: 8 }}
                          animationDuration={0}
                          isAnimationActive={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="text-center my-5">
                      <h4 className="text-light">No hay datos de ventas por minuto para hoy</h4>
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