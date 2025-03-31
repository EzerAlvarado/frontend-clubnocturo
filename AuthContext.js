import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Para manejar el estado de carga

    // Cargar usuario al iniciar
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setIsLoading(false);
            }
        };
        
        loadUser();
    }, []);

    // Actualizar AsyncStorage cuando el usuario cambie
    useEffect(() => {
        const saveUser = async () => {
            try {
                if (user) {
                    await AsyncStorage.setItem("user", JSON.stringify(user));
                } else {
                    await AsyncStorage.removeItem("user");
                }
            } catch (error) {
                console.error("Error saving user:", error);
            }
        };
        
        if (!isLoading) { // Solo guardar después de la carga inicial
            saveUser();
        }
    }, [user, isLoading]);

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem("user");
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser,
            logout,
            isAuthenticated: !!user,
            isLoading // Puedes usar esto en tus componentes para saber cuándo termina la carga
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};