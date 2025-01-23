import React, { useState } from "react";
import { StyleSheet, View, Text, Button, ScrollView } from "react-native";

const BartenderScreen = () => {
  const [orders, setOrders] = useState([
    {
      id: 1,
      mesa: 3,
      items: ["Botella", "Cubeta", "Mojito"],
      status: "Pendiente",
    },
    {
      id: 2,
      mesa: 5,
      items: ["Margarita", "Agua", "Cerveza"],
      status: "Pendiente",
    },
    {
      id: 3,
      mesa: 6,
      items: ["Whisky", "Ron", "Tequila"],
      status: "Pendiente",
    },
  ]);

  const handleCompleteOrder = (id) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === id ? { ...order, status: "Completado" } : order
      )
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Encabezado dinámico por mesa */}
            <View style={styles.header}>
              <Text style={styles.headerText}>MESA {order.mesa}</Text>
            </View>

            {/* Lista de ítems */}
            <View style={styles.orderContainer}>
              {order.items.map((item, index) => (
                <Text key={index} style={styles.orderText}>
                  {item}
                </Text>
              ))}

              {/* Botón para marcar como completado */}
              {order.status === "Pendiente" ? (
                <View style={styles.buttonContainer}>
                  <Button
                    title="Completado"
                    color="#003366"
                    onPress={() => handleCompleteOrder(order.id)}
                  />
                </View>
              ) : (
                <Text style={styles.completedText}>Pedido Completado</Text>
              )}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f4f4",
    padding: 10,
  },
  orderCard: {
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    elevation: 3,
  },
  header: {
    backgroundColor: "#2d2d86",
    paddingVertical: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  orderContainer: {
    padding: 15,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 20,
    alignSelf: "flex-end",
    width: 120,
  },
  completedText: {
    marginTop: 20,
    fontSize: 16,
    color: "green",
    fontWeight: "bold",
    textAlign: "right",
  },
});

export default BartenderScreen;
