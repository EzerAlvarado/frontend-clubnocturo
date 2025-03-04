import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../AuthContext';
import API_URL from '../url';


const MenuBebidas = ({ navigation, route }) => {
  const { mesa } = route.params;
  const { user } = useContext(AuthContext);

  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Variable de IP 
  const IP = API_URL;

  const mesaId = mesa.id;
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

  const agregarProducto = (producto) => {
    if (quantities[producto.id] > 0) {
      setProductosSeleccionados(prev => {
        const index = prev.findIndex(p => p.id === producto.id);
        if (index !== -1) {
          const nuevosProductos = [...prev];
          nuevosProductos[index].cantidad += quantities[producto.id];
          return nuevosProductos;
        }
        return [...prev, { ...producto, cantidad: quantities[producto.id] }];
      });
      setQuantities(prev => ({
        ...prev,
        [producto.id]: 0,
      }));
    }
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
      const fechaDeOrden = new Date().toISOString().split('T')[0];
      for (const producto of productosSeleccionados) {
        const response = await fetch(`http://${IP}:8000/club/ordenes-de-compra/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cantidad: producto.cantidad,
            fecha_de_orden: fechaDeOrden,
            mesas: mesaId,
            producto: producto.id,
            usuario_responsable: usuarioResponsableId,
            precio_orden: producto.cantidad * producto.precio,
          }),
        });
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error al confirmar la orden para el producto ${producto.id}: ${errorText}`);
        }
      }

      const totalOrdenActual = productosSeleccionados.reduce(
        (total, producto) => total + producto.cantidad * producto.precio,
        0
      );
      const totalCobro = parseFloat(totalOrdenActual.toFixed(2));

      const getCargoResponse = await fetch(`http://${IP}:8000/club/cargos/?mesa=${mesaId}`);
      const cargosData = await getCargoResponse.json();

      if (cargosData.length === 0) {
        const postCargoResponse = await fetch(`http://${IP}:8000/club/cargos/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesa: mesaId,
            total_cobro: totalCobro,
            estado: 'pendiente',
            usuario_responsable: usuarioResponsableId,
          }),
        });
        if (!postCargoResponse.ok) {
          const errorText = await postCargoResponse.text();
          throw new Error(`Error al crear el registro de Cargo: ${errorText}`);
        }
      } else {
        const cargoExistente = cargosData[0];
        const totalCobroExistente = parseFloat(cargoExistente.total_cobro);
        const nuevoTotalCobro = parseFloat((totalCobroExistente + totalCobro).toFixed(2));
        const putResponse = await fetch(`http://${IP}:8000/club/cargos/${cargoExistente.id}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mesa: mesaId,
            total_cobro: nuevoTotalCobro,
            estado: 'pendiente',
            usuario_responsable: usuarioResponsableId,
          }),
        });
        if (!putResponse.ok) {
          const errorText = await putResponse.text();
          throw new Error(`Error al actualizar el ticket: ${errorText}`);
        }
      }

      setProductosSeleccionados([]);
      setQuantities({});
      Alert.alert("Éxito", "Orden confirmada con éxito");
    } catch (error) {
      console.error("Error al confirmar la orden:", error);
      Alert.alert("Error", error.message);
    }
  };

  const cancelarOrden = () => {
    setProductosSeleccionados([]);
    setQuantities({});
    Alert.alert("Orden cancelada");
  };

  const verTicket = () => {
    navigation.navigate('Ticket', { mesaId: mesaId });
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
                <TouchableOpacity style={styles.addButton} onPress={() => agregarProducto(item)}>
                  <Text style={styles.addButtonText}>Añadir</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 5 }}
          style={{ maxHeight: 300, width: '100%' }}
          scrollEnabled={true}
          nestedScrollEnabled={true}
        />

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
  addButton: {
    backgroundColor: '#FFA500',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
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
