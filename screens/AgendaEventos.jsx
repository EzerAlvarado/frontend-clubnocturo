import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import API_URL from '../url';

const AgendaEventos = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);

  // Variable de IP 
  const IP = API_URL;

  // Función para cargar los eventos del backend
  const loadEvents = async () => {
    try {
      const response = await fetch(`http://${IP}/club/eventos/`);
      if (!response.ok) {
        Alert.alert("Error", "No se pudieron cargar los eventos.");
        return;
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      Alert.alert("Error", "Error al conectar con el servidor.");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Función para "cargar" o ver detalles del evento (puede ser navegación a detalle)
  const handleLoadEvent = (event) => {
    navigation.navigate('Editar', { event });
  };

  // Función para eliminar un evento
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://${IP}/club/eventos/${id}/`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        Alert.alert("Error", "No se pudo eliminar el evento.");
      } else {
        Alert.alert("Éxito", "Evento eliminado correctamente.");
        // Se vuelve a cargar la lista de eventos
        loadEvents();
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      Alert.alert("Error", "Error al conectar con el servidor.");
    }
  };

  // Construir el objeto markedDates para el calendario basándose en la fecha de inicio de cada evento
  const markedDates = {};
  events.forEach((event) => {
    const dateKey = new Date(event.fecha_inicio_de_evento).toISOString().split('T')[0];
    markedDates[dateKey] = {
      customStyles: {
        container: { backgroundColor: '#259588' },
        text: { color: 'white' },
      },
    };
  });

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.containerCalendar}>
        <Calendar
          theme={{
            backgroundColor: '#fffdf9',
            calendarBackground: '#fffdf9',
            textDayFontSize: 16,
            textMonthFontSize: 20,
            textDayHeaderFontSize: 14,
            arrowColor: '#259588',
          }}
          markingType={'custom'}
          markedDates={markedDates}
          renderArrow={(direction) => (
            <Entypo
              name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
              size={35}
              color="#259588"
            />
          )}
        />
        <StatusBar style="auto" />
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          <Text style={styles.tituloLeft}>Eventos</Text>
          {events.map((event) => {
            // Formatear la fecha de inicio para mostrarla (por ejemplo, "miércoles, 1 de enero")
            const fechaInicio = new Date(event.fecha_inicio_de_evento);
            const fechaFormatted = fechaInicio.toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            });
            return (
              <TouchableOpacity
                key={event.id}
                style={styles.card}
                onPress={() => handleLoadEvent(event)}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardFecha}>{fechaFormatted}</Text>
                  <Text style={styles.cardTitulo}>{event.observaciones}</Text>
                  <Text
                    style={[
                      styles.cardSubtitulo,
                      { color: event.pago_renta ? '#259588' : '#ff8888' },
                    ]}
                  >
                    {event.pago_renta ? 'Pago completado' : 'Pago pendiente'}
                  </Text>
                </View>
                


                <TouchableOpacity onPress={() => handleDelete(event.id)}>
                  <Entypo name="cross" size={45} color="#ff8888" />
                </TouchableOpacity>
              </TouchableOpacity>
              
            );
          })}
          <View style={styles.bottomContent}></View>
        </View>
      </ScrollView>
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={styles.reloadButton} onPress={loadEvents}>
          <Entypo name="cycle" size={28} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('Agregar')}
        >
          <FontAwesome6 name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    flexGrow: 1,
    backgroundColor: '#fffdf9',
  },
  containerCalendar: {
    paddingVertical: 12,
    flexGrow: 1,
    backgroundColor: '#fffdf9',
    paddingHorizontal: 20,
  },
  tituloLeft: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1D2A32',
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'left',
    paddingHorizontal: 25,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    backgroundColor: '#f9f6f2',
    shadowColor: '#e1e1e1',
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  cardContent: {
    flex: 1,
  },
  bottomContent: {
    flex: 1,
    paddingTop: 35,

  },
  cardFecha: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
    marginTop: 4,
  },
  cardTitulo: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
  },
  cardSubtitulo: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 20,
    right: 150,
    left: 150,
    alignSelf: 'center',

  },
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    flexDirection: 'row',
  },
  reloadButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 20,
    opacity: 0.85,

  },
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    opacity: 0.85,
  },
  
});

export default AgendaEventos;
