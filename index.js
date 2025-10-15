// Archivo: index.js (Versión Completa y Definitiva)

const express = require('express');
const cors = require('cors');
const path = require('path');

// 1. INICIALIZAR LA APLICACIÓN
const app = express();

// 2. MIDDLEWARES BÁSICOS
app.use(express.json()); // Para que Express entienda peticiones con cuerpo JSON
// Habilitamos esto para que Express confíe en la información del proxy de Render
// y nos dé la IP real del visitante en `req.ip`.
app.set('trust proxy', 1);

// --- MIDDLEWARE DE SEGURIDAD POR IP (EL "PORTERO") ---
// Esta es la implementación correcta y segura.
const whitelist = ['45.232.149.130', '168.194.102.140', '10.214.148.122']; // IP del Instituto Y TU IP DE CASA

const ipWhitelistMiddleware = (req, res, next) => {
    const clientIp = req.ip; // Obtenemos la IP real del visitante
    
    // Este log te dirá en Render la IP exacta de cualquier visitante
    console.log(`Petición recibida desde la IP: ${clientIp}`);

    // Comprobamos si la IP del visitante está en nuestra lista de invitados
    if (whitelist.includes(clientIp)) {
        // Si está en la lista, le decimos a la petición que continúe.
        next();
    } else {
        // Si NO está en la lista, la bloqueamos inmediatamente.
        res.status(403).json({ error: `Acceso prohibido: Su dirección IP (${clientIp}) no está autorizada.` });
    }
};

// 3. APLICAMOS LA SEGURIDAD
// Le decimos a Express que use nuestro "portero" para TODAS las peticiones que lleguen.
app.use(ipWhitelistMiddleware);

// Ahora que nuestra seguridad por IP está funcionando, podemos usar CORS
// de forma más abierta, ya que solo las IPs permitidas llegarán hasta aquí.
app.use(cors());

// 4. RUTAS DE LA API
const authRoutes = require('./routes/auth');
const categoriasRoutes = require('./routes/categorias');
const productosRoutes = require('./routes/productos');
const imagenesRoutes = require('./routes/imagenes');
const usuariosRoutes = require('./routes/usuarios');

app.use('/', authRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/productos', productosRoutes);
app.use('/imagenes', imagenesRoutes);
app.use('/usuarios', usuariosRoutes);

// 5. CONFIGURACIÓN DE SWAGGER
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Tienda Gamer',
      version: '1.0.0',
      description: 'Documentación técnica completa de la API para la Tienda Gamer.',
    },
    servers: [{ url: 'https://tienda-gamer-api.onrender.com' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http', scheme: 'bearer', bearerFormat: 'JWT',
          description: 'Ingresa el token JWT obtenido en el login. Formato: Bearer <token>'
        }
      }
    },
  },
  apis: [path.join(__dirname, './routes/*.js')],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// 6. INICIO DEL SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
