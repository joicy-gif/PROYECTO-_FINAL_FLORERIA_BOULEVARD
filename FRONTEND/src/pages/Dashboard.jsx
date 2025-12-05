import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [totalProductos, setTotalProductos] = useState(0);
  const [logs, setLogs] = useState([]); 

  const COLORES = ['#52796f', '#d67d60', '#84a98c', '#f4a261', '#e76f51'];

  useEffect(() => {
    cargarEstadisticas();
    cargarLogs();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      const response = await axios.get('http://localhost:3001/estadisticas');
      setStats(response.data);
      const total = response.data.reduce((sum, item) => sum + item.value, 0);
      setTotalProductos(total);
    } catch (error) {
      console.error("Error stats");
    }
  };

  const cargarLogs = async () => {
      try {
          const response = await axios.get('http://localhost:3001/logs');
          setLogs(response.data);
      } catch (error) {
          console.error("Error logs");
      }
  };

  // --- FUNCIÓN DE CERRAR SESIÓN MEJORADA ---
  const cerrarSesion = async () => {
      // 1. Recuperamos quién está conectado
      const usuarioGuardado = localStorage.getItem('usuario_activo');
      
      if (usuarioGuardado) {
          const usuario = JSON.parse(usuarioGuardado);
          try {
              // 2. Avisamos al backend que se va (para guardar el log de SALIDA)
              await axios.post('http://localhost:3001/logout', { usuario_id: usuario.id });
          } catch (error) {
              console.error("No se pudo registrar la salida");
          }
          // 3. Limpiamos la memoria
          localStorage.removeItem('usuario_activo');
      }

      // 4. Nos vamos al login
      navigate('/');
  };

  return (
    <div className="flex h-screen bg-flora-bg">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-flora-green text-white flex flex-col shadow-2xl">
        <div className="p-6 text-center border-b border-flora-light/30">
            <h2 className="text-2xl font-bold tracking-wider">FLORERÍA</h2>
            <h3 className="text-sm font-light uppercase tracking-[0.3em]">Boulevard</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="flex items-center px-4 py-3 bg-flora-light/20 text-white rounded-lg cursor-pointer shadow-sm">
                <span className="font-medium">📊 Pagina Principal</span>
            </div>
            <Link to="/inventario" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">
                <span className="font-medium">📦 Inventario</span>
            </Link>
            <Link to="/ventas" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">
                <span className="font-medium">🛒 Nueva Venta</span>
            </Link>
            <Link to="/historial" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">
            📜 Historial
            </Link>
            <Link to="/reportes" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">
            📄 Reportes
            </Link>
        </nav>
        <div className="p-4 border-t border-flora-light/30">
            <button onClick={cerrarSesion} className="w-full flex items-center justify-center px-4 py-2 bg-red-500/20 text-red-100 hover:bg-red-500 hover:text-white rounded-lg transition text-sm font-semibold">
                Cerrar Sesión
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-flora-text">Bienvenido</h1>
                <p className="text-gray-500">Resumen de la actividad de hoy</p>
            </div>
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-200">
                <span className="w-10 h-10 bg-flora-accent rounded-full flex items-center justify-center text-white font-bold">B</span>
            </div>
        </header>

        {/* TARJETAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-flora-green">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Categorías</h3>
                <p className="text-3xl font-bold text-flora-text mt-2">{stats.length}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-flora-accent">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Total Productos</h3>
                <p className="text-3xl font-bold text-flora-text mt-2">{totalProductos}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-yellow-500">
                <h3 className="text-gray-500 text-sm font-medium uppercase">Sistema</h3>
                <p className="text-2xl font-bold text-flora-text mt-2">🟢 En Línea</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* GRÁFICO */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-flora-text mb-6">📊 Stock por Categoría</h2>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{fill: '#6b7280'}} />
                            <YAxis tick={{fill: '#6b7280'}} />
                            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}/>
                            <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                                {stats.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORES[index % COLORES.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* TABLA DE LOGS MEJORADA */}
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <h2 className="text-xl font-bold text-flora-text mb-6">🛡️ Registro de Accesos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="text-gray-400 border-b border-gray-100">
                                <th className="pb-3">Usuario</th>
                                <th className="pb-3">Evento</th>
                                <th className="pb-3">Fecha</th>
                                <th className="pb-3 text-right">IP</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-600">
                            {logs.map((log) => (
                                <tr key={log.id} className="border-b border-gray-50 hover:bg-gray-50 transition">
                                    <td className="py-3 font-medium text-flora-green">{log.nombre_completo}</td>
                                    <td className="py-3">
                                        {/* AQUÍ CAMBIAMOS EL COLOR SEGÚN EL EVENTO */}
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase 
                                            ${log.evento === 'ingreso' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                                            {log.evento}
                                        </span>
                                    </td>
                                    <td className="py-3">{new Date(log.fecha_hora).toLocaleTimeString()}</td>
                                    <td className="py-3 text-right text-xs text-gray-400 font-mono">{log.ip_usuario}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {logs.length === 0 && <p className="text-gray-400 mt-4 text-center">Sin actividad reciente.</p>}
                </div>
            </div>

        </div>

      </main>
    </div>
  );
}

export default Dashboard;