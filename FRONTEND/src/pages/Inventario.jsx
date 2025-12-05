import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

function Inventario() {
  const [productos, setProductos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const [filtroBajoStock, setFiltroBajoStock] = useState(false);

  // PAGINACIÓN
  const [paginaActual, setPaginaActual] = useState(1);
  const itemsPorPagina = 20; 

  const CATEGORIAS = [
    "Rosas", "Tulipanes", "Orquídeas", "Lirios", "Girasoles", 
    "Arreglos", "Cajas", "Regalos", "Nacionales", "Otros"
  ];

  const [formulario, setFormulario] = useState({
    nombre: '',
    categoria: '',
    precio: '',
    stock: '',
    imagen_url: ''
  });

  // Contador de alertas
  const productosBajosStock = productos.filter(p => p.stock < 5 && p.estado === 1).length;

  useEffect(() => {
    cargarProductos();
    const user = JSON.parse(localStorage.getItem('usuario_activo'));
    if (user) setUsuario(user);
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/productos');
      // Ordenamos por ID descendente para que los productos NO se muevan al cambiar de estado
      const ordenados = response.data.sort((a, b) => b.id - a.id);
      setProductos(ordenados);
    } catch (error) {
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormulario({
        ...formulario,
        [e.target.name]: e.target.value
    });
  };

  const productosFiltrados = productos.filter(prod => {
    const coincideBusqueda = prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                             prod.categoria.toLowerCase().includes(busqueda.toLowerCase());
    const coincideStock = filtroBajoStock ? prod.stock < 5 : true;
    return coincideBusqueda && coincideStock;
  });

  const indiceUltimo = paginaActual * itemsPorPagina;
  const indicePrimero = indiceUltimo - itemsPorPagina;
  const productosPaginados = productosFiltrados.slice(indicePrimero, indiceUltimo);
  const totalPaginas = Math.ceil(productosFiltrados.length / itemsPorPagina);

  const cambiarPagina = (numero) => setPaginaActual(numero);

  // --- REPORTE PDF ---
  const exportarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Reporte de Inventario - Floreria Boulevard", 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 28);
    
    const columnas = ["ID", "Nombre", "Categoria", "Estado", "Stock", "P. Unitario"];
    const filas = productosFiltrados.map(prod => [
        prod.id, 
        prod.nombre, 
        prod.categoria, 
        prod.estado === 1 ? 'ACTIVO' : 'INACTIVO',
        prod.stock,
        `Bs ${prod.precio}`
    ]);
    autoTable(doc, { startY: 35, head: [columnas], body: filas });
    doc.save("inventario_completo.pdf");
  };

  const abrirModalCrear = () => {
    setEditandoId(null);
    setFormulario({ nombre: '', categoria: '', precio: '', stock: '', imagen_url: '' });
    setMostrarModal(true);
  };

  const abrirModalEditar = (producto) => {
    setEditandoId(producto.id);
    setFormulario({ 
        nombre: producto.nombre, 
        categoria: producto.categoria, 
        precio: producto.precio, 
        stock: producto.stock,
        imagen_url: producto.imagen_url || ''
    });
    setMostrarModal(true);
  };

  const guardarProducto = async (e) => {
    e.preventDefault();
    try {
        if (editandoId) {
            await axios.put(`http://localhost:3001/productos/${editandoId}`, formulario);
            Swal.fire({ title: "¡Actualizado!", icon: "success", timer: 1500, showConfirmButton: false });
        } else {
            await axios.post('http://localhost:3001/productos', formulario);
            Swal.fire({ title: "¡Registrado!", icon: "success", timer: 1500, showConfirmButton: false });
        }
        setMostrarModal(false);
        cargarProductos();
    } catch (error) {
        Swal.fire("Error", "No se pudo guardar", "error");
    }
  };

  // --- BOTÓN 2: ELIMINAR (Lógica de "Papelera") ---
  const confirmarEliminacion = async (id) => {
    const result = await Swal.fire({
      title: '¿Dar de baja?',
      text: "El producto pasará a estado Inactivo.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar'
    });

    if (result.isConfirmed) {
      try {
        await axios.put(`http://localhost:3001/productos/eliminar/${id}`);
        Swal.fire('¡Eliminado!', 'El producto ha sido dado de baja.', 'success');
        cargarProductos();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar', 'error');
      }
    }
  };

  // --- BOTÓN 3: ALTERNAR ESTADO (Switch Rápido) ---
  const alternarEstado = async (producto) => {
    const nuevoEstado = producto.estado === 1 ? 0 : 1;
    
    // Feedback visual rápido (Toast)
    const Toast = Swal.mixin({
      toast: true, position: 'top-end', showConfirmButton: false, timer: 3000, timerProgressBar: true
    });

    try {
        const ruta = nuevoEstado === 0 
            ? `http://localhost:3001/productos/eliminar/${producto.id}`
            : `http://localhost:3001/productos/activar/${producto.id}`;
        
        await axios.put(ruta);
        
        Toast.fire({
          icon: nuevoEstado === 1 ? 'success' : 'info',
          title: nuevoEstado === 1 ? 'Producto Activado ✅' : 'Producto Desactivado ⛔'
        });
        
        cargarProductos(); // Recarga sin mover el producto de lugar
    } catch (error) {
        console.error(error);
    }
  };

  return (
    <div className="flex h-screen bg-flora-bg relative">
      <aside className="w-64 bg-flora-green text-white flex flex-col shadow-2xl hidden md:flex">
        <div className="p-6 text-center border-b border-flora-light/30">
            <h2 className="text-2xl font-bold tracking-wider">FLORERÍA</h2>
            <h3 className="text-sm font-light uppercase tracking-[0.3em]">Boulevard</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📊 Dashboard</Link>
            <div className="flex items-center px-4 py-3 bg-flora-light/20 text-white rounded-lg shadow-sm font-bold">📦 Inventario</div>
            <Link to="/ventas" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">🛒 Nueva Venta</Link>
            <Link to="/historial" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📜 Historial</Link>

            <Link to="/reportes" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📄 Reportes</Link>
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24">
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-bold text-flora-text">Inventario</h1>
            <div className="flex-1 w-full md:max-w-md relative">
                <input 
                    type="text" 
                    placeholder="🔍 Buscar flor o categoría..." 
                    className="w-full pl-4 pr-4 py-2 rounded-full border border-gray-300 focus:border-flora-green focus:ring-2 focus:ring-flora-green/50 outline-none shadow-sm"
                    value={busqueda}
                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} 
                />
            </div>
            <div className="flex gap-3 w-full md:w-auto">
                <button onClick={exportarPDF} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 font-bold flex-1 md:flex-none justify-center">📄 PDF</button>
                <button onClick={abrirModalCrear} className="bg-flora-accent hover:bg-[#b5634a] text-white px-4 py-2 rounded-lg shadow-md transition flex items-center gap-2 flex-1 md:flex-none justify-center">+ Nuevo</button>
            </div>
        </header>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 flex flex-col overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 uppercase text-sm leading-normal">
                        <th className="py-3 px-6">Producto</th>
                        <th className="py-3 px-6">Categoría</th>
                        <th className="py-3 px-6 text-center">Estado</th>
                        <th className="py-3 px-6 text-center">Stock</th>
                        <th className="py-3 px-6 text-right">Precio</th>
                        <th className="py-3 px-6 text-center">Acciones</th>
                    </tr>
                </thead>
                <tbody className="text-gray-600 text-sm font-light">
                    {productosPaginados.map((producto) => (
                        <tr key={producto.id} className={`border-b border-gray-200 transition hover:bg-gray-100 ${producto.estado === 0 ? 'bg-gray-100 opacity-60' : ''}`}>
                            <td className="py-3 px-6 text-left flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 bg-gray-100 shadow-sm flex-shrink-0">
                                    <img src={producto.imagen_url || "https://cdn-icons-png.flaticon.com/512/628/628283.png"} alt={producto.nombre} className="w-full h-full object-cover" onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/628/628283.png"; }} />
                                </div>
                                <span className="font-medium text-flora-text">{producto.nombre}</span>
                            </td>
                            <td className="py-3 px-6 text-left">
                                <span className="bg-flora-light/20 text-flora-green py-1 px-3 rounded-full text-xs font-bold">{producto.categoria}</span>
                            </td>
                            {/* CELDA DE ESTADO VISUAL */}
                            <td className="py-3 px-6 text-center">
                                {producto.estado === 1 ? (
                                    <span className="bg-green-100 text-green-700 py-1 px-3 rounded-full text-xs font-bold border border-green-200">ACTIVO</span>
                                ) : (
                                    <span className="bg-red-100 text-red-700 py-1 px-3 rounded-full text-xs font-bold border border-red-200">INACTIVO</span>
                                )}
                            </td>
                            <td className="py-3 px-6 text-center">
                                <span className={`font-bold ${producto.stock < 5 && producto.estado === 1 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>{producto.stock}</span>
                            </td>
                            <td className="py-3 px-6 text-right font-medium">Bs {producto.precio}</td>
                            
                            {/* --- 3 BOTONES DE ACCIÓN (ORDENADOS) --- */}
                            <td className="py-3 px-6 text-center">
                                <div className="flex item-center justify-center gap-2">
                                    {/* 1. EDITAR (Izquierda) */}
                                    <button onClick={() => abrirModalEditar(producto)} className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition shadow-sm" title="Editar">
                                        ✏️
                                    </button>
                                    
                                    {/* 2. ELIMINAR (Botón del Medio - Clásico) */}
                                    {/* Solo visible si está activo, para no eliminar lo eliminado */}
                                    {usuario?.rol === 'admin' && (
                                        <button 
                                            onClick={() => confirmarEliminacion(producto.id)} 
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${producto.estado === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                                            title="Eliminar"
                                            disabled={producto.estado === 0}
                                        >
                                            🗑️
                                        </button>
                                    )}

                                    {/* 3. ALTERNAR ESTADO (Tercer Botón - Derecha) */}
                                    <button 
                                        onClick={() => alternarEstado(producto)} 
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm font-bold text-lg
                                            ${producto.estado === 1 
                                                ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' 
                                                : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        title={producto.estado === 1 ? "Desactivar" : "Reactivar"}
                                    >
                                        🔄
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {/* Paginación */}
            {productosFiltrados.length > 0 && (
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <span className="text-sm text-gray-500">Mostrando {indicePrimero + 1} - {Math.min(indiceUltimo, productosFiltrados.length)} de {productosFiltrados.length}</span>
                    <div className="flex gap-2">
                        <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Anterior</button>
                        <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas} className="px-3 py-1 rounded border bg-white disabled:opacity-50">Siguiente</button>
                    </div>
                </div>
            )}
        </div>
      </main>

      {/* MODAL */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-up">
                <h2 className="text-2xl font-bold text-flora-green mb-4">{editandoId ? 'Editar Flor ✏️' : 'Nueva Flor 🌷'}</h2>
                <form onSubmit={guardarProducto} className="space-y-4">
                    <div><label className="block text-sm text-gray-600">Nombre</label><input type="text" name="nombre" value={formulario.nombre} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded focus:border-flora-green outline-none" required /></div>
                    <div><label className="block text-sm text-gray-600">Categoría</label>
                        <select name="categoria" value={formulario.categoria} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded focus:border-flora-green outline-none bg-white" required>
                            <option value="">Seleccione...</option>{CATEGORIAS.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1"><label className="block text-sm text-gray-600">Precio (Bs)</label><input type="number" name="precio" value={formulario.precio} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded focus:border-flora-green outline-none" required /></div>
                        <div className="flex-1"><label className="block text-sm text-gray-600">Stock</label><input type="number" name="stock" value={formulario.stock} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded focus:border-flora-green outline-none" required /></div>
                    </div>
                    <div><label className="block text-sm text-gray-600">Link Imagen</label><input type="text" name="imagen_url" value={formulario.imagen_url} onChange={handleInputChange} className="w-full border border-gray-300 p-2 rounded focus:border-flora-green outline-none" placeholder="https://..." /></div>
                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={() => setMostrarModal(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-flora-green text-white rounded hover:bg-flora-text transition">{editandoId ? 'Actualizar' : 'Guardar'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* MENÚ MÓVIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50 shadow-inner">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📊</span>Dash</Link>
        <Link to="/ventas" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">🛒</span>Venta</Link>
        <div className="relative -top-5 bg-flora-green rounded-full p-3 border-4 border-flora-bg shadow-lg"><span className="text-white text-xl">📦</span></div>
        <Link to="/reportes" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📄</span>Rep</Link>
        <Link to="/historial" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📜</span>Hist</Link>
      </div>
    </div>
  );
}

export default Inventario;