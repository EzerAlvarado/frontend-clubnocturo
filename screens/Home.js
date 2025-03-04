import React, { useState, useEffect, useContext } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AuthContext } from '../AuthContext'; // Ajusta la ruta según la ubicación del archivo

const Home = () => {
  const { user } = useContext(AuthContext);
  const [currentDate, setCurrentDate] = useState(new Date());



  useEffect(() => {
    // Actualiza la fecha cada segundo
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
  hours = hours ? hours : 12; // Si es 0, se muestra como 12
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Bienvenido</Text>
      {/* Se muestra el nombre del usuario si existe, de lo contrario se muestra "Usuario" */}
      <Text style={styles.subtitulo}>{user ? user.nombre : 'Usuario'}</Text>
      <Text style={styles.titulo}>Hoy</Text>
      <Text style={styles.subtitulo}>{formattedDate}</Text>
      <Text style={styles.subtitulo}>{formattedTime}</Text>
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  titulo: {
    fontSize: 31,
    fontWeight: "700",
    color: "#1D2A32",
    marginBottom: 6,
  },
  subtitulo: {
    fontSize: 15,
    fontWeight: "500",
    color: "#929292",
  },
});
