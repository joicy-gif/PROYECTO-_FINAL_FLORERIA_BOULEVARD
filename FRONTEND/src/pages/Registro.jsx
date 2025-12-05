import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import fondoLogin from '../assets/fondo-login.jpg'; // Usamos la misma imagen

function Registro() {
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  // Estado para la barra de fortaleza
  const [fortaleza, setFortaleza] = useState({ color: 'bg-gray-200', texto: '', valor: 0 });

  // Función para evaluar la contraseña
  const evaluarPassword = (pass) => {
    let fuerza = 0;
    if (pass.length > 5) fuerza++; 
    if (pass.length > 8) fuerza++; 
    if (/[A-Z]/.test(pass)) fuerza++; 
    if (/[0-9]/.test(pass)) fuerza++; 
    
    if (pass.length === 0) {
        setFortaleza({ color: 'bg-gray-200', texto: '', valor: 0 });
    } else if (fuerza < 2) {
        setFortaleza({ color: 'bg-red-500', texto: 'Débil', valor: 33 });
    } else if (fuerza < 4) {
        setFortaleza({ color: 'bg-yellow-500', texto: 'Intermedia', valor: 66 });
    } else {
        setFortaleza({ color: 'bg-green-500', texto: 'Fuerte', valor: 100 });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUsuario({ ...usuario, [name]: value });

    if (name === 'password') {
        evaluarPassword(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        const response = await axios.post('http://localhost:3001/registro', usuario);
        
        if (response.data.success) {
            Swal.fire({
                title: "¡Cuenta Creada!",
                text: "Tu registro fue exitoso. Ahora puedes iniciar sesión.",
                icon: "success",
                confirmButtonColor: "#52796f",
                confirmButtonText: "Ir al Login"
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/'); 
                }
            });
        }
    } catch (error) {
        Swal.fire({
            title: "Hubo un problema",
            text: error.response?.data?.message || "Error al registrar",
            icon: "warning",
            confirmButtonColor: "#d67d60"
        });
    }
  };

  return (
    // 1. CONTENEDOR CON FONDO DE IMAGEN
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* 2. IMAGEN DE FONDO + CAPA OSCURA */}
      <div 
        className="absolute inset-0 z-0"
        style={{
            backgroundImage: `url(${fondoLogin})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>
      </div>

      {/* 3. TARJETA DE REGISTRO (Estilo idéntico al Login) */}
      <div className="relative z-10 bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 mx-4 backdrop-blur-sm bg-opacity-95">
        
        <h2 className="text-3xl font-bold text-center text-flora-green mb-2">Crear Cuenta</h2>
        <p className="text-center text-gray-500 mb-6 text-sm">Únete al equipo de Florería Boulevard</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Input Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input 
              type="text" 
              name="nombre"
              value={usuario.nombre}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-flora-green focus:ring-1 focus:ring-flora-green transition bg-gray-50"
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          {/* Input Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              name="email"
              value={usuario.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-flora-green focus:ring-1 focus:ring-flora-green transition bg-gray-50"
              placeholder="juan@boulevard.com"
              required
            />
          </div>

          {/* Input Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              name="password"
              value={usuario.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-flora-green focus:ring-1 focus:ring-flora-green transition bg-gray-50"
              placeholder="••••••••"
              required
            />
            
            {/* BARRA DE FORTALEZA */}
            <div className="mt-2 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 ${fortaleza.color}`} style={{ width: `${fortaleza.valor}%` }}></div>
            </div>
            <p className="text-xs text-right mt-1 text-gray-500">{fortaleza.texto}</p>
          </div>

          <button 
            type="submit"
            className="w-full bg-flora-green hover:bg-[#3a5a50] text-white font-bold py-3 rounded-lg shadow-md transition duration-300 transform hover:scale-[1.02] mt-6"
          >
            Registrarme
          </button>

          <div className="flex justify-center mt-6">
            <span className="text-sm text-gray-500">¿Ya tienes cuenta? </span>
            <Link to="/" className="text-sm text-flora-accent hover:text-[#b5634a] font-bold ml-1 hover:underline">
              Inicia Sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registro;