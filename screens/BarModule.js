import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, Button, ScrollView, ActivityIndicator } from "react-native";

const BartenderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true); // Estado para manejar la carga

  // Función para obtener las órdenes desde la API
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/club/ordenes-de-compra/");
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);

      // Filtra las órdenes no completadas (completado = false)
      const pendingOrders = data.filter((order) => order.completado === false);
      setOrders(pendingOrders);
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      alert("Error al obtener las órdenes. Verifica la conexión o intenta nuevamente.");
    } finally {
      setLoading(false); // Finaliza la carga
    }
  };

  // Función para marcar todas las órdenes de una mesa como completadas
  const handleCompleteOrder = async (mesa) => {
    try {
      // Filtrar las órdenes de la mesa
      const mesaOrders = orders.filter((order) => order.mesas === parseInt(mesa));

      // Marcar cada orden como completada
      for (const order of mesaOrders) {
        const response = await fetch(`http://127.0.0.1:8000/club/ordenes-de-compra/${order.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completado: true }), // Actualiza completado a true
        });

        if (!response.ok) {
          throw new Error("Error al marcar la orden como completada");
        }
      }

      // Actualizar el estado local eliminando las órdenes completadas
      setOrders((prevOrders) => prevOrders.filter((order) => order.mesas !== parseInt(mesa)));
    } catch (error) {
      console.error("Error al completar las órdenes:", error);
    }
  };

  // Obtener las órdenes al cargar la pantalla
  useEffect(() => {
    fetchOrders();
  }, []);

  // Agrupar las órdenes por mesa
  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.mesas]) {
      acc[order.mesas] = [];
    }
    acc[order.mesas].push(order);
    return acc;
  }, {});

  // Mostrar un indicador de carga mientras se obtienen los datos
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {Object.keys(groupedOrders).length === 0 ? (
          <Text style={styles.noOrdersText}>No hay órdenes pendientes</Text>
        ) : (
          Object.keys(groupedOrders).map((mesa) => (
            <View key={mesa} style={styles.orderCard}>
              <View style={styles.header}>
                <Text style={styles.headerText}>MESA {mesa}</Text>
              </View>
              <View style={styles.orderContainer}>
                {groupedOrders[mesa].map((order) => (
                  <View key={order.id} style={styles.orderItem}>
                    <Text style={styles.orderText}>
                      {order.nombre_producto} x {order.cantidad}
                    </Text>
                  </View>
                ))}
                <View style={styles.buttonContainer}>
                  <Button
                    title="Completado"
                    color="#003366"
                    onPress={() => handleCompleteOrder(mesa)}
                  />
                </View>
              </View>
            </View>
          ))
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#003366",
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
    fontSize: 16,
    fontWeight: "bold",
  },
  orderContainer: {
    padding: 15,
  },
  orderItem: {
    marginBottom: 10,
  },
  orderText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 120,
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default BartenderScreen;