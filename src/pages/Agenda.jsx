import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/AgendaEventos.css'; // Estilos CSS
import '../styles/global.css';

const AgendaEventos = () => {
  const [events, setEvents] = useState([]);

  // Función para cargar los eventos del backend
  const loadEvents = async () => {
    try {
      const response = await fetch('http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/eventos/');
      if (!response.ok) {
        alert("Error: No se pudieron cargar los eventos.");
        return;
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      alert("Error: Error al conectar con el servidor.");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Construir el objeto markedDates para el calendario
  const markedDates = {};
  events.forEach((event) => {
    const dateKey = new Date(event.fecha_inicio_de_evento).toISOString().split('T')[0];
    markedDates[dateKey] = { className: 'event-date' }; // Clase CSS para fechas con eventos
  });

  return (
    <div className="agenda-container">
      {/* Lista de eventos a la izquierda */}
      <div className="events-list">
        <h1>Próximos eventos</h1>
        {events.map((event) => {
          const fechaInicio = new Date(event.fecha_inicio_de_evento);
          const fechaFormatted = fechaInicio.toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          });
          return (
            <div key={event.id} className="event-card">
              <div className="card-content">
                <p className="card-fecha">{fechaFormatted}</p>
                <p className="card-titulo">{event.observaciones}</p>
                <p
                  className="card-subtitulo"
                  style={{ color: event.pago_renta ? '#4CAF50' : '#FF5252' }}
                >
                  {event.pago_renta ? 'Pago completado' : 'Pago pendiente'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Calendario a la derecha */}
      <div className="calendar-container">
        <Calendar
          className="custom-calendar"
          tileClassName={({ date }) => {
            const dateKey = date.toISOString().split('T')[0];
            return markedDates[dateKey] ? markedDates[dateKey].className : null;
          }}
        />
      </div>
    </div>
  );
};

export default AgendaEventos;