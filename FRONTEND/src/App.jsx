import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventario from './pages/Inventario';
import Registro from './pages/Registro';
import Ventas from './pages/Ventas';
import Historial from './pages/Historial';  
import Reportes from './pages/Reportes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta por defecto: Muestra el Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta del Dashboard: Muestra el menú principal */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Si escriben cualquier otra cosa, redirigir al login */}
        <Route path="*" element={<Navigate to="/" />} />

        {/* Ruta del Inventario: Muestra la gestión de productos */}
        <Route path="/inventario" element={<Inventario />} />

        {/* Ruta de Registro: Muestra el formulario de registro */}
        <Route path="/registro" element={<Registro />} />

        {/* Ruta de Ventas: Muestra la gestión de ventas */}
        <Route path="/ventas" element={<Ventas />} />

        {/* Ruta de Historial: Muestra el historial de ventas */}
        <Route path="/historial" element={<Historial />} />

        {/* Ruta de Reportes: Muestra la generación de reportes */}
        <Route path="/reportes" element={<Reportes />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;