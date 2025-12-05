const db = require('./db');
const { faker } = require('@faker-js/faker');

const FLORES_BOLIVIA = [
    { nombre: "Kantuta Tricolor", categoria: "Nacionales", precioBase: 15, imagen: "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Patujú Bandera", categoria: "Nacionales", precioBase: 25, imagen: "https://images.unsplash.com/photo-1554631221-f9603e6808ba?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Rosa Cochabambina", categoria: "Rosas", precioBase: 7, imagen: "https://images.unsplash.com/photo-1562690868-60bbe7293e94?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Orquídea de los Yungas", categoria: "Orquídeas", precioBase: 45, imagen: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Girasol del Oriente", categoria: "Girasoles", precioBase: 10, imagen: "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Clavel Paceño", categoria: "Claveles", precioBase: 3, imagen: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Lirio de Tarija", categoria: "Lirios", precioBase: 12, imagen: "https://images.unsplash.com/photo-1526431969623-28929e0839c0?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Gladiolo Blanco", categoria: "Gladiolos", precioBase: 5, imagen: "https://images.unsplash.com/photo-1596726694833-255979c44569?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Astromelia", categoria: "Arreglos", precioBase: 8, imagen: "https://images.unsplash.com/photo-1588863640232-a72e82542a2d?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Crisantemo", categoria: "Otros", precioBase: 4, imagen: "https://images.unsplash.com/photo-1568971556093-a442e6669936?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Arreglo Illimani", categoria: "Arreglos", precioBase: 80, imagen: "https://images.unsplash.com/photo-1563241527-3004b7be0fee?auto=format&fit=crop&w=300&q=80" },
    { nombre: "Caja de Rosas", categoria: "Cajas", precioBase: 100, imagen: "https://images.unsplash.com/photo-1592482703909-373df8993e2b?auto=format&fit=crop&w=300&q=80" }
];

const VARIACIONES = [
    { nombre: "Premium", factor: 1.3 },
    { nombre: "de Exportación", factor: 1.2 },
    { nombre: "Fresca", factor: 1.0 },
    { nombre: "Grande", factor: 1.1 },
    { nombre: "en Maceta", factor: 1.2 },
    { nombre: "Silvestre", factor: 0.8 },
    { nombre: "Especial", factor: 1.1 },
    { nombre: "del Valle", factor: 1.0 },
    { nombre: "Amazónica", factor: 1.05 }
];

async function sembrarDatos() {
    console.log("🇧🇴 Regenerando precios de MERCADO (Redondeados)...");

    try {
        await db.query('TRUNCATE TABLE productos');
        console.log("🧹 Tabla limpiada.");

        for (let i = 0; i < 50; i++) {
            const florBase = FLORES_BOLIVIA[Math.floor(Math.random() * FLORES_BOLIVIA.length)];
            const variacion = VARIACIONES[Math.floor(Math.random() * VARIACIONES.length)];

            const nombre = `${florBase.nombre} ${variacion.nombre}`;
            const categoria = florBase.categoria;
            
            // CÁLCULO DE PRECIO REALISTA (Redondeado a .50 o .00)
            const variacionAzar = (Math.random() * 4) - 2; 
            let precioCalculado = (florBase.precioBase * variacion.factor) + variacionAzar;
            
            // Función mágica para redondear a 0.50 (Ej: 7.42 -> 7.50, 7.10 -> 7.00)
            let precioFinal = Math.round(precioCalculado * 2) / 2;
            precioFinal = Math.max(2, precioFinal); 

            // STOCK REALISTA:
            // 10% de probabilidad de tener stock crítico (0-5) para probar tu alerta
            let stock;
            if (Math.random() < 0.1) {
                stock = faker.number.int({ min: 0, max: 5 }); // Stock crítico
            } else {
                stock = faker.number.int({ min: 6, max: 100 }); // Stock normal
            }

            const imagen = florBase.imagen;
            const descripcion = `Hermosa ${florBase.nombre.toLowerCase()} cultivada en tierras bolivianas. Calidad ${variacion.nombre.toLowerCase()}.`;

            await db.query(
                'INSERT INTO productos (nombre, categoria, precio, stock, descripcion, imagen_url) VALUES (?, ?, ?, ?, ?, ?)', 
                [nombre, categoria, precioFinal.toFixed(2), stock, descripcion, imagen]
            );
            
            process.stdout.write("🌸");
        }

        console.log("\n\n✨ ¡LISTO! Precios de mercado generados.");
        process.exit();

    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

sembrarDatos();