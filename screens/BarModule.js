import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import API_URL from "../url";

const BartenderScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const IP = API_URL;

  // Función para obtener las órdenes desde la API
  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://${IP}/club/ordenes-de-compra/`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Datos recibidos de la API:", data);
  
      // Transformar los datos agrupados por mesa a un array plano
      const allOrders = [];
      
      // Iterar sobre el array de objetos de mesa
      data.forEach(mesaObj => {
        // Verificar que hay órdenes para esta mesa
        if (mesaObj.ordenes && Array.isArray(mesaObj.ordenes)) {
          mesaObj.ordenes.forEach(order => {
            // Solo incluir órdenes donde listo_a_pagar es false
            if (order.listo_a_pagar === false) {
              // Añadir el mesa_id al objeto order si es necesario
              order.mesa_id = mesaObj.mesa_id;
              allOrders.push(order);
            }
          });
        }
      });

      // Ordenar las órdenes por fecha y hora (más antiguas primero)
      const sortedOrders = allOrders.sort((a, b) => {
        // Si hay fecha y hora completa
        if (a.fecha_de_orden && b.fecha_de_orden) {
          const dateA = new Date(a.fecha_de_orden);
          const dateB = new Date(b.fecha_de_orden);
          
          // Si las fechas son iguales, ordenar por ID
          if (dateA.getTime() === dateB.getTime()) {
            return a.id - b.id;
          }
          
          return dateA - dateB;
        }
        // Si no hay fecha, ordenar por ID
        return a.id - b.id;
      });
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error al obtener las órdenes:", error);
      alert("Error al obtener las órdenes. Verifica la conexión o intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar las órdenes periódicamente
  const startPolling = () => {
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000); // Actualiza cada 30 segundos
    
    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  };

  // Función para marcar todas las órdenes de una mesa como listas para pagar
  const handleCompleteOrder = async (mesa) => {
    try {
      // Filtrar las órdenes de la mesa
      const mesaOrders = orders.filter((order) => order.mesa === parseInt(mesa));

      // Marcar cada orden como lista para pagar
      for (const order of mesaOrders) {
        const response = await fetch(`http://${IP}/club/ordenes-de-compra/${order.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ listo_a_pagar: true }), // Cambiamos listo_a_pagar a true
        });

        if (!response.ok) {
          throw new Error("Error al marcar la orden como completada");
        }
      }

      // Actualizar el estado local eliminando las órdenes completadas
      setOrders((prevOrders) => prevOrders.filter((order) => order.mesa !== parseInt(mesa)));
    } catch (error) {
      console.error("Error al completar las órdenes:", error);
      alert("Error al completar las órdenes. Inténtalo nuevamente.");
    }
  };

  // Obtener las órdenes al cargar la pantalla y configurar el polling
  useEffect(() => {
    fetchOrders();
    const cleanupPolling = startPolling();
    
    return () => {
      cleanupPolling(); // Limpia el intervalo cuando el componente se desmonte
    };
  }, []);

  // Agrupar las órdenes por mesa pero conservando el orden cronológico de llegada
  const groupOrdersByMesa = () => {
    // Primero, agrupar las órdenes por mesa
    const groupedByMesa = orders.reduce((acc, order) => {
      const mesa = order.mesa;
      if (!acc[mesa]) {
        acc[mesa] = {
          mesa,
          orders: [],
          notas: new Set(),
          // Guardamos la primera orden para ordenar las mesas por tiempo de llegada
          firstOrderTime: order.fecha_de_orden || order.id,
          firstOrderId: order.id
        };
      }
      
      acc[mesa].orders.push(order);
      
      if (order.nota && order.nota.trim()) {
        acc[mesa].notas.add(order.nota);
      }
      
      return acc;
    }, {});
    
    // Convertir a array y ordenar las mesas por primera orden recibida
    return Object.values(groupedByMesa).sort((a, b) => {
      // Primero intentar ordenar por fecha
      if (a.firstOrderTime && b.firstOrderTime) {
        const dateA = new Date(a.firstOrderTime);
        const dateB = new Date(b.firstOrderTime);
        
        // Si las fechas son iguales, ordenar por ID
        if (dateA.getTime() === dateB.getTime()) {
          return a.firstOrderId - b.firstOrderId;
        }
        
        return dateA - dateB;
      }
      // Si no hay fecha, ordenar por ID de la primera orden
      return a.firstOrderId - b.firstOrderId;
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Cargando órdenes...</Text>
      </View>
    );
  }

  // Obtener las mesas ordenadas cronológicamente
  const orderedMesas = groupOrdersByMesa();

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.mainTitle}>Órdenes Pendientes</Text>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={fetchOrders}
        >
          <Text style={styles.refreshButtonText}>Actualizar</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView>
        {orderedMesas.length === 0 ? (
          <Text style={styles.noOrdersText}>No hay órdenes pendientes</Text>
        ) : (
          orderedMesas.map(({ mesa, orders: mesaOrders, notas }) => {
            const notasArray = Array.from(notas);
            
            return (
              <View key={mesa} style={styles.orderCard}>
                <View style={styles.header}>
                  <Text style={styles.headerText}>MESA {mesa}</Text>
                </View>
                <View style={styles.orderContainer}>
                  {mesaOrders.map((order) => (
                    <View key={order.id} style={styles.orderItem}>
                      <Text style={styles.orderText}>
                        {order.nombre_producto} x {order.cantidad}
                      </Text>
                    </View>
                  ))}
                  
                  {notasArray.length > 0 && (
                    <View style={styles.notaSection}>
                      <Text style={styles.notaTitle}>Notas:</Text>
                      {notasArray.map((nota, index) => (
                        <View key={index} style={styles.notaContainer}>
                          <Text style={styles.notaText}>{nota}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                      style={styles.completeButton}
                      onPress={() => handleCompleteOrder(mesa)}
                    >
                      <Text style={styles.completeButtonText}>Completar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
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
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 5,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d2d86',
  },
  refreshButton: {
    backgroundColor: '#2d2d86',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
  notaSection: {
    marginTop: 5,
    marginBottom: 15,
    borderTopWidth: 1,
    borderTopColor: "#eaeaea",
    paddingTop: 10,
  },
  notaTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2d2d86",
    marginBottom: 5,
  },
  notaContainer: {
    backgroundColor: "#f0f0f8",
    borderRadius: 8,
    padding: 10,
    marginBottom: 5,
  },
  notaText: {
    fontSize: 14,
    color: "#444",
    fontStyle: "italic",
  },
  buttonContainer: {
    marginTop: 10,
    alignSelf: "flex-end",
    width: 120,
  },
  completeButton: {
    backgroundColor: "#003366",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  completeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  noOrdersText: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    color: "#666",
  },
});

export default BartenderScreen;