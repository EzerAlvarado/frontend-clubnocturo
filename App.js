import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';

import Home from './screens/Home';
import Login from './screens/Login';
import BarModule from './screens/BarModule';
import TicketScreen from './screens/Ticket';
import Bloques from './screens/Bloques';
import AgendaEventos from './screens/AgendaEventos';
import AgregarEvento from './screens/AgregarEvento';
import EditarEvento from './screens/EditarEvento';
import MenuBebidas from './screens/MenuBebidas';

import { AuthProvider, useAuth } from './AuthContext';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
  const { logout } = useAuth(); // Cambiado a useAuth()

  return (
    <View style={styles.drawerContainer}>
      <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Menú</Text>
        </View>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View style={styles.footer}>
        <DrawerItem
          label="Cerrar sesión"
          labelStyle={styles.logoutText}
          onPress={logout} // Usamos la función logout del contexto
        />
      </View>
    </View>
  );
}

// Drawer Navigator que muestra las pantallas según el rol del usuario
function DrawerNavigator() {
  const { user } = useAuth(); // Cambiado a useAuth()

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerStyle: {
          backgroundColor: '#18243a',
          width: 240,
        },
        drawerLabelStyle: {
          color: 'white',
        },
        headerStyle: {
          backgroundColor: '#18243a',
        },
        headerTintColor: 'white',
      }}
    >
      <Drawer.Screen name="Home" component={Home} />

      {user?.estado_solicitud === "C" && (
        <Drawer.Screen name="Agenda Eventos" component={AgendaEventos} />
      )}
      {user?.estado_solicitud === "B" && (
        <Drawer.Screen name="Barman" component={BarModule} />
      )}
      {user?.estado_solicitud === "M" && (
        <Drawer.Screen name="Bloques" component={Bloques} />
      )}
    </Drawer.Navigator>
  );
}

// Stack Navigator principal
function RootNavigator() {
  const { user } = useAuth(); // Cambiado a useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Drawer" component={DrawerNavigator} />
          <Stack.Screen name="Ticket" component={TicketScreen} />
          <Stack.Screen name="Menu" component={MenuBebidas} />
          <Stack.Screen name="Bloque" component={Bloques} />
          <Stack.Screen name="Editar" component={EditarEvento} />
          <Stack.Screen name="Agregar" component={AgregarEvento} />
        </>
      ) : (
        <Stack.Screen name="Login" component={Login} />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#0A173B',
  },
  drawerScroll: {
    backgroundColor: '#0A173B',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C3E50',
  },
  headerText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#2C3E50',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});