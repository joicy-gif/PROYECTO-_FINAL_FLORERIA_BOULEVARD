🌸 Florería Boulevard - Sistema de Gestión

Sistema Full Stack para la gestión de inventario y ventas de una florería.
Desarrollado con React (Vite), Node.js (Express) y MySQL.

📋 Requisitos Previos

Antes de iniciar, asegúrate de tener instalado:

Node.js (v14 o superior).

MySQL Server (XAMPP, MySQL Workbench, o similar).

Git (Opcional, para clonar el repositorio).

🚀 Paso 1: Configuración de la Base de Datos

Abre tu gestor de base de datos (phpMyAdmin, Workbench, TablePlus).

Crea una base de datos nueva llamada: floreria_db.

El sistema tiene una función de Auto-Reparación. Al iniciar el servidor Backend por primera vez, creará las tablas necesarias (usuarios, productos, ventas, detalle_ventas) automáticamente.

(Opcional) Si tienes un archivo seeder.js, ejecútalo para llenar productos de prueba.

🛠️ Paso 2: Instalación del Backend (Servidor)

El backend maneja la lógica, la conexión a la BD y la seguridad.

Abre una terminal y entra a la carpeta del backend:

cd BACKEND


Instala las dependencias:

npm install


Configura tu conexión a la base de datos en el archivo db.js (verifica usuario y contraseña de tu MySQL).

Inicia el servidor:

npm run dev
# O también: node index.js


Deberías ver el mensaje: "🌸 Servidor corriendo en el puerto 3001"

🎨 Paso 3: Instalación del Frontend (Cliente)

La interfaz visual donde interactúa el usuario.

Abre otra terminal (sin cerrar la del backend) y entra a la carpeta del frontend:

cd FRONTEND


Instala las dependencias:

npm install


Inicia la aplicación:

npm run dev


Abre el link que aparece en la terminal (usualmente http://localhost:5173) en tu navegador.

🔑 Credenciales de Acceso

Para ingresar al sistema por primera vez, registra un usuario desde la pantalla de Registro o inserta uno manualmente en la base de datos si deshabilitaste el registro público.

📦 Estructura del Proyecto

/BACKEND

index.js: Punto de entrada del servidor y rutas API.

db.js: Configuración de conexión MySQL.

/FRONTEND

/src/pages: Vistas principales (Dashboard, Ventas, Inventario, Historial).

/src/assets: Imágenes y recursos estáticos.

Desarrollado por JOICY