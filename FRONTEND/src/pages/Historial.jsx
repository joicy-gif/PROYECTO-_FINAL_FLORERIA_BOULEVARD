import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // <-- CORRECCIÓN IMPORTANTE

function Historial() {
  const [seccionActiva, setSeccionActiva] = useState('ventas'); // 'ventas' o 'ingresos'
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]); // Para los ingresos
  const [detalleVenta, setDetalleVenta] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarDatos();
  }, [seccionActiva]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (seccionActiva === 'ventas') {
        const response = await axios.get('http://localhost:3001/ventas');
        setVentas(response.data);
      } else {
        // Cargamos productos y los ordenamos por ID descendente (los últimos creados primero)
        const response = await axios.get('http://localhost:3001/productos');
        const productosOrdenados = response.data.sort((a, b) => b.id - a.id);
        setProductos(productosOrdenados);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCargando(false);
    }
  };

  const verDetalles = async (idVenta) => {
    try {
      const response = await axios.get(`http://localhost:3001/ventas/${idVenta}`);
      setDetalleVenta({ id: idVenta, items: response.data });
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los detalles', 'error');
    }
  };

  // --- GENERADOR DE PDF INTELIGENTE ---
  const generarPDF = () => {
    const doc = new jsPDF();
    const fechaHoy = new Date().toLocaleDateString();

    // Encabezado General
    doc.setFontSize(18);
    doc.text('Florería Boulevard - Reporte Oficial', 14, 22);
    doc.setFontSize(11);
    doc.text(`Fecha de emisión: ${fechaHoy}`, 14, 30);
    
    if (seccionActiva === 'ventas') {
      // REPORTE DE VENTAS
      doc.setFontSize(14);
      doc.setTextColor(82, 121, 111); // Verde Flora
      doc.text('Historial de Ventas (Salidas)', 14, 40);
      
      const columnas = ["# Ticket", "Fecha", "Monto Total"];
      const filas = ventas.map(v => [
        `#${v.id}`,
        new Date(v.fecha).toLocaleString(),
        `Bs ${Number(v.total).toFixed(2)}`
      ]);

      // CORRECCIÓN: Usamos autoTable(doc, ...) en lugar de doc.autoTable
      autoTable(doc, {
        startY: 45,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [82, 121, 111] }
      });
      doc.save(`reporte_ventas_${fechaHoy.replace(/\//g, '-')}.pdf`);

    } else {
      // REPORTE DE INGRESOS (PRODUCTOS) CON COSTOS
      doc.setFontSize(14);
      doc.setTextColor(214, 125, 96); // Naranja Flora
      doc.text('Registro de Ingresos y Valorización', 14, 40);

      const columnas = ["ID", "Producto", "Categoría", "Stock", "P. Unitario", "Valor Total"];
      const filas = productos.map(p => [
        p.id,
        p.nombre,
        p.categoria,
        p.stock,
        `Bs ${Number(p.precio).toFixed(2)}`,
        `Bs ${(Number(p.precio) * p.stock).toFixed(2)}` // Cálculo del total
      ]);

      autoTable(doc, {
        startY: 45,
        head: [columnas],
        body: filas,
        theme: 'grid',
        headStyles: { fillColor: [214, 125, 96] }
      });
      doc.save(`reporte_ingresos_productos_${fechaHoy.replace(/\//g, '-')}.pdf`);
    }

    const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer: 3000 });
    Toast.fire({ icon: "success", title: "PDF Generado con éxito" });
  };

  const cerrarModal = () => setDetalleVenta(null);

  return (
    <div className="flex h-screen bg-flora-bg">
      {/* SIDEBAR */}
      <aside className="w-64 bg-flora-green text-white flex flex-col shadow-2xl hidden md:flex">
        <div className="p-6 text-center border-b border-flora-light/30">
            <h2 className="text-2xl font-bold tracking-wider">FLORERÍA</h2>
            <h3 className="text-sm font-light uppercase tracking-[0.3em]">Boulevard</h3>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
            <Link to="/dashboard" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📊 Dashboard</Link>
            <Link to="/inventario" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📦 Inventario</Link>

            <Link to="/ventas" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">🛒 Nueva Venta</Link>
            <div className="flex items-center px-4 py-3 bg-flora-light/20 text-white rounded-lg shadow-sm font-bold cursor-default">📜 Historial</div>
            <Link to="/reportes" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📄 Reportes</Link>       
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-flora-text">Historial</h1>
            <button 
                onClick={generarPDF}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg shadow-md flex items-center gap-2 transition font-bold animate-pulse"
            >
                📄 Descargar PDF ({seccionActiva === 'ventas' ? 'Ventas' : 'Ingresos'})
            </button>
        </div>

        {/* PESTAÑAS DE NAVEGACIÓN */}
        <div className="flex gap-4 mb-6 border-b border-gray-200 pb-1">
            <button 
                onClick={() => setSeccionActiva('ventas')}
                className={`pb-2 px-4 font-bold transition text-lg ${seccionActiva === 'ventas' ? 'text-flora-green border-b-4 border-flora-green' : 'text-gray-400 hover:text-gray-600'}`}
            >
                💰 Ventas Realizadas
            </button>
            <button 
                onClick={() => setSeccionActiva('ingresos')}
                className={`pb-2 px-4 font-bold transition text-lg ${seccionActiva === 'ingresos' ? 'text-flora-accent border-b-4 border-flora-accent' : 'text-gray-400 hover:text-gray-600'}`}
            >
                📥 Productos Ingresados
            </button>
        </div>

        {/* TABLA DINÁMICA */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 min-h-[400px]">
          <table className="w-full text-left">
            <thead className={seccionActiva === 'ventas' ? 'bg-flora-green text-white' : 'bg-flora-accent text-white'}>
              <tr>
                {seccionActiva === 'ventas' ? (
                    <>
                        <th className="p-4"># Ticket</th>
                        <th className="p-4">Fecha y Hora</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4 text-center">Acciones</th>
                    </>
                ) : (
                    <>
                        <th className="p-4">ID</th>
                        <th className="p-4">Imagen</th>
                        <th className="p-4">Producto Ingresado</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4 text-center">Stock Actual</th>
                        <th className="p-4 text-right">P. Unitario</th>
                        <th className="p-4 text-right">Valor Total</th>
                    </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {cargando ? (
                <tr><td colSpan="7" className="p-8 text-center text-gray-500">Cargando datos...</td></tr>
              ) : (
                seccionActiva === 'ventas' ? (
                    // RENDERIZADO DE VENTAS
                    ventas.length === 0 ? (
                        <tr><td colSpan="4" className="p-8 text-center text-gray-400">No hay ventas registradas.</td></tr>
                    ) : (
                        ventas.map((venta) => (
                        <tr key={venta.id} className="hover:bg-flora-bg/20 transition">
                            <td className="p-4 font-bold text-gray-700">#{venta.id}</td>
                            <td className="p-4 text-gray-600">{new Date(venta.fecha).toLocaleString()}</td>
                            <td className="p-4 text-right font-bold text-flora-green">Bs {Number(venta.total).toFixed(2)}</td>
                            <td className="p-4 text-center">
                            <button onClick={() => verDetalles(venta.id)} className="px-4 py-2 bg-flora-green text-white rounded-lg hover:bg-opacity-90 transition text-sm shadow-sm">Ver Ticket </button>
                            </td>
                        </tr>
                        ))
                    )
                ) : (
                    // RENDERIZADO DE PRODUCTOS (INGRESOS)
                    productos.length === 0 ? (
                        <tr><td colSpan="7" className="p-8 text-center text-gray-400">No hay productos ingresados.</td></tr>
                    ) : (
                        productos.map((prod) => (
                        <tr key={prod.id} className="hover:bg-orange-50 transition">
                            <td className="p-4 font-bold text-gray-400">#{prod.id}</td>
                            <td className="p-4">
                                <img src={prod.imagen_url || "https://cdn-icons-png.flaticon.com/512/628/628283.png"} className="w-10 h-10 rounded-full object-cover border border-gray-200" alt="Flor" />
                            </td>
                            <td className="p-4 font-bold text-gray-700">{prod.nombre}</td>
                            <td className="p-4"><span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">{prod.categoria}</span></td>
                            <td className="p-4 text-center font-bold text-flora-text">{prod.stock} u.</td>
                            <td className="p-4 text-right text-gray-600">Bs {prod.precio}</td>
                            <td className="p-4 text-right font-bold text-flora-text">Bs {(prod.precio * prod.stock).toFixed(2)}</td>
                        </tr>
                        ))
                    )
                )
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL DETALLE VENTA */}
      {detalleVenta && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={cerrarModal}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up" onClick={e => e.stopPropagation()}>
            <div className="bg-flora-green p-4 flex justify-between items-center text-white">
              <h3 className="font-bold text-lg">Ticket de Venta #{detalleVenta.id}</h3>
              <button onClick={cerrarModal} className="hover:bg-white/20 rounded-full p-1 transition">✕</button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <ul className="space-y-4">
                {detalleVenta.items.map((item, index) => (
                  <li key={index} className="flex justify-between items-center border-b border-gray-100 pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="bg-flora-bg w-8 h-8 rounded-full flex items-center justify-center text-flora-green font-bold text-xs">{item.cantidad}x</div>
                      <p className="font-bold text-gray-700">{item.nombre}</p>
                    </div>
                    <span className="font-bold text-flora-text">Bs {(item.cantidad * item.precio_unitario).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Historial;