🌸 Florería Boulevard - Sistema de Gestión Integral

Desarrollado por: JOICY MARIJO QUISPE QUISPE

📖 Descripción del Proyecto

Florería Boulevard es una solución tecnológica Full Stack diseñada para optimizar la administración de inventarios y el flujo de ventas en negocios de floristería.

El sistema reemplaza los registros manuales por una plataforma digital robusta que permite:

Controlar el stock en tiempo real.

Gestionar ventas con asignación de clientes.

Generar reportes automáticos en PDF.

Visualizar el rendimiento del negocio mediante un Dashboard interactivo.

🛠️ Tecnologías Utilizadas (Tech Stack)

El proyecto ha sido construido utilizando una arquitectura moderna y escalable:

Frontend: React.js con Tailwind CSS para una interfaz responsiva y moderna.

Backend: API RESTful construida sobre Node.js y Express.

Persistencia: Base de datos relacional MySQL.

Seguridad: Encriptación de contraseñas y validación anti-bots.

✨ Características Principales

Dashboard Ejecutivo: Gráficas estadísticas de stock y tarjetas de resumen.

Gestión de Inventario (CRUD):

Alta, baja y modificación de productos.

Eliminación Lógica: Los productos no se borran, cambian de estado para preservar el historial.

Alertas visuales de "Stock Crítico".

Punto de Venta (POS):

Carrito de compras interactivo.

Selección y registro rápido de clientes (NIT/CI).

Descuento automático de stock al confirmar la venta.

Reportes Inteligentes:

Generación de PDFs para Inventario Valorizado y Tickets de Venta.

Seguridad:

Login con Captcha Matemático.

Auditoría de accesos (Logs de IP y fecha).

📋 Requisitos de Instalación

Antes de iniciar, asegúrate de contar con el siguiente entorno:

Node.js (v14 o superior).

MySQL Server (XAMPP, Workbench o similar).

Git (Opcional).

🚀 Guía de Despliegue Rápido

Paso 1: Base de Datos 🐬

Abre tu gestor SQL favorito (phpMyAdmin, Workbench).

Crea una base de datos vacía llamada: floreria_db

Nota: No es necesario importar tablas. El sistema cuenta con Auto-Reparación y creará la estructura necesaria automáticamente al iniciar el servidor.

Paso 2: Configuración del Backend (Servidor) 🟢

El cerebro de la aplicación que gestiona la lógica y la conexión a datos.

cd BACKEND
npm install      # Instala las dependencias del servidor
node index.js    # Inicia el servicio


Deberías ver el mensaje: 🌸 Servidor PRO corriendo en puerto 3001

Paso 3: Configuración del Frontend (Cliente) ⚛️

La interfaz visual donde interactúa el usuario.

cd FRONTEND      # (En una nueva terminal)
npm install      # Instala React, Vite y Tailwind
npm run dev      # Inicia la aplicación web


Abre el enlace mostrado (ej: http://localhost:5173) en tu navegador.

📂 Estructura del Proyecto

FLORERIA_BOULEVARD/
│
├── 📂 BACKEND/             # Lógica del Servidor (API)
│   ├── index.js            # Punto de entrada y Rutas
│   └── db.js               # Conexión a MySQL
│
├── 📂 FRONTEND/            # Interfaz de Usuario (React)
│   ├── src/pages/          # Vistas (Dashboard, Ventas, etc.)
│   └── src/assets/         # Recursos estáticos
│
└── .gitignore              # Configuración de exclusión para Git


🔑 Acceso al Sistema

Si es la primera vez que ingresas:

Ve a la pantalla de Registro.

Crea un usuario administrador.

Ingresa con tus credenciales resolviendo el Captcha de seguridad.

© 2025 Florería Boulevard.

Autor Principal: JOICY MARIJO QUISPE QUISPE
