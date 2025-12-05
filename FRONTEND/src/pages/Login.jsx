import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import fondoLogin from '../assets/fondo-login.jpg'; // Asegúrate de que la imagen esté ahí

function Login() {
  const navigate = useNavigate(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ESTADOS PARA EL CAPTCHA
  const [captcha, setCaptcha] = useState({ num1: 0, num2: 0, respuesta: '' });

  // Al cargar la página, generamos los números
  useEffect(() => {
    generarCaptcha();
  }, []);

  const generarCaptcha = () => {
    const n1 = Math.floor(Math.random() * 10);
    const n2 = Math.floor(Math.random() * 10);
    setCaptcha({ num1: n1, num2: n2, respuesta: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 

    // --- VALIDACIÓN DEL CAPTCHA ---
    const sumaCorrecta = captcha.num1 + captcha.num2;
    
    if (parseInt(captcha.respuesta) !== sumaCorrecta) {
        Swal.fire({
            title: "Captcha Incorrecto",
            text: `La suma de ${captcha.num1} + ${captcha.num2} no es ${captcha.respuesta}.`,
            icon: "error",
            confirmButtonColor: "#d67d60"
        });
        generarCaptcha();
        return;
    }

    try {
      const response = await axios.post('http://localhost:3001/login', {
        email: email,
        password: password
      });

      if (response.data.success) {
        localStorage.setItem('usuario_activo', JSON.stringify(response.data.user)); 

        Swal.fire({
          title: "¡Bienvenido!",
          text: `Hola de nuevo, ${response.data.user.nombre}`,
          icon: "success",
          timer: 2000,
          showConfirmButton: false
        });
        
        setTimeout(() => {
            navigate('/dashboard');
        }, 1500);
      }

    } catch (error) {
      Swal.fire({
        title: "Error de acceso",
        text: error.response?.data?.message || "No se pudo conectar al servidor",
        icon: "error",
        confirmButtonColor: "#d67d60"
      });
    }
  };

  return (
    // 1. CONTENEDOR PRINCIPAL CON IMAGEN DE FONDO
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* 2. CAPA DE IMAGEN + OSCURIDAD */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: `url(${fondoLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      >
        {/* Capa negra semitransparente (opacity-50) para que se lea el texto */}
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* 3. TARJETA DE LOGIN (z-10 para estar encima de la imagen) */}
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 mx-4 backdrop-blur-sm bg-opacity-95">
        
        <div className="bg-flora-green text-white py-4 px-6 rounded-lg text-center mb-8 shadow-md">
          <h2 className="text-xl font-semibold tracking-widest uppercase">
            🌸 Florería Boulevard
          </h2>
        </div>

        <h1 className="text-2xl font-bold text-center text-flora-text mb-2">Bienvenido</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Sistema de Gestión de Inventario</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              placeholder="admin@boulevard.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-flora-green focus:ring-1 focus:ring-flora-green transition bg-gray-50"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-flora-green focus:ring-1 focus:ring-flora-green transition bg-gray-50"
              required
            />
          </div>

          {/* CAPTCHA */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-sm font-bold text-gray-600 mb-2">Pregunta de seguridad:</label>
            <div className="flex items-center gap-3">
                <div className="bg-flora-green text-white px-4 py-2 rounded font-bold text-lg select-none">
                    {captcha.num1} + {captcha.num2} = ?
                </div>
                
                <input 
                    type="number" 
                    className="w-20 p-2 border border-gray-300 rounded text-center font-bold outline-none focus:border-flora-accent"
                    placeholder="#"
                    value={captcha.respuesta}
                    onChange={(e) => setCaptcha({...captcha, respuesta: e.target.value})}
                    required
                />
                
                <button 
                    type="button" 
                    onClick={generarCaptcha}
                    className="text-gray-400 hover:text-flora-green"
                    title="Cambiar números"
                >
                    🔄
                </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm mt-4">
            <a href="#" className="text-gray-500 hover:text-flora-green underline">
                Olvidé mi contraseña
            </a>
            <Link to="/registro" className="text-flora-accent hover:text-[#b5634a] font-bold underline">
                Crear cuenta
            </Link>
          </div>

          <button 
            type="submit"
            className="w-full bg-flora-accent hover:bg-[#b5634a] text-white font-bold py-3 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] mt-6"
          >
            Iniciar Sesión
          </button>

        </form>
      </div>
    </div>
  );
}

export default Login;