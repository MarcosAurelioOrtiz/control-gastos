import express from 'express';
import csrf from 'csurf'; // Importar el middleware CSRF
import { formCrearCuenta, 
    crearCuenta, 
    confirmarCuenta,
    obtenerErrores, 
    formIniciarSesion,
    iniciarSesion,
    cerrarSesion } from '../controllers/usuariosControllers.js';
import { gastos, 
    obtenerUsuario, 
    registrarGasto, 
    mostrarGastos, 
    formRegistrarGasto } from '../controllers/gastosController.js';
import protegerRuta from '../middleware/protegerRuta.js';

const router = express.Router();
const csrfProtection = csrf({ cookie: true }); // Definir la protección CSRF

// Crear Cuenta
router.get('/registro', csrfProtection, formCrearCuenta);
router.post('/registro', csrfProtection, crearCuenta);
router.get('/errores', obtenerErrores);

// Ruta para la confirmación de la cuenta
router.get('/confirmar-cuenta/:token', confirmarCuenta);

// Iniciar Sesión
router.get('/iniciar-sesion', csrfProtection, formIniciarSesion);
router.post('/iniciar-sesion', csrfProtection, iniciarSesion);

// Cerrar sesión
router.get('/cerrar-sesion', protegerRuta, cerrarSesion);

// Mostrar página de gastos (HTML)
router.get('/gastos', protegerRuta, gastos);

// Ruta para mostrar el formulario de registrar gasto
router.get('/form-gastos', protegerRuta, csrfProtection, formRegistrarGasto);

// Registrar un gasto (Formulario POST)
router.post('/gastos', protegerRuta, csrfProtection, registrarGasto);

// Obtener datos del usuario autenticado (JSON)
router.get('/api/usuario', protegerRuta, obtenerUsuario);

// Obtener los gastos del usuario (JSON)
router.get('/api/gastos', protegerRuta, mostrarGastos);

// Ruta para proporcionar el token CSRF al cliente
router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

export default router;
