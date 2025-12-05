const db = require('./db'); // Importamos la conexión

async function limpiarDatos() {
    console.log("🧹 Iniciando limpieza de productos...");

    try {
        // TRUNCATE vacía la tabla y reinicia el contador de IDs a 1
        await db.query('TRUNCATE TABLE productos');

        console.log("\n✨ ¡Limpieza completada! La tabla de productos está vacía y como nueva.");
        process.exit(); // Cierra el programa

    } catch (error) {
        console.error("\n❌ Error al limpiar:", error);
        // Si TRUNCATE falla (a veces pasa por claves foráneas), intentamos DELETE
        try {
            await db.query('DELETE FROM productos');
            console.log("✨ Se eliminaron los datos usando DELETE.");
            process.exit();
        } catch (e) {
            console.error("❌ Error fatal:", e);
            process.exit(1);
        }
    }
}

limpiarDatos();