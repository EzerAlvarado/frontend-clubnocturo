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
import MenuBebidas from './screens/MenuBebidas';
import AgendaEventos from './screens/AgendaEventos';
import AgregarEvento from './screens/AgregarEvento';
import EditarEvento from './screens/EditarEvento';


const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Componente personalizado para el contenido del Drawer
function CustomDrawerContent(props) {
    return (
        <View style={styles.drawerContainer}>
            {/* Contenido Scrollable del Drawer */}
            <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
                <View style={styles.header}>
                    <Text style={styles.headerText}>Menú</Text>
                </View>
                <DrawerItemList {...props} />
            </DrawerContentScrollView>

            {/* Footer con opción de cerrar sesión */}
            <View style={styles.footer}>
                <DrawerItem
                    label="Cerrar sesión"
                    labelStyle={styles.logoutText}
                    onPress={() => console.log('Cerrar sesión')}
                />
            </View>
        </View>
    );
}

// Drawer Navigator
function DrawerNavigator() {
    return (
        <Drawer.Navigator
            drawerContent={(props) => <CustomDrawerContent {...props} />}
            screenOptions={{
                drawerStyle: {
                    backgroundColor: '#18243a', // Fondo del Drawer
                    width: 240,
                },
                drawerLabelStyle: {
                    color: 'white', // Texto de los elementos del Drawer
                },
                headerStyle: {
                    backgroundColor: '#18243a',
                },
                headerTintColor: 'white',
            }}
        >
            <Drawer.Screen name="Login" component={Login} />
            <Drawer.Screen name="Home" component={Home} />
            <Drawer.Screen name="Barman" component={BarModule} />
            <Drawer.Screen name="Bloques" component={Bloques} />
            <Drawer.Screen name="Agenda Eventos" component={AgendaEventos} />
        </Drawer.Navigator>
    );
}

// Configuración principal con Stack Navigator
export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {/* Anidar el Drawer Navigator */}
                <Stack.Screen name="Drawer" component={DrawerNavigator} />

                {/* Agregar pantallas que no están en el Drawer */}
                <Stack.Screen name="Ticket" component={TicketScreen} />
                <Stack.Screen name="Menu" component={MenuBebidas} />
                <Stack.Screen name="Bloque" component={Bloques} />
                <Stack.Screen name="Editar" component={EditarEvento} />
                <Stack.Screen name="Agregar" component={AgregarEvento} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
        backgroundColor: '#0A173B', // Fondo general del Drawer
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