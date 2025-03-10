import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// URLs de los endpoints
const API_URLS = {
  CARGOS: "http://127.0.0.1:8000/club/cargos/ticket_provisional/",
};

const TicketScreen = ({ route, navigation }) => {
  const [ticket, setTicket] = useState(null);
  const [cargo, setCargo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Función para obtener cargos
  const obtenerCargos = useCallback(async () => {
    if (!mesaId) {
      throw new Error("No se proporcionó un ID de mesa válido.");
    }

    const response = await fetch(`${API_URLS.CARGOS}?mesa_id=${mesaId}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const cargosData = await response.json();
    return cargosData;
  }, [mesaId]);

  // Función para obtener el ticket
  const fetchTicket = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!mesaId) {
        throw new Error("No se proporcionó un ID de mesa válido.");
      }

      // Obtener cargos
      const cargosData = await obtenerCargos();
      console.log("Cargos obtenidos:", cargosData);

      // Verificar si hay un cargo para la mesa
      if (cargosData.length > 0) {
        const cargoMesa = cargosData.find(cargo => cargo.mesa === mesaId);
        
        if (cargoMesa) {
          setTicket(cargoMesa);
          setCargo(cargoMesa);
        } else {
          // Modificación 1: Si no existe cargo, mantener la pantalla pero sin datos
          setCargo({ mesa: mesaId }); // Solo guardar el ID de la mesa
          setTicket(null);
        }
      } else {
        // Modificación 1: Si no hay cargos, mantener la pantalla pero sin datos
        setCargo({ mesa: mesaId }); // Solo guardar el ID de la mesa
        setTicket(null);
      }
    } catch (error) {
      console.error('Error al obtener el ticket:', error);
      setError(error.message);
      mostrarAlerta('Error', 'No se pudo cargar el ticket. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [mesaId, obtenerCargos, mostrarAlerta]);

  const handleCobrar = async () => {
  try {
    if (!ticket) {
      throw new Error("No hay un ticket para cobrar.");
    }

    // Usar la nueva URL para pagar el cargo
    const pagarResponse = await fetch(`http://127.0.0.1:8000/club/cargos/${mesaId}/pagar/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // No es necesario enviar el estado en el cuerpo ya que la acción de pagar está implícita en el endpoint
    });

    if (!pagarResponse.ok) {
      throw new Error('Error al pagar el cargo');
    }

    mostrarAlerta('Éxito', 'Ticket cobrado correctamente.', () => navigation.goBack());
  } catch (error) {
    console.error('Error al cobrar el ticket:', error);
    Alert.alert('Error', 'No se pudo cobrar el ticket. Inténtalo de nuevo.');
  }
  };

  useEffect(() => {
    if (mesaId) {
      fetchTicket();
    }
  }, [mesaId, fetchTicket]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003366" />
        <Text style={styles.loadingText}>Cargando ticket...</Text>
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

  // Modificación 1: Renderizar la pantalla incluso si no hay ticket,
  // siempre que tengamos un ID de mesa
  if (!cargo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Regresar</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket - Mesa {cargo.mesa}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.mesaText}>Mesa ID: {cargo.mesa}</Text>
        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Productos:</Text>
        {ticket && ticket.productos && ticket.productos.length > 0 ? (
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

        <Text style={styles.totalText}>Total: ${ticket ? ticket.total_cobro : '0.00'}</Text>
        <View style={styles.divider} />
      </ScrollView>

        {cargo && (
    <View style={styles.footer}>
      <Text style={styles.footerText}>Seleccione la opción de cobrar una vez terminada la orden</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleCobrar}
        disabled={!ticket || !ticket.productos || ticket.productos.length === 0}
      >
        <Text style={styles.buttonText}>Cobrar</Text>
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