import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../AuthContext';
import API_URL from '../url';

const MenuBebidas = ({ navigation, route }) => {
  const { mesa } = route.params;
  const { user } =  useAuth();

  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [nota, setNota] = useState('');

  // Variable de IP 
  const IP = API_URL;

  // Asegurarnos de que mesaId sea un valor numérico
  const mesaId = mesa?.id ? parseInt(mesa.id, 10) : null;
  const usuarioResponsableId = user ? user.id : null;

  useEffect(() => {
    fetchProductos();
  }, []);

  useEffect(() => {
    if (categoriaSeleccionada) {
      setProductosFiltrados(productos.filter(p => p.categoria === categoriaSeleccionada));
    } else {
      setProductosFiltrados(productos);
    }
  }, [categoriaSeleccionada, productos]);

  const fetchProductos = async () => {
    try {
      const response = await fetch(`http://${IP}:8000/club/productos/`);
      if (!response.ok) {
        throw new Error("Error al obtener los productos");
      }
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al obtener los Productos:", error);
    }
  };

  const increment = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: (prev[id] || 0) + 1,
    }));
  };

  const decrement = (id) => {
    setQuantities(prev => ({
      ...prev,
      [id]: prev[id] > 0 ? prev[id] - 1 : 0,
    }));
  };

  // Función para agregar todos los productos seleccionados
  const agregarProductosSeleccionados = () => {
    const hayProductosParaAgregar = Object.entries(quantities).some(([id, cantidad]) => cantidad > 0);
    
    if (!hayProductosParaAgregar) {
      Alert.alert("Aviso", "No hay productos seleccionados para agregar");
      return;
    }

    Object.entries(quantities).forEach(([id, cantidad]) => {
      if (cantidad > 0) {
        const producto = productos.find(p => p.id.toString() === id.toString());
        if (producto) {
          setProductosSeleccionados(prev => {
            const index = prev.findIndex(p => p.id === producto.id);
            if (index !== -1) {
              const nuevosProductos = [...prev];
              nuevosProductos[index].cantidad += cantidad;
              return nuevosProductos;
            }
            return [...prev, { ...producto, cantidad }];
          });
        }
      }
    });

    // Limpiar cantidades después de agregar
    setQuantities({});
    Alert.alert("Éxito", "Productos agregados a la orden");
  };

  const modificarCantidad = (id, nuevaCantidad) => {
    setProductosSeleccionados(prev => {
      const index = prev.findIndex(p => p.id === id);
      if (index !== -1) {
        if (nuevaCantidad <= 0) {
          return prev.filter(p => p.id !== id);
        } else {
          const nuevosProductos = [...prev];
          nuevosProductos[index].cantidad = nuevaCantidad;
          return nuevosProductos;
        }
      }
      return prev;
    });
  };

  const confirmarOrden = async () => {
    try {
      // Verificación de ID de mesa
      if (!mesaId) {
        Alert.alert("Error", "No se ha proporcionado un ID de mesa válido");
        return;
      }
  
      if (productosSeleccionados.length === 0) {
        Alert.alert("Aviso", "No hay productos seleccionados para confirmar");
        return;
      }
  
      // Iterar sobre los productos seleccionados y enviar una solicitud POST por cada uno
      for (const producto of productosSeleccionados) {
        const datosOrden = {
          mesa_id: mesaId,
          producto_id: producto.id,
          cantidad: producto.cantidad,
          usuario_responsable_id: usuarioResponsableId,
          nota: nota,
        };
  
        console.log("Datos enviados al servidor:", JSON.stringify(datosOrden, null, 2)); // Depuración
  
        const response = await fetch(`http://${IP}:8000/club/ordenes/crear/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(datosOrden),
        });
  
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al confirmar la orden para el producto ${producto.id}: ${errorText}`);
        }
      }
  
      // Limpiar el estado después de confirmar la orden
      setProductosSeleccionados([]);
      setQuantities({});
      setNota('');
      Alert.alert("Éxito", "Orden confirmada con éxito");
    } catch (error) {
      console.error("Error al confirmar la orden:", error);
      Alert.alert("Error", error.message);
    }
  };

  const cancelarOrden = () => {
    setProductosSeleccionados([]);
    setQuantities({});
    setNota('');
    Alert.alert("Orden cancelada");
  };

  const verTicket = () => {
    // Verificar si hay un ID de mesa válido
    if (!mesaId) {
      Alert.alert("Error", "No se ha proporcionado un ID de mesa válido");
      return;
    }
  
    // Navegar directamente a la pantalla del ticket con el ID de la mesa
    navigation.navigate('Ticket', { mesaId });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Header con Regresar, título y nombre de la mesa */}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Menú de Bebidas</Text>
          <Text style={styles.tableName}>{mesa.display}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Regresar</Text>
          </TouchableOpacity>
        </View>

        {/* Información de la mesa para depuración */}
        <View style={styles.mesaInfoContainer}>
          <Text style={styles.mesaInfoText}>Mesa ID: {mesaId}</Text>
        </View>

        {/* Picker sin etiqueta */}
        <Picker
          selectedValue={categoriaSeleccionada}
          onValueChange={(itemValue) => setCategoriaSeleccionada(itemValue)}
          style={styles.picker}
          itemStyle={styles.pickerItem}
        >
          <Picker.Item label="Todas" value="" />
          <Picker.Item label="Botellas" value="Botellas" />
          <Picker.Item label="Bebidas Preparadas" value="Bebidas preparadas" />
          <Picker.Item label="Jugos y refrescos" value="Jugos y refrescos" />
          <Picker.Item label="Agua" value="Agua" />
        </Picker>

        {/* Lista de productos con scroll propio */}
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.menuItem}>
              <Text style={styles.menuItemText}>
                {item.nombre_producto} - ${item.precio}
              </Text>
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={() => decrement(item.id)}>
                  <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantities[item.id] || 0}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => increment(item.id)}>
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 5 }}
          style={{ maxHeight: 300, width: '100%' }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

        {/* Botón único para agregar productos */}
        <TouchableOpacity 
          style={styles.buttonAgregarTodos} 
          onPress={agregarProductosSeleccionados}
        >
          <Text style={styles.buttonAgregarTodosText}>Añadir a la orden</Text>
        </TouchableOpacity>

        {/* Campo para notas */}
        <View style={styles.notaContainer}>
          <Text style={styles.notaLabel}>Notas para la orden:</Text>
          <TextInput
            style={styles.notaInput}
            value={nota}
            onChangeText={setNota}
            placeholder="Especificaciones del cliente (opcional)"
            multiline={true}
            numberOfLines={3}
          />
        </View>

        {/* Texto para los productos seleccionados */}
        <Text style={styles.selectedTitle}>Productos seleccionados</Text>
        
        {/* Lista de productos seleccionados sin restricción de altura */}
        <FlatList
          data={productosSeleccionados}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.selectedItem}>
              <Text style={styles.selectedItemText}>
                {item.nombre_producto} x{item.cantidad} - ${item.cantidad * item.precio}
              </Text>
              <View style={styles.controlsContainer}>
                <TouchableOpacity style={styles.controlButton} onPress={() => modificarCantidad(item.id, item.cantidad - 1)}>
                  <Text style={styles.controlButtonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.cantidad}</Text>
                <TouchableOpacity style={styles.controlButton} onPress={() => modificarCantidad(item.id, item.cantidad + 1)}>
                  <Text style={styles.controlButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          style={{ width: '100%' }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

        {/* Footer con botones pequeños */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton} onPress={confirmarOrden}>
            <Text style={styles.footerButtonText}>Confirmar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={cancelarOrden}>
            <Text style={styles.footerButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.footerButton} onPress={verTicket}>
            <Text style={styles.footerButtonText}>Ver Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
    padding: 16,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#259588',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  tableName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  mesaInfoContainer: {
    width: '100%',
    backgroundColor: '#f0f0f0',
    padding: 5,
    marginBottom: 10,
    borderRadius: 4,
  },
  mesaInfoText: {
    fontSize: 12,
    color: '#666',
  },
  picker: {
    marginVertical: 10,
    width: '100%',
  },
  pickerItem: {
    fontWeight: 'bold',
    color: '#259588',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
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
  buttonAgregarTodos: {
    backgroundColor: '#FFA500',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 15,
    marginBottom: 10,
    width: '90%',
    alignItems: 'center',
  },
  buttonAgregarTodosText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notaContainer: {
    width: '100%',
    marginTop: 10,
    marginBottom: 15,
  },
  notaLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  notaInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#FFF',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  selectedTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    alignSelf: 'flex-start',
  },
  selectedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    width: '100%',
  },
  selectedItemText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
    width: '100%',
  },
  footerButton: {
    backgroundColor: '#259588',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
  },
  footerButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MenuBebidas;