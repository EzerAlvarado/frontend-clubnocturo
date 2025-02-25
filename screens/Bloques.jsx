import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Bloques = ({ navigation }) => {
  // Función para navegar a la pantalla de MenuBebidas con la mesa seleccionada
  const navigateToMenu = (mesa) => {
    navigation.navigate('Menu', { mesa }); // Pasar la mesa seleccionada
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecciona la mesa para tomar la orden</Text>

      <View style={styles.greenButtonSection}>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M1")} // Pasar "M1"
          >
            <Text style={styles.buttonText}>M1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M2")} // Pasar "M2"
          >
            <Text style={styles.buttonText}>M2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M3")} // Pasar "M3"
          >
            <Text style={styles.buttonText}>M3</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M4")} // Pasar "M4"
          >
            <Text style={styles.buttonText}>M4</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M5")} // Pasar "M5"
          >
            <Text style={styles.buttonText}>M5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.greenButton]}
            onPress={() => navigateToMenu("M6")} // Pasar "M6"
          >
            <Text style={styles.buttonText}>M6</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.redButtonSection}>
        <View style={styles.rowContainer}>
          <TouchableOpacity
            style={[styles.button, styles.redButton]}
            onPress={() => navigateToMenu("B1")} // Pasar "B1"
          >
            <Text style={styles.buttonText}>B1</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.redButton]}
            onPress={() => navigateToMenu("B2")} // Pasar "B2"
          >
            <Text style={styles.buttonText}>B2</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.redButton]}
            onPress={() => navigateToMenu("B3")} // Pasar "B3"
          >
            <Text style={styles.buttonText}>B3</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Estilos (sin cambios)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  greenButtonSection: {
    marginTop: 20,
  },
  redButtonSection: {
    marginTop: 40, // espacio entre los botones rojos
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  button: {
    width: 80,
    height: 50,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenButton: {
    backgroundColor: '#259588',
  },
  redButton: {
    backgroundColor: '#ff1d65',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default Bloques;