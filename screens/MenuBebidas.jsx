import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const MenuBebidas = () => {
  const [quantities, setQuantities] = useState({
    Botella: 0,
    Cubeta: 0,
    Jugo: 0,
    Mojito: 0,
    Margarita: 0,
    Agua: 0,
  });

  const increment = (item) => {
    setQuantities((prev) => ({
      ...prev,
      [item]: prev[item] + 1,
    }));
  };

  const decrement = (item) => {
    setQuantities((prev) => ({
      ...prev,
      [item]: prev[item] > 0 ? prev[item] - 1 : 0,
    }));
  };

  return (
    <View style={styles.container}>

      <Text style={[styles.title, styles.titleAligned]}>Mesa: --- </Text>

      <Text style={styles.sectionTitle}>Selecciona la cantidad de la orden</Text>

      <View style={styles.menuContainer}>
        {Object.keys(quantities).map((item) => (
          <View key={item} style={styles.menuItem}>
            <Text style={styles.menuItemText}>{item}</Text>

            <View style={styles.controlsContainer}>
              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => decrement(item)}
              >
                <Text style={styles.controlButtonText}>&lt;</Text>
              </TouchableOpacity>

              <Text style={styles.quantityText}>{quantities[item]}</Text>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => increment(item)}
              >
                <Text style={styles.controlButtonText}>&gt;</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.viewOrderButton}>
        <Text style={styles.viewOrderButtonText}>Orden actual</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  titleAligned: {
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 10,
  },
  menuContainer: {
    backgroundColor: '#F1F1F1',
    padding: 10,
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: '#259588',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  controlButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '500',
    minWidth: 20,
    textAlign: 'center',
  },
  viewOrderButton: {
    backgroundColor: '#259588',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  viewOrderButtonText: {
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default MenuBebidas;
