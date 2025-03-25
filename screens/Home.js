import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView, StyleSheet } from 'react-native';
import { useAuth } from '../AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // Formatear la fecha (por ejemplo: 17 de Enero)
  const day = currentDate.getDate();
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const month = months[currentDate.getMonth()];
  const formattedDate = `${day} de ${month}`;

  // Formatear la hora en formato 12 horas con indicador AM/PM
  let hours = currentDate.getHours();
  const minutes = currentDate.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingText}>Hola,</Text>
          <Text style={styles.usernameText}>
            {user ? user.nombre : 'Usuario'}
          </Text>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateContainer}>
            <Text style={styles.labelText}>Fecha de Hoy</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.labelText}>Hora Actual</Text>
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  greetingContainer: {
    marginBottom: 32,
  },
  greetingText: {
    fontSize: 24,
    color: '#6E7191',
    fontWeight: '400',
  },
  usernameText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1D2A32',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dateContainer: {
    alignItems: 'center',
  },
  timeContainer: {
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    color: '#6E7191',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D2A32',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D2A32',
  },
});

export default Home;