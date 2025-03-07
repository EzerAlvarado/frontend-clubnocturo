import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// URLs de los endpoints
const API_URLS = {
  ordenesDeCompra: "http://127.0.0.1:8000/club/ordenes-de-compra/",
  cargos: "http://127.0.0.1:8000/club/cargos/",
  tickets: "http://127.0.0.1:8000/club/tickets/",
};

const TicketScreen = ({ route, navigation }) => {
  const [ticket, setTicket] = useState(null);
  const [productos, setProductos] = useState([]);
  const [totalMesa, setTotalMesa] = useState(0); // Estado para el total de la mesa
  const [loading, setLoading] = useState(true);

  const fetchTicket = async () => {
    try {
      const mesaId = route.params.mesaId;
      if (!mesaId) {
        throw new Error("No se proporcionó un ID de mesa válido.");
      }
  
      // Obtener las órdenes de compra para la mesa específica
      const ordenesResponse = await fetch(`${API_URLS.ordenesDeCompra}?mesas=${mesaId}`);
      if (!ordenesResponse.ok) {
        throw new Error(`Error ${ordenesResponse.status}: ${response.statusText}`);
      }
      const ordenesData = await ordenesResponse.json();
      console.log("Órdenes de compra:", ordenesData); // Depuración
  
      // Filtrar y acumular productos para la mesa específica
      const productosAcumulados = ordenesData.reduce((acc, orden) => {
        if (orden.mesas === mesaId) {
          const productoExistente = acc.find((p) => p.producto === orden.producto);
          if (productoExistente) {
            productoExistente.cantidad += orden.cantidad;
            productoExistente.precio_orden += parseFloat(orden.precio_orden);
          } else {
            acc.push({
              ...orden,
              precio_orden: parseFloat(orden.precio_orden),
            });
          }
        }
        return acc;
      }, []);
  
      setProductos(productosAcumulados);
  
      // Obtener el ticket (cargo) asociado a la mesa específica
      const cargosResponse = await fetch(`${API_URLS.cargos}?mesa=${mesaId}`);
      if (!cargosResponse.ok) {
        throw new Error(`Error ${cargosResponse.status}: ${cargosResponse.statusText}`);
      }
      const cargosData = await cargosResponse.json();
      console.log("Cargos:", cargosData); // Depuración
  
      // Verificar si hay un cargo para la mesa
      if (cargosData.length > 0) {
        const cargoMesa = cargosData.find((cargo) => cargo.mesa === mesaId);
        if (cargoMesa) {
          setTicket(cargoMesa); // Usar el cargo encontrado para la mesa
        } else {
          // Si no hay un cargo para la mesa, mostrar un Alert
          Alert.alert(
            'Aviso',
            'No se encontró un ticket para esta mesa.',
            [
              {
                text: 'Aceptar',
                onPress: () => navigation.goBack(), // Regresar a la pantalla anterior
              },
            ],
            { cancelable: false }
          );
        }
      } else {
        // Si no hay cargos, mostrar un Alert
        Alert.alert(
          'Aviso',
          'No se encontró un ticket para esta mesa.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.goBack(), // Regresar a la pantalla anterior
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error al obtener el ticket o los productos:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar el ticket. Inténtalo de nuevo.',
        [
          {
            text: 'Aceptar',
            onPress: () => navigation.goBack(), // Regresar a la pantalla anterior
          },
        ],
        { cancelable: false }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCobrar = async () => {
    try {
      if (!ticket) {
        throw new Error("No hay un ticket para cobrar.");
      }

      // Actualizar el estado del cargo a "cobrado"
      const updateCargoResponse = await fetch(`${API_URLS.cargos}${ticket.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'cobrado' }),
      });

      if (!updateCargoResponse.ok) {
        throw new Error('Error al actualizar el estado del cargo');
      }

      // Crear un nuevo ticket en la tabla de tickets
      const createTicketResponse = await fetch(API_URLS.tickets, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          total_cobro: totalMesa, // Usar el total calculado para la mesa
          usuario_responsable: ticket.usuario_responsable,
          estado: 'cobrado',
          mesa: ticket.mesa,
        }),
      });

      if (!createTicketResponse.ok) {
        throw new Error('Error al crear el ticket');
      }

      Alert.alert('Éxito', 'Ticket cobrado y guardado correctamente.');
      navigation.goBack();
    } catch (error) {
      console.error('Error al cobrar el ticket:', error);
      Alert.alert('Error', 'No se pudo cobrar el ticket. Inténtalo de nuevo.');
    }
  };

  useEffect(() => {
    if (route.params?.mesaId) {
      fetchTicket();
    }
  }, [route.params?.mesaId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Cargando ticket...</Text>
      </View>
    );
  }

  if (!ticket) {
    return null; // No mostrar nada si no hay ticket
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket - Mesa {ticket.mesa}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.mesaText}>Mesa ID: {ticket.mesa}</Text>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Productos:</Text>
        {productos.map((producto, index) => (
          <View key={index} style={styles.productoItem}>
            <Text style={styles.productoText}>
              {producto.nombre_producto} - Cantidad: {producto.cantidad} - Total: ${producto.precio_orden.toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />

        <Text style={styles.totalText}>Total: ${totalMesa.toFixed(2)}</Text> {/* Mostrar el total de la mesa */}
        <View style={styles.divider} />

        <Text style={styles.footerText}>Estado: {ticket.estado}</Text>
      </ScrollView>

      {ticket.estado === 'pendiente' && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Seleccione la opción de cobrar una vez terminada la orden</Text>
          <TouchableOpacity style={styles.button} onPress={handleCobrar}>
            <Text style={styles.buttonText}>Cobrar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  backButton: { position: 'absolute', left: 15 },
  backButtonText: { fontSize: 18, color: '#000' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000' },
  content: { padding: 20 },
  mesaText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  productoItem: { marginBottom: 10 },
  productoText: { fontSize: 14, color: '#333' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  footer: { backgroundColor: '#FFF', padding: 20, borderTopWidth: 1, borderTopColor: '#E0E0E0', alignItems: 'center' },
  footerText: { fontSize: 14, color: '#666', marginBottom: 10, textAlign: 'center' },
  button: { backgroundColor: '#4CAF50', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 5 },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  errorText: { fontSize: 18, color: 'red', textAlign: 'center', marginTop: 20 },
  loadingText: { fontSize: 18, color: '#666', textAlign: 'center', marginTop: 20 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default TicketScreen;