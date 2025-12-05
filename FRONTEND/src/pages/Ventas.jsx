import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Ventas() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  
  // ESTADO NUEVO: Lista de clientes
  const [clientes, setClientes] = useState([]);

  useEffect(() => {
    cargarProductos();
    cargarClientes(); // Cargamos clientes al iniciar
  }, []);

  const cargarProductos = async () => {
    try {
      const response = await axios.get('http://localhost:3001/productos');
      // Solo mostramos productos ACTIVOS (estado 1) y con stock > 0
      const disponibles = response.data.filter(p => p.estado === 1 && p.stock > 0);
      setProductos(disponibles);
    } catch (error) {
      console.error(error);
    }
  };

  const cargarClientes = async () => {
    try {
      const response = await axios.get('http://localhost:3001/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Error cargando clientes");
    }
  };

  // --- NUEVA LÓGICA: PREGUNTAR CANTIDAD ---
  const agregarAlCarrito = async (producto) => {
    // 1. Validación rápida de stock inicial
    if (producto.stock <= 0) {
        Swal.fire({
            title: "Sin Stock",
            text: "No quedan unidades disponibles",
            icon: "warning",
            timer: 1500,
            showConfirmButton: false
        });
        return;
    }

    // 2. Preguntar cantidad con un Pop-up
    const { value: cantidadInput } = await Swal.fire({
        title: `Agregar ${producto.nombre}`,
        text: `Stock disponible: ${producto.stock} unidades`,
        input: 'number',
        inputLabel: 'Cantidad a vender:',
        inputValue: 1, // Por defecto 1
        inputAttributes: {
            min: 1,
            max: producto.stock,
            step: 1
        },
        showCancelButton: true,
        confirmButtonColor: '#52796f',
        confirmButtonText: 'Agregar al Carrito 🛒',
        cancelButtonText: 'Cancelar'
    });

    // Si el usuario cancela o no pone nada, salimos
    if (!cantidadInput) return;

    const cantidad = parseInt(cantidadInput);

    // 3. Validar y Agregar al Carrito
    const existe = carrito.find(item => item.id === producto.id);
    
    if (existe) {
        // Si ya existe, verificamos que la suma no supere el stock
        if (existe.cantidad + cantidad > producto.stock) {
            Swal.fire({
                title: "Stock Insuficiente",
                text: `Ya tienes ${existe.cantidad} en el carrito. Solo puedes agregar ${producto.stock - existe.cantidad} más.`,
                icon: "warning",
                confirmButtonColor: '#52796f'
            });
            return;
        }
        const nuevoCarrito = carrito.map(item => 
            item.id === producto.id ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
        setCarrito(nuevoCarrito);
    } else {
        // Si es nuevo en el carrito
        setCarrito([...carrito, { ...producto, cantidad: cantidad }]);
    }

    // Feedback visual pequeño (Toast)
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
        iconColor: 'white',
        customClass: {
            popup: 'bg-flora-green text-white' // Estilo personalizado para que combine
        }
    });
    Toast.fire({
        icon: 'success',
        title: `${cantidad} x ${producto.nombre} agregados`
    });
  };

  const eliminarDelCarrito = (id) => {
    const nuevoCarrito = carrito.filter(item => item.id !== id);
    setCarrito(nuevoCarrito);
  };

  const totalVenta = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

  // --- FUNCIÓN PARA GENERAR TICKET PDF ---
  const generarTicketPDF = (datosVenta, clienteInfo) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [80, 200] // Formato tipo ticket de impresora térmica (80mm ancho)
    });

    // Encabezado
    doc.setFontSize(12);
    doc.text('FLORERÍA BOULEVARD', 40, 10, { align: 'center' });
    doc.setFontSize(8);
    doc.text('Av. Las Flores #123, La Paz', 40, 15, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 40, 20, { align: 'center' });
    
    doc.text('-------------------------------------------', 40, 25, { align: 'center' });
    
    // Datos Cliente
    doc.text(`Cliente: ${clienteInfo.nombre}`, 5, 30);
    doc.text(`NIT/CI: ${clienteInfo.nit}`, 5, 35);

    doc.text('-------------------------------------------', 40, 40, { align: 'center' });

    // Detalle de productos
    let y = 45;
    doc.setFontSize(9);
    
    datosVenta.forEach((item) => {
        // Nombre producto
        doc.text(`${item.nombre}`, 5, y);
        y += 4;
        // Cantidad x Precio = Subtotal
        doc.text(`${item.cantidad} x ${item.precio} = Bs ${(item.cantidad * item.precio).toFixed(2)}`, 75, y, { align: 'right' });
        y += 5;
    });

    doc.text('-------------------------------------------', 40, y, { align: 'center' });
    y += 5;

    // Total
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL: Bs ${totalVenta.toFixed(2)}`, 75, y, { align: 'right' });
    
    y += 10;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text('¡Gracias por su compra!', 40, y, { align: 'center' });

    // Descargar
    doc.save(`Ticket_Venta_${Date.now()}.pdf`);
  };

  // --- LÓGICA DE VENTA PROFESIONAL ---
  const confirmarVenta = async () => {
    if (carrito.length === 0) return;

    // Pop-up complejo con HTML para seleccionar cliente
    const { value: resultado } = await Swal.fire({
        title: 'Finalizar Venta',
        html: `
            <div class="text-left">
                <p class="mb-4 font-bold text-xl text-center text-flora-green">Total: Bs ${totalVenta.toFixed(2)}</p>
                
                <label class="block text-sm font-bold text-gray-700 mb-1">👤 Seleccionar Cliente:</label>
                <select id="swal-cliente" class="w-full border p-2 rounded mb-4 focus:ring-2 focus:ring-flora-green outline-none">
                    <option value="">-- Público General --</option>
                    ${clientes.map(c => `<option value="${c.id}">${c.nombre_completo} (NIT: ${c.ci_nit || 'S/N'})</option>`).join('')}
                </select>
                
                <div class="border-t pt-4 mt-2">
                    <p class="text-xs font-bold text-flora-text mb-2 uppercase text-center">- O registrar nuevo -</p>
                    <input id="swal-nuevo-nombre" class="w-full border p-2 rounded mb-2 text-sm" placeholder="Nombre Completo">
                    <input id="swal-nuevo-nit" class="w-full border p-2 rounded text-sm" placeholder="CI / NIT">
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonColor: '#52796f',
        cancelButtonColor: '#d33',
        confirmButtonText: '💰 Cobrar e Imprimir',
        cancelButtonText: 'Cancelar',
        preConfirm: async () => {
            const clienteId = document.getElementById('swal-cliente').value;
            const nuevoNombre = document.getElementById('swal-nuevo-nombre').value;
            const nuevoNit = document.getElementById('swal-nuevo-nit').value;

            // Si el usuario escribió un nombre nuevo, creamos el cliente primero
            if (nuevoNombre) {
                try {
                    const res = await axios.post('http://localhost:3001/clientes', {
                        nombre: nuevoNombre,
                        ci_nit: nuevoNit || '0',
                        telefono: ''
                    });
                    // Retornamos objeto con ID y datos para el ticket
                    return { id: res.data.id, nombre: nuevoNombre, nit: nuevoNit || '0' };
                } catch (e) {
                    Swal.showValidationMessage(`Error creando cliente: ${e}`);
                }
            }
            
            // Si seleccionó uno de la lista, buscamos sus datos para el ticket
            const clienteEncontrado = clientes.find(c => c.id == clienteId);
            return { 
                id: clienteId, 
                nombre: clienteEncontrado ? clienteEncontrado.nombre_completo : "Público General",
                nit: clienteEncontrado ? clienteEncontrado.ci_nit : "S/N"
            }; 
        }
    });

    // Si el usuario confirmó (resultado tiene un valor)
    if (resultado) {
        try {
            const datosVenta = carrito.map(item => ({ id: item.id, cantidad: item.cantidad }));
            
            const response = await axios.post('http://localhost:3001/vender', { 
                productos: datosVenta,
                cliente_id: resultado.id // Enviamos el ID del cliente al backend
            });
            
            if (response.data.success) {
                // 1. Generar PDF (Ticket)
                generarTicketPDF(carrito, resultado);

                // 2. Mostrar Mensaje
                Swal.fire({
                    title: '¡Venta Exitosa!',
                    text: 'El ticket se ha descargado.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false
                });
                
                // 3. Limpiar
                setCarrito([]);
                cargarProductos(); 
                cargarClientes();
            }
        } catch (error) {
            Swal.fire('Error', 'No se pudo procesar la venta', 'error');
        }
    }
  };

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <div className="flex h-screen bg-flora-bg relative">
      {/* SIDEBAR */}
      <aside className="w-64 bg-flora-green text-white flex flex-col shadow-2xl hidden md:flex">
        <div className="p-6 text-center border-b border-flora-light/30">
            <h2 className="text-2xl font-bold tracking-wider">FLORERÍA</h2>
            <h3 className="text-sm font-light uppercase tracking-[0.3em]">Boulevard</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📊 Dashboard</Link>
            <Link to="/inventario" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📦 Inventario</Link>
            <div className="flex items-center px-4 py-3 bg-flora-light/20 text-white rounded-lg cursor-pointer shadow-sm font-bold">🛒 Nueva Venta</div>
            <Link to="/historial" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📜 Historial</Link>

            <Link to="/reportes" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📄 Reportes</Link>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex overflow-hidden flex-col md:flex-row pb-20 md:pb-0">
        
        {/* IZQUIERDA: CATÁLOGO */}
        <div className="flex-1 p-6 overflow-y-auto">
            <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold text-flora-text">Punto de Venta</h1>
                <input 
                    type="text" 
                    placeholder="🔍 Buscar flor..." 
                    className="p-2 px-4 rounded-full border border-gray-300 focus:border-flora-green outline-none w-full sm:w-64 shadow-sm"
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                />
            </header>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {productosFiltrados.map(prod => (
                    <div 
                        key={prod.id} 
                        className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer border border-gray-100 group relative"
                        onClick={() => agregarAlCarrito(prod)}
                    >
                        <div className="h-32 bg-gray-100 relative">
                            <img 
                                src={prod.imagen_url || "https://cdn-icons-png.flaticon.com/512/628/628283.png"} 
                                alt={prod.nombre} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/628/628283.png"; }}
                            />
                            {prod.stock < 5 && (
                                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-sm">
                                    ¡Poco Stock!
                                </span>
                            )}
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-gray-700 truncate text-sm">{prod.nombre}</h3>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-flora-green font-bold">Bs {prod.precio}</span>
                                <span className="text-xs text-gray-400">Stock: {prod.stock}</span>
                            </div>
                        </div>
                        <div className="absolute inset-0 bg-flora-green bg-opacity-0 group-hover:bg-opacity-10 transition duration-300 pointer-events-none"></div>
                    </div>
                ))}
            </div>
        </div>

        {/* DERECHA: TICKET (Visible siempre en PC, abajo en móvil) */}
        <div className="w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-20 h-auto md:h-full">
            <div className="p-6 bg-flora-green text-white shadow-md">
                <h2 className="text-xl font-bold flex items-center gap-2">🛒 Ticket de Venta</h2>
                <p className="text-sm opacity-80 mt-1">{new Date().toLocaleDateString()}</p>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 min-h-[200px]">
                {carrito.length === 0 ? (
                    <div className="text-center text-gray-400 mt-10 flex flex-col items-center">
                        <span className="text-6xl mb-4 opacity-30">🛍️</span>
                        <p className="font-medium">Carrito vacío</p>
                    </div>
                ) : (
                    carrito.map(item => (
                        <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border border-gray-100 animate-fade-in-up">
                            <div>
                                <p className="font-bold text-gray-700 text-sm">{item.nombre}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    <span className="bg-flora-bg px-2 py-0.5 rounded text-flora-text font-semibold">{item.cantidad}</span> x Bs {item.precio}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-flora-green">Bs {(item.cantidad * item.precio).toFixed(2)}</span>
                                <button onClick={() => eliminarDelCarrito(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full p-1 transition">✕</button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] mb-16 md:mb-0">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-600 text-lg">Total a Pagar:</span>
                    <span className="text-3xl font-bold text-flora-text">Bs {totalVenta.toFixed(2)}</span>
                </div>
                <button 
                    onClick={confirmarVenta}
                    disabled={carrito.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-white transition transform active:scale-[0.98] shadow-lg text-lg tracking-wide
                        ${carrito.length === 0 ? 'bg-gray-300 cursor-not-allowed shadow-none' : 'bg-flora-accent hover:bg-[#b5634a] hover:shadow-xl'}`}
                >
                    CONFIRMAR VENTA
                </button>
            </div>
        </div>

      </main>

      {/* MENÚ MÓVIL */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50 shadow-inner">
        <Link to="/dashboard" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📊</span>Dash</Link>
        <Link to="/ventas" className="flex flex-col items-center text-flora-green text-xs font-bold"><span className="text-xl">🛒</span>Venta</Link>
        <div className="relative -top-5 bg-flora-green rounded-full p-3 border-4 border-flora-bg shadow-lg"><Link to="/inventario" className="text-white text-xl">📦</Link></div>
        <Link to="/reportes" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📄</span>Rep</Link>
        <Link to="/historial" className="flex flex-col items-center text-gray-500 text-xs font-bold"><span className="text-xl">📜</span>Hist</Link>
      </div>
    </div>
  );
}

export default Ventas;