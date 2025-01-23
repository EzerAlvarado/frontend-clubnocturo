import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
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
                    label="cerrar sesión"
                    labelStyle={styles.logoutText}
                    onPress={() => console.log('Cerrar sesión')}
                />
            </View>
        </View>
    );
}

export default function App() {
    return (
        <NavigationContainer>
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
                    headerShown: true, // Mostrar el header para debug
                    headerStyle: {
                        backgroundColor: '#18243a',
                    },
                    headerTintColor: 'white',
                }}
            >
                <Drawer.Screen name="Home" component={Home} />
                <Drawer.Screen name="Login" component={Login} />
                <Drawer.Screen name="Barman" component={BarModule} />
                <Drawer.Screen name="Ticket" component={TicketScreen} />
                <Drawer.Screen name='Bloques' component={Bloques}/>
                <Drawer.Screen name='Menu' component={MenuBebidas}/>
                <Drawer.Screen name='Agenda Eventos' component={AgendaEventos}/>
                <Drawer.Screen name='Agregar Eventos' component={AgregarEvento}/>
                <Drawer.Screen name='Editar Eventos' component={EditarEvento}/>
            </Drawer.Navigator>
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
