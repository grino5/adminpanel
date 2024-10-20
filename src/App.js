import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Chats from './components/Chats'; // Componente de chats

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Estado de autenticación

  return (
    <Router>
      <Routes>
        {/* Ruta para el login */}
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />

        {/* Ruta privada para el chat, solo accesible si el usuario está autenticado */}
        <Route
          path="/chats"
          element={isAuthenticated ? <Chats /> : <Navigate to="/login" />}
        />

        {/* Redirigir a /login si no coincide con ninguna ruta */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;