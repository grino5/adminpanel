import React, { useState } from 'react';
import { collection, getDocs } from "firebase/firestore";
import { db } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom'; 
import userIcon from '../assets/usuario.png'; 
import lockIcon from '../assets/candado.png'; 

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); 

  const handleLogin = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Por favor ingresa un correo electrónico válido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const querySnapshot = await getDocs(collection(db, "admin_login"));
      let loginSuccess = false;

      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.email === email && userData.password === password) {
          loginSuccess = true;
          // Establecemos el adminID en sessionStorage
          sessionStorage.setItem('adminID', userData.Administradora);
        }
      });

      if (loginSuccess) {
        setIsAuthenticated(true); 
        navigate('/chats'); 
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Iniciar sesión</h2>
      <form onSubmit={handleLogin} style={styles.form}>
        <div style={styles.inputContainer}>
          <img src={userIcon} alt="User Icon" style={styles.icon} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Ingrese su email"
            style={styles.input}
          />
        </div>
        <div style={styles.inputContainer}>
          <img src={lockIcon} alt="Lock Icon" style={styles.icon} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Ingrese su contraseña"
            style={styles.input}
          />
        </div>
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" style={styles.button}>Iniciar sesión</button>
      </form>
    </div>
  );
};

// Estilos para centrar el formulario
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f4',
  },
  title: {
    marginBottom: '20px',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    marginBottom: '15px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    marginRight: '10px',
    width: '20px',
    height: '20px',
  },
  input: {
    padding: '10px',
    width: '300px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px',
  },
  error: {
    color: 'red',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#5A67D8',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
};

export default Login;
