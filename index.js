import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import router from './routes/routes.js';
import session from 'express-session';
import db from './config/db.js'
import cookieParser from 'cookie-parser';  // Importa cookie-parser
import csrf from 'csurf';
import { Usuarios, Gastos } from './models/asociaciones.js';

dotenv.config({ path: 'variables.env' });

const app = express();

// Middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'secreto',
    resave: false,
    saveUninitialized: true,
  }));

// Configurar cookie-parser
app.use(cookieParser());

// Definir el middleware CSRF
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Middleware para pasar el token CSRF a las vistas
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();  // Esto estará disponible en tus vistas
    next();
});


  try {
    await db.authenticate();
    db.sync();
    console.log('Conexión correcta a la base de datos');
} catch (error) {
    console.log(error);
}

// Habilitar archivos estáticos
app.use(express.static('public'));

// Configurar la ubicación de las vistas HTML
app.set('views', path.join(path.resolve(), 'views'));


// Usar las rutas adicionales del archivo routes.js si es necesario
app.use('/', router);

app.get('/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

// Iniciar el servidor
const port = process.env.PORT || 5001;
app.listen(port, () => {
    console.log(`El servidor está funcionando en el puerto ${port}`);
});
