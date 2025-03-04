import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import API_URL from '../url';
//const API_URL = 'http://127.0.0.1:8000/club/cargos/'; // Ajusta la URL según tu API

// Variable de IP 
const IP = API_URL;


const TicketScreen = ({ route, navigation }) => {
  const [ticket, setTicket] = useState(null);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Función para obtener el ticket y los productos asociados
  const fetchTicket = async () => {
    try {
      // Obtener el ticket
      const response = await fetch(`${API_URL}${route.params.mesaId}/`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const ticketData = await response.json();
      setTicket(ticketData);

      // Obtener los productos asociados al ticket
      const productosResponse = await fetch(`http://${IP}:8000/club/ordenes-de-compra/?mesa=${route.params.mesaId}`);
      if (!productosResponse.ok) {
        throw new Error(`Error ${productosResponse.status}: ${productosResponse.statusText}`);
      }
      const productosData = await productosResponse.json();

      // Acumular productos repetidos
      const productosAcumulados = productosData.reduce((acc, producto) => {
        const productoExistente = acc.find((p) => p.producto.id === producto.producto.id);
        if (productoExistente) {
          productoExistente.cantidad += producto.cantidad;
          productoExistente.precio_orden += producto.precio_orden;
        } else {
          acc.push({ ...producto });
        }
        return acc;
      }, []);

      setProductos(productosAcumulados);
    } catch (error) {
      console.error('Error al obtener el ticket o los productos:', error);
      Alert.alert('Error', 'No se pudo cargar el ticket. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cobrar el ticket
  const handleCobrar = async () => {
    try {
      // Actualizar el estado del ticket a "Cobrado"
      const response = await fetch(`http://${IP}:8000/club/cargos/${ticket.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: 'Cobrado' }),
      });

      if (!response.ok) {
        throw new Error('Error al cobrar el ticket');
      }

      // Guardar el ticket en la tabla "tickets"
      const saveTicketResponse = await fetch(`http://${IP}:8000/club/tickets/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mesa_id: ticket.mesa_id,
          total_cobro: ticket.total_cobro,
          estado: 'Cobrado',
          usuario_responsable: ticket.usuario_responsable,
        }),
      });

      if (!saveTicketResponse.ok) {
        throw new Error('Error al guardar el ticket en la tabla tickets');
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
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró el ticket.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket - Mesa {ticket.mesa_id}</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Mostrar el ID de la mesa */}
        <Text style={styles.mesaText}>Mesa ID: {ticket.mesa_id}</Text>
        <View style={styles.divider} />

        {/* Mostrar los productos */}
        <Text style={styles.sectionTitle}>Productos:</Text>
        {productos.map((producto, index) => (
          <View key={index} style={styles.productoItem}>
            <Text style={styles.productoText}>
              {producto.producto.nombre_producto} - Cantidad: {producto.cantidad} - Total: ${producto.precio_orden}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />

        {/* Mostrar el total */}
        <Text style={styles.totalText}>Total: ${ticket.total_cobro}</Text>
        <View style={styles.divider} />

        {/* Mostrar el estado */}
        <Text style={styles.footerText}>Estado: {ticket.estado}</Text>
      </ScrollView>

      {/* Botón de cobrar si el estado es "Pendiente" */}
      {ticket.estado === 'Pendiente' && (
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