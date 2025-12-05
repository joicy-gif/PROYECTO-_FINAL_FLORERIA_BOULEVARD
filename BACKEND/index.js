const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); 
const bcrypt = require('bcryptjs'); 

app.use(cors());
app.use(express.json());

// --- VERIFICACIÓN DE TABLAS (Incluye Clientes) ---
async function verificarTablas() {
    try {
        // Aseguramos que exista la tabla clientes
        await db.query(`
            CREATE TABLE IF NOT EXISTS clientes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_completo VARCHAR(100),
                ci_nit VARCHAR(20),
                telefono VARCHAR(20),
                email VARCHAR(100)
            )
        `);
        // Las otras tablas ya existen, así que esto es seguro
        console.log("✅ Sistema verificado: Tablas listas.");
    } catch (error) {
        console.error("Error verificando tablas:", error.message);
    }
}

app.get('/prueba-db', async (req, res) => {
    try {
        const [result] = await db.query('SELECT NOW() as fecha');
        res.json({ mensaje: "Conexión exitosa", fecha: result[0].fecha });
    } catch (error) {
        res.status(500).json({ mensaje: "Error de conexión" });
    }
});

// --- AUTENTICACIÓN ---
app.post('/login', async (req, res) => {
    const { email, password } = req.body; 
    try {
        const [users] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (users.length === 0) return res.status(401).json({ success: false, message: "Usuario no encontrado" });
        
        const usuario = users[0];
        const isMatch = await bcrypt.compare(password, usuario.password);

        if (isMatch) {
            const ip = req.ip || req.connection.remoteAddress;
            const navegador = req.headers['user-agent'];
            await db.query('INSERT INTO historial_acceso (usuario_id, ip_usuario, evento, navegador) VALUES (?, ?, ?, ?)', [usuario.id, ip, 'ingreso', navegador]);

            res.json({ success: true, user: { id: usuario.id, nombre: usuario.nombre_completo, rol: usuario.rol } });
        } else {
            res.status(401).json({ success: false, message: "Contraseña incorrecta" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: "Error en el servidor" });
    }
});

app.post('/registro', async (req, res) => {
    const { nombre, email, password } = req.body;
    if (password.length < 6) return res.status(400).json({ success: false, message: "Contraseña débil" });

    try {
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);
        await db.query('INSERT INTO usuarios (nombre_completo, email, password, rol) VALUES (?, ?, ?, ?)', [nombre, email, hashPassword, 'admin']);
        res.json({ success: true, message: "Usuario registrado" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error registro" });
    }
});

app.post('/logout', async (req, res) => {
    const { usuario_id } = req.body;
    try {
        const ip = req.ip || req.connection.remoteAddress;
        const navegador = req.headers['user-agent'];
        await db.query('INSERT INTO historial_acceso (usuario_id, ip_usuario, evento, navegador) VALUES (?, ?, ?, ?)', [usuario_id, ip, 'salida', navegador]);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false });
    }
});

// --- GESTIÓN DE CLIENTES (NUEVO) ---
app.get('/clientes', async (req, res) => {
    try {
        const [clientes] = await db.query('SELECT * FROM clientes ORDER BY id DESC');
        res.json(clientes);
    } catch (error) { res.status(500).json({ message: "Error clientes" }); }
});

app.post('/clientes', async (req, res) => {
    const { nombre, ci_nit, telefono } = req.body;
    try {
        const [result] = await db.query('INSERT INTO clientes (nombre_completo, ci_nit, telefono) VALUES (?, ?, ?)', [nombre, ci_nit, telefono]);
        res.json({ success: true, id: result.insertId });
    } catch (error) { res.status(500).json({ success: false, message: "Error crear cliente" }); }
});

// --- PRODUCTOS ---
app.get('/productos', async (req, res) => {
    try {
        // Traemos TODOS los productos para el inventario, sin importar estado
        const [productos] = await db.query('SELECT * FROM productos');
        res.json(productos);
    } catch (error) { res.status(500).json({ message: "Error productos" }); }
});

app.post('/productos', async (req, res) => {
    const { nombre, categoria, precio, stock, imagen_url } = req.body;
    try {
        const img = imagen_url || 'https://cdn-icons-png.flaticon.com/512/628/628283.png'; 
        // Por defecto estado = 1 (Activo)
        await db.query('INSERT INTO productos (nombre, categoria, precio, stock, descripcion, imagen_url, estado) VALUES (?, ?, ?, ?, ?, ?, 1)', [nombre, categoria, precio, stock, "Sin descripción", img]);
        res.json({ success: true, message: "Guardado" });
    } catch (error) { res.status(500).json({ success: false, message: "Error guardar" }); }
});

