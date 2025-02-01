import { createContext, useState, useEffect } from 'react';
import { login, logout, signup } from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('token');
        if (storedUser) setUser(storedUser);
    }, []);

    const handleSignup = async (userData) => {
        await signup(userData);
    };

    const handleLogin = async (userData) => {
        const response = await login(userData);
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, handleSignup, handleLogin, handleLogout }}>
            {children}
        </AuthContext.Provider>
    );
};
