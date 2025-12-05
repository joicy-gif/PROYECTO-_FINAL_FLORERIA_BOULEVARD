import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function Reportes() {
  const [datos, setDatos] = useState([]);
  const [tipoReporte, setTipoReporte] = useState('ventas'); // 'ventas' o 'inventario'

  useEffect(() => {
    cargarDatos();
  }, [tipoReporte]);

  const cargarDatos = async () => {
    try {
      if (tipoReporte === 'ventas') {
        // Pide al backend la lista con nombres de clientes
        const res = await axios.get('http://localhost:3001/reportes/ventas-detalladas');
        setDatos(res.data);
      } else {
        const res = await axios.get('http://localhost:3001/productos');
        setDatos(res.data);
      }
    } catch (error) { console.error(error); }
  };

  const descargarPDF = () => {
    const doc = new jsPDF();
    const titulo = tipoReporte === 'ventas' ? "Reporte General de Ventas" : "Reporte de Inventario Actual";
    
    // Encabezado del PDF
    doc.setFontSize(18);
    doc.text("Florería Boulevard", 14, 22);
    doc.setFontSize(14);
    doc.text(titulo, 14, 32);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 14, 40);

    const columnas = tipoReporte === 'ventas' 
      ? ["# Ticket", "Fecha", "Cliente", "CI/NIT", "Total"]
      : ["Producto", "Categoría", "Estado", "Stock", "Precio"];

    const filas = datos.map(item => {
        if(tipoReporte === 'ventas') {
            return [
                item.id, 
                new Date(item.fecha).toLocaleDateString(), 
                item.cliente || "Público General", 
                item.ci_nit || "-", 
                `Bs ${item.total}`
            ];
        } else {
            return [
                item.nombre, 
                item.categoria, 
                item.estado === 1 ? "Activo" : "Inactivo", 
                item.stock, 
                `Bs ${item.precio}`
            ];
        }
    });

    autoTable(doc, { startY: 45, head: [columnas], body: filas });
    doc.save(`Reporte_${tipoReporte}.pdf`);
  };

  return (
    <div className="flex h-screen bg-gray-100">
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
            <Link to="/historial" className="flex items-center px-4 py-3 text-gray-200 hover:bg-flora-light/20 hover:text-white rounded-lg transition">📜 Historial</Link>
            <div className="flex items-center px-4 py-3 bg-flora-light/20 text-white rounded-lg shadow-sm font-bold">📄 Reportes</div>

        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto flex flex-col items-center">
        <div className="w-full max-w-4xl flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-700">Vista Previa de Reportes</h1>
            <div className="flex gap-2 bg-white p-1 rounded-lg shadow">
                <button onClick={() => setTipoReporte('ventas')} className={`px-4 py-2 rounded transition ${tipoReporte === 'ventas' ? 'bg-flora-green text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>Ventas</button>
                <button onClick={() => setTipoReporte('inventario')} className={`px-4 py-2 rounded transition ${tipoReporte === 'inventario' ? 'bg-flora-green text-white font-bold' : 'text-gray-600 hover:bg-gray-100'}`}>Inventario</button>
            </div>
        </div>

        {/* --- SIMULACIÓN DE HOJA DE PAPEL --- */}
        <div className="bg-white shadow-2xl w-full md:w-[21cm] min-h-[29.7cm] p-[1.5cm] md:p-[2cm] relative text-sm text-gray-800 border border-gray-200 transition-all">
            
            {/* Membrete */}
            <div className="border-b-2 border-flora-green pb-4 mb-8 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-flora-green uppercase tracking-wide">Florería Boulevard</h2>
                    <p className="text-gray-500 text-xs">Sistema de Gestión Integral</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-lg text-gray-700">{tipoReporte === 'ventas' ? 'REPORTE DE VENTAS' : 'INVENTARIO GENERAL'}</p>
                    <p className="text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Tabla Preview */}
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-800 text-gray-900">
                        {tipoReporte === 'ventas' ? (
                            <> <th className="py-2">#</th> <th className="py-2">Fecha</th> <th className="py-2">Cliente</th> <th className="py-2 text-right">Total</th> </>
                        ) : (
                            <> <th className="py-2">Producto</th> <th className="py-2">Categoría</th> <th className="py-2 text-center">Estado</th> <th className="py-2 text-right">Stock</th> </>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {datos.slice(0, 20).map((d, i) => (
                        <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                            {tipoReporte === 'ventas' ? (
                                <> 
                                    <td className="py-3 font-mono text-gray-500">#{d.id}</td> 
                                    <td className="py-3">{new Date(d.fecha).toLocaleDateString()}</td> 
                                    <td className="py-3">
                                        <span className="font-bold text-gray-700">{d.cliente || "Público General"}</span>
                                        {d.ci_nit && <span className="text-xs text-gray-400 block">NIT: {d.ci_nit}</span>}
                                    </td> 
                                    <td className="py-3 text-right font-bold">Bs {d.total}</td> 
                                </>
                            ) : (
                                <> 
                                    <td className="py-3 font-medium">{d.nombre}</td> 
                                    <td className="py-3 text-xs uppercase text-gray-500">{d.categoria}</td> 
                                    <td className="py-3 text-center">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${d.estado === 1 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {d.estado === 1 ? 'ACTIVO' : 'BAJA'}
                                        </span>
                                    </td> 
                                    <td className="py-3 text-right">{d.stock}</td> 
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
            
            {datos.length > 20 && (
                <div className="text-center py-8 text-gray-400 italic bg-gray-50 mt-4 rounded border border-dashed border-gray-300">
                    ... y {datos.length - 20} registros más visibles en el PDF descargado ...
                </div>
            )}
            
            {/* Pie de página simulado */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-300">
                Documento generado automáticamente por Sistema Boulevard
            </div>

            {/* BOTÓN FLOTANTE DE DESCARGA */}
            <button 
                onClick={descargarPDF}
                className="fixed bottom-8 right-8 md:absolute md:top-8 md:right-[-80px] md:bottom-auto bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-2xl transition transform hover:scale-110 flex items-center justify-center gap-2 group z-50"
                title="Descargar PDF Ahora"
            >
                <span className="text-2xl">💾</span>
                <span className="md:hidden font-bold">Descargar PDF</span>
            </button>
        </div>
      </main>

      {/* MENÚ MÓVIL (Para que no se rompa en celular) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-2 flex justify-around z-50">
        <Link to="/dashboard" className="text-2xl">📊</Link>
        <Link to="/reportes" className="text-2xl text-flora-green">📄</Link>
        <Link to="/ventas" className="text-2xl">🛒</Link>
      </div>
    </div>
  );
}

export default Reportes;