app.put('/productos/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, categoria, precio, stock, imagen_url } = req.body;
    try {
        await db.query('UPDATE productos SET nombre = ?, categoria = ?, precio = ?, stock = ?, imagen_url = ? WHERE id = ?', [nombre, categoria, precio, stock, imagen_url, id]);
        res.json({ success: true, message: "Actualizado" });
    } catch (error) { res.status(500).json({ success: false, message: "Error actualizar" }); }
});

// Eliminación Lógica: Cambia estado a 0
app.put('/productos/eliminar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE productos SET estado = 0 WHERE id = ?', [id]);
        res.json({ success: true, message: "Desactivado (Borrado Lógico)" });
    } catch (error) { res.status(500).json({ success: false, message: "Error eliminar" }); }
});

// Reactivación (Opcional): Cambia estado a 1
app.put('/productos/activar/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('UPDATE productos SET estado = 1 WHERE id = ?', [id]);
        res.json({ success: true, message: "Reactivado" });
    } catch (error) { res.status(500).json({ success: false, message: "Error activar" }); }
});

// --- REPORTES Y ESTADÍSTICAS ---
app.get('/estadisticas', async (req, res) => {
    try {
        const [resultados] = await db.query('SELECT categoria as name, COUNT(*) as value FROM productos WHERE estado = 1 GROUP BY categoria');
        res.json(resultados);
    } catch (error) { res.status(500).json({ message: "Error stats" }); }
});

app.get('/logs', async (req, res) => {
    try {
        const [logs] = await db.query('SELECT h.*, u.nombre_completo FROM historial_acceso h JOIN usuarios u ON h.usuario_id = u.id ORDER BY h.fecha_hora DESC LIMIT 5');
        res.json(logs);
    } catch (error) { res.status(500).json({ message: "Error logs" }); }
});

// Reporte Detallado con Clientes (JOIN)
app.get('/reportes/ventas-detalladas', async (req, res) => {
    try {
        const query = `
            SELECT v.id, v.fecha, v.total, c.nombre_completo as cliente, c.ci_nit
            FROM ventas v
            LEFT JOIN clientes c ON v.cliente_id = c.id
            ORDER BY v.fecha DESC
        `;
        const [ventas] = await db.query(query);
        res.json(ventas);
    } catch (error) {
        res.status(500).json({ message: "Error reportes" });
    }
});

// --- PROCESO DE VENTA (Con Cliente) ---
app.post('/vender', async (req, res) => {
    const { productos, cliente_id } = req.body; // Recibimos ID del cliente

    if (!productos || productos.length === 0) {
        return res.status(400).json({ success: false, message: "No hay productos" });
    }

    try {
        let totalVenta = 0;
        const productosEnriquecidos = [];

        // 1. Calcular totales
        for (const item of productos) {
            const [rows] = await db.query('SELECT precio FROM productos WHERE id = ?', [item.id]);
            if (rows.length > 0) {
                const precio = rows[0].precio;
                totalVenta += precio * item.cantidad;
                productosEnriquecidos.push({ ...item, precio });
            }
        }

        // 2. Guardar Venta (Vinculada al Cliente si existe)
        const idClienteFinal = cliente_id || null; // Si viene vacío, se guarda como NULL
        const [ventaResult] = await db.query(
            'INSERT INTO ventas (total, cliente_id, fecha) VALUES (?, ?, NOW())', 
            [totalVenta, idClienteFinal]
        );
        const ventaId = ventaResult.insertId;

        // 3. Detalles y Stock
        for (const item of productosEnriquecidos) {
            await db.query('INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)', [ventaId, item.id, item.cantidad, item.precio]);
            await db.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.id]);
        }

        res.json({ success: true, message: 'Venta registrada' });

    } catch (error) {
        console.error("Error venta:", error.message);
        res.status(500).json({ success: false, message: 'Error Servidor: ' + error.message });
    }
});

// Historial Simple (Para compatibilidad)
app.get('/ventas', async (req, res) => {
    try {
        const [ventas] = await db.query('SELECT * FROM ventas ORDER BY fecha DESC');
        res.json(ventas);
    } catch (error) { res.json([]); }
});

app.get('/ventas/:id', async (req, res) => {
    try {
        const [detalles] = await db.query(`SELECT d.*, p.nombre FROM detalle_ventas d JOIN productos p ON d.producto_id = p.id WHERE d.venta_id = ?`, [req.params.id]);
        res.json(detalles);
    } catch (error) { res.status(500).json({ message: "Error detalles" }); }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
    console.log(`🌸 Servidor PRO corriendo en puerto ${PORT}`);
    await verificarTablas();
});