// Archivo: index.js (Versión Definitiva, Adaptada y Segura)

// --- 1. IMPORTACIONES ---
const express = require('express');
const cors = require('cors');
const path = require('path');
const ipRangeCheck = require('ip-range-check'); // Para la seguridad de IP

// --- 2. INICIALIZACIÓN DE LA APP ---
const app = express();
app.use(express.json());

// --- 3. CONFIGURACIÓN DE SEGURIDAD ---

// Habilitamos esto para que Express confíe en la información del proxy de Render
// y nos dé la IP real del visitante en `req.ip`. Es más fiable que 'x-forwarded-for'.
app.set('trust proxy', 1);

// Definimos la lista de IPs y RANGOS permitidos
const whitelist = [
    '45.232.149.130',      // IP del Instituto (Pública)
    '168.194.102.140',     // Tu IP de casa (si la necesitas)
    '10.214.0.0/16'        // EL RANGO COMPLETO DE IPs INTERNAS DE RENDER
];

// Creamos nuestro "portero" (Middleware de seguridad de IP)
const ipWhitelistMiddleware = (req, res, next) => {
    const clientIp = req.ip;
    console.log(`Petición recibida desde la IP: ${clientIp}`);

    // Verificamos si la IP está en la lista o dentro del rango
    if (ipRangeCheck(clientIp, whitelist)) {
        next(); // Permitido
    } else {
        res.status(403).json({ error: `Acceso prohibido: Su dirección IP (${clientIp}) no está autorizada.` });
    }
};

// --- 4. APLICACIÓN DE MIDDLEWARES ---

// 1ro: Aplicamos nuestro portero de IP a TODAS las peticiones
app.use(ipWhitelistMiddleware);

// 2do: Aplicamos CORS. Solo las IPs que pasaron el primer filtro llegarán aquí.
app.use(cors());


// --- 5. RUTAS DE LA API (Respetando tu estructura) ---
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios'); // Tu ruta es 'usuarios.js', no 'usuario.js'

app.use('/', authRoutes); // Para /login
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/usuarios', usuariosRoutes); // Tu ruta es '/usuarios', no '/usuario'

// --- 6. DOCUMENTACIÓN SWAGGER ---
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tienda Gamer',
      version: '1.0.0',
      description: 'Documentación técnica completa de la API.',
    },
    servers: [{ url: 'https://tienda-gamer-api.onrender.com' }],
    components: {
      securitySchemes: {
        BearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    },
  },
  apis: [path.join(__dirname, './routes/*.js')], // Ruta absoluta para que Render la encuentre
};
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 7. INICIO DEL SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
