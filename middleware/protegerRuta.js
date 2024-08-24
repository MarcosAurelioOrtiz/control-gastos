import jwt from 'jsonwebtoken';
import Usuarios from '../models/Usuarios.js';

const protegerRuta = async(req, res, next) => {

    // Verificar si hay un token
    const { _token } = req.cookies;

    if (!_token) {
        return res.redirect('/iniciar-sesion');
    }

    // Comprobar el token
    try {
        const decoded = jwt.verify(_token, process.env.JWT_SECRET);
        const usuario = await Usuarios.scope('eliminarPassword').findByPk(decoded.id);

        // Almacenar el usuario en req.usuario
        if (usuario) {
            req.usuario = usuario;
        } else {
            return res.redirect('/iniciar-sesion');
        }
    } catch (error) {
        console.log('Error verificando el token:', error);
        return res.clearCookie('_token').redirect('/iniciar-sesion');
    }

    next();
};

export default protegerRuta;
