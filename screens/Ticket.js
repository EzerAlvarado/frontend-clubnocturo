import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import API_URL from '../url';
const IP = API_URL;
// URLs de los endpoints
const API_URLS = {
  TICKET_PROVISIONAL: "http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/cargos/ticket_provisional/", // Endpoint para obtener el ticket provisional
  CARGOS: "http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/cargos/", // Endpoint para obtener todos los cargos
  PAGAR: "http://tk4gscwgcoc0s08c00gskg8o.31.170.165.191.sslip.io/club/cargos/" // Base URL para pagar un cargo
};

const TicketScreen = ({ route, navigation }) => {
  const [ticket, setTicket] = useState(null); // Datos del ticket provisional
  const [cargo, setCargo] = useState(null); // Datos del cargo pendiente
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Extraer mesaId de los parámetros de la ruta
  const mesaId = route.params?.mesaId;

  // Función para mostrar alertas con opciones de navegación
  const mostrarAlerta = useCallback((titulo, mensaje, onPress = () => navigation.goBack()) => {
    Alert.alert(
      titulo,
      mensaje,
      [{ text: 'Aceptar', onPress }],
      { cancelable: false }
    );
  }, [navigation]);

  // Función para obtener el ticket provisional de la mesa
  const obtenerTicketProvisional = useCallback(async () => {
    if (!mesaId) {
      throw new Error("No se proporcionó un ID de mesa válido.");
    }

    try {
      // Hacer la solicitud GET al endpoint del ticket provisional
      const response = await fetch(`${API_URLS.TICKET_PROVISIONAL}?mesa_id=${mesaId}`);
      
      // Verificar si la respuesta es válida
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Respuesta del servidor (error):", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Intentar parsear la respuesta como JSON
      const ticketData = await response.json();
      console.log("Ticket provisional obtenido:", ticketData);

      // Verificar si hay un ticket provisional para la mesa
      if (ticketData.length === 0) {
        throw new Error("No hay un ticket provisional para esta mesa.");
      }

      return ticketData[0]; // Devolver el primer ticket provisional (si existe)
    } catch (error) {
      console.error('Error al obtener el ticket provisional:', error);
      throw new Error("No se pudo obtener el ticket provisional. Verifica la conexión o la URL.");
    }
  }, [mesaId]);

  // Función para obtener el cargo pendiente de la mesa
  const obtenerCargoPendiente = useCallback(async () => {
    if (!mesaId) {
      throw new Error("No se proporcionó un ID de mesa válido.");
    }

    // Hacer la solicitud GET al endpoint de cargos
    const response = await fetch(API_URLS.CARGOS);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const cargosData = await response.json();
    console.log("Cargos obtenidos:", cargosData);

    // Filtrar cargos para encontrar el que coincide con la mesa y está pendiente
    const cargoPendiente = cargosData.find(cargo => 
      cargo.mesa === parseInt(mesaId, 10) && cargo.estado === "pendiente"
    );

    if (!cargoPendiente) {
      throw new Error(`No se encontró un cargo pendiente para la mesa ${mesaId}.`);
    }

    return cargoPendiente;
  }, [mesaId]);

  // Función para obtener el ticket provisional y el cargo pendiente
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener el ticket provisional
      const ticketProvisional = await obtenerTicketProvisional();
      console.log("Ticket provisional encontrado:", ticketProvisional);

      // Obtener el cargo pendiente
      const cargoPendiente = await obtenerCargoPendiente();
      console.log("Cargo pendiente encontrado:", cargoPendiente);

      // Actualizar los estados con los datos obtenidos
      setTicket(ticketProvisional);
      setCargo(cargoPendiente);
    } catch (error) {
      console.error('Error al obtener los datos:', error);
      setError(error.message);
      mostrarAlerta('Error', error.message);
    } finally {
      setLoading(false);
    }
  }, [obtenerTicketProvisional, obtenerCargoPendiente, mostrarAlerta]);

  // Función para realizar el cobro
  const handleCobrar = useCallback(async () => {
    // Validar que exista un cargo con ID antes de proceder
    if (!cargo || !cargo.id) {
      Alert.alert('Error', 'No hay un cargo válido para cobrar.');
      return;
    }

    // Evitar múltiples clicks
    if (processingPayment) {
      return;
    }

    try {
      setProcessingPayment(true);
      const cargoId = cargo.id;
      console.log(`Intentando pagar el cargo con ID: ${cargoId}`);
      
      // Usar la URL con el ID del cargo
      const pagarUrl = `${API_URLS.PAGAR}${cargoId}/pagar/`;
      console.log("URL de pago:", pagarUrl);
      
      const pagarResponse = await fetch(pagarUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!pagarResponse.ok) {
        const errorText = await pagarResponse.text();
        console.error(`Error en la respuesta: ${pagarResponse.status} ${pagarResponse.statusText}`);
        console.error(`Detalle del error: ${errorText}`);
        throw new Error(`Error al pagar el cargo: ${pagarResponse.status}`);
      }

      try {
        const responseData = await pagarResponse.json();
        console.log("Respuesta de pago:", responseData);
      } catch (e) {
        console.log("La respuesta no contiene JSON válido");
      }

      mostrarAlerta('Éxito', 'Cobro realizado correctamente.', () => navigation.goBack());
    } catch (error) {
      console.error('Error al cobrar el cargo:', error);
      Alert.alert('Error', `No se pudo realizar el cobro: ${error.message}. Inténtalo de nuevo.`);
    } finally {
      setProcessingPayment(false);
    }
  }, [cargo, processingPayment, mostrarAlerta, navigation]);

  useEffect(() => {
    if (mesaId) {
      fetchData();
    }
  }, [mesaId, fetchData]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>Regresar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Renderizar la pantalla incluso si no hay ticket o cargo,
  // siempre que tengamos un ID de mesa
  if (!ticket || !cargo) {
    return null;
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

        {/* Sección de productos */}
        <Text style={styles.sectionTitle}>Productos:</Text>
        {ticket.productos && ticket.productos.length > 0 ? (
          ticket.productos.map((producto, index) => (
            <View key={index} style={styles.productoItem}>
              <Text style={styles.productoText}>
                {producto.producto} - {producto.cantidad} - X ${producto.precio_unitario.toFixed(2)} - Subtotal: ${producto.subtotal.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noProductsText}>No hay productos en este ticket</Text>
        )}
        <View style={styles.divider} />

        <Text style={styles.totalText}>Total: ${ticket.total_cobro || '0.00'}</Text>
        <View style={styles.divider} />
      </ScrollView>

      {cargo && (
        <View style={styles.footer}>
          <Text style={styles.footerText}>Seleccione la opción de cobrar una vez terminada la orden</Text>
          <TouchableOpacity 
            style={[styles.button, processingPayment && styles.disabledButton]} 
            onPress={handleCobrar}
            disabled={processingPayment}
          >
            <Text style={styles.buttonText}>
              {processingPayment ? 'Procesando...' : 'Cobrar'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F7F7' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#FFF', 
    paddingVertical: 15, 
    borderBottomWidth: 1, 
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 20
  },
  backButton: { 
    position: 'absolute', 
    left: 15 
  },
  backButtonText: { 
    fontSize: 18, 
    color: '#000' 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  content: { 
    padding: 20 
  },
  mesaText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  divider: { 
    height: 1, 
    backgroundColor: '#E0E0E0', 
    marginVertical: 10 
  },
  sectionTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  productoItem: { 
    marginBottom: 10, 
    backgroundColor: '#FFF', 
    padding: 10, 
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0' 
  },
  productoText: { 
    fontSize: 14, 
    color: '#333' 
  },
  noProductsText: {
    fontSize: 14, 
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 10
  },
  totalText: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  footer: { 
    backgroundColor: '#FFF', 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: '#E0E0E0', 
    alignItems: 'center' 
  },
  footerText: { 
    fontSize: 14, 
    color: '#666', 
    marginBottom: 10, 
    textAlign: 'center' 
  },
  button: { 
    backgroundColor: '#4CAF50', 
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 5 
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',  // Lighter green for disabled state
  },
  buttonText: { 
    color: '#FFF', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  errorText: { 
    fontSize: 18, 
    color: 'red', 
    textAlign: 'center', 
    marginTop: 20, 
    marginBottom: 20, 
    padding: 10 
  },
  loadingText: { 
    fontSize: 18, 
    color: '#666', 
    textAlign: 'center', 
    marginTop: 20 
  },
  loadingContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
});

export default TicketScreen;