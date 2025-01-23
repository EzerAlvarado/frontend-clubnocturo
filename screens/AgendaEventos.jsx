import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Entypo from '@expo/vector-icons/Entypo';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { StatusBar } from 'expo-status-bar';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import AgregarEvento from './AgregarEvento';

const AgendaEventos = () => {
  const navigation = useNavigation();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.containerCalendar}>
                <Calendar
                  theme={{
                    backgroundColor: '#fffdf9', // Fondo del calendario
                    calendarBackground: '#fffdf9', // Fondo detrás del calendario
                    textDayFontSize: 16, // Tamaño del número del día
                    textMonthFontSize: 20, // Tamaño del mes
                    textDayHeaderFontSize: 14, // Tamaño de los encabezados de los días (L, M, X, etc.)
                    arrowColor: '#259588', // Color de las flechas de navegación

                  }}
                  markingType={'custom'}
                  markedDates={{
                    '2025-01-22' : {customStyles:{container:{backgroundColor:'#259588'}, text:{color:'white'}}}
                  }}

                  renderArrow={(direction) => (
                    <Entypo
                      name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
                      size={35} // Cambia el tamaño aquí
                      color="#259588" // Cambia el color si lo deseas
                    />
                  )}
                  
   
                
                />
                <StatusBar style="auto" />
              </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>

        <View style={styles.container}>

          {/* Título */}
              

          <Text style={styles.tituloLeft}>Eventos</Text>

          {/* Lista de Cards */}
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardFecha}>Miércoles, 1 de enero</Text>
              <Text style={styles.cardTitulo}>Evento de Karely</Text>
              <Text style={styles.cardSubtitulo}>Pago completado</Text>
            </View>
            <TouchableOpacity>
              <Entypo name="cross" size={45} color="#ff8888" />
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardFecha}>Jueves, 2 de enero</Text>
              <Text style={styles.cardTitulo}>Evento de Juan</Text>
              <Text style={styles.cardSubtitulo}>Pago pendiente</Text>
            </View>
            <TouchableOpacity >
              <Entypo name="cross" size={45} color="#ff8888" />
            </TouchableOpacity>
          </View>


          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.cardFecha}>Jueves, 2 de enero</Text>
              <Text style={styles.cardTitulo}>Evento de Juan</Text>
              <Text style={styles.cardSubtitulo}>Pago pendiente</Text>
            </View>
            <TouchableOpacity >
              <Entypo name="cross" size={45} color="#ff8888" />
            </TouchableOpacity>
          </View>


        </View>
      </ScrollView>

          {/* Botón circular */}
 
          <TouchableOpacity style={styles.addButton}
            onPress={() => navigation.navigate('Agregar Evento')}
          >
            <FontAwesome6 name="add" size={28} color="white" />
            </TouchableOpacity>
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
    paddingHorizontal:20,



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
  // Cards
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fffdf9',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    backgroundColor:'#f9f6f2',
    shadowColor: '#e1e1e1',
    shadowOpacity: 1, 
    shadowRadius: 4, 

  },
  cardContent: {
    flex: 1,
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
    color: '#259588',
    marginTop: 4,
  },

  // Botón circular
  botonArea: {
    alignItems: 'center',
    marginTop: 20,

  },
  addButton: {
    width: 55,
    height: 55,
    borderRadius: 30,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',

    position: 'absolute', // Botón fijo
    bottom: 20, // Separación desde la parte inferior
    right: 150, // Separación desde el borde derecho
    left: 150,
    alignSelf: 'center',
  },
  addButtonText: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
  },
});

export default AgendaEventos;