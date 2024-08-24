import { check, validationResult } from 'express-validator'
import path from 'path';
import Usuarios from '../models/Usuarios.js'
import { enviarEmail } from '../handler/email.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });

//CREAR CUENTA!

const formCrearCuenta = (req, res) => {
    res.sendFile(path.resolve('views', 'registro.html'))
}

const crearCuenta = async (req, res) => {
    await check('nombre').notEmpty().withMessage('El nombre no puede ir vacío').run(req)
    await check('email').isEmail().withMessage('No es un email válido').run(req)
    await check('password').notEmpty().withMessage('El password no puede ir vacío').run(req)
    await check('confirmar').notEmpty().withMessage('El password confirmado no puede ir vacío').run(req)
    await check('confirmar').equals(req.body.password).withMessage('Los passwords no son iguales').run(req)

    const errores = validationResult(req)

    if (!errores.isEmpty()) {
        req.session.errores = errores.array()
        req.session.datos = req.body
        return res.redirect('/registro')
    }

    const {email} = req.body

    const existeUsuario = await Usuarios.findOne({where: {email}})
    if(existeUsuario){
        req.session.errores = [{ msg: 'El usuario ya existe, por favor ingrese otro email' }];
        req.session.datos = req.body
        return res.redirect('/registro')
    }

    try{
        const usuario = await Usuarios.create({
            nombre: req.body.nombre,
            email: req.body.email,
            password: req.body.password
        })

        //Crear un JWT para la confirmacion de cuenta
        const token = jwt.sign({ id: usuario.id, email: usuario.email }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });
        

        // Enviar el correo de confirmación
        const opcionesEmail = {
            usuario,
            subject: 'Confirma tu cuenta',
            archivo: 'confirmacion', 
            url: `http://${req.headers.host}/confirmar-cuenta/${token}` 
        };
        await enviarEmail(opcionesEmail);
        req.session.errores = [{ msg: 'SE HA ENVIADO UN EMAIL DE VERIFICACION' }];

    }catch(error){
        req.session.errores = [{ msg: 'Hubo un error al crear la cuenta. Inténtalo de nuevo.' }];
         req.session.datos = req.body
         return res.redirect('/registro')
    }


    res.send('Cuenta creada con éxito');
}

//Confirma cuenta cuando se le manda el email al usuario
const confirmarCuenta = async (req, res) =>{
    const { token } = req.params;  

    try {
        // Verificar el JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const usuario = await Usuarios.findOne({ where: { id: decoded.id } });

        if (!usuario) {
            req.session.errores = [{ msg: 'Token no válido o cuenta ya confirmada. Intenta de nuevo.' }];
            return res.redirect('/registro');
        }

        usuario.verificado = 1;
        await usuario.save();


        return res.redirect('/iniciar-sesion');

    } catch (error) {
        req.session.errores = [{ msg: 'Token no válido o expirado. Intenta de nuevo.' }];
        return res.redirect('/registro');
    }
}

const obtenerErrores = (req, res) => {
    const errores = req.session.errores || []
    const datos = req.session.datos || {}
    req.session.errores = null
    req.session.datos = null
    res.json({ errores, datos })
}


//INICIAR SESION

const formIniciarSesion = (req, res) =>{
    res.sendFile(path.resolve('views', 'iniciar-sesion.html'))
}

const iniciarSesion = async (req, res) => {
    await check('email').isEmail().withMessage('Email es obligatorio').run(req);
    await check('password').notEmpty().withMessage('El password es obligatorio').run(req);

    const errores = validationResult(req)
    
    if (!errores.isEmpty()) {
        req.session.errores = errores.array()
        req.session.datos = req.body
        return res.redirect('/iniciar-sesion')
    }

    //Comprobar si el usuario existe
    const {email, password} = req.body
    const existeUsuario = await Usuarios.findOne({where:{email}})
    if(!existeUsuario){
        req.session.errores = [{ msg: 'El usuario no existe, por favor ingrese otro email' }];
        req.session.datos = req.body
        return res.redirect('/iniciar-sesion')
    }

    //comprobar si el usuario esta confirmado
    if (existeUsuario.verificado === 0) {  
        req.session.errores = [{ msg: 'Cuenta no confirmada. Revisa tu correo para confirmar tu cuenta.' }];
        req.session.datos = req.body;
        return res.redirect('/iniciar-sesion');
    }

    //Comprobar el password
    if(!existeUsuario.verificarPassword(password)){
        req.session.errores = [{ msg: 'El password es incorrecto.' }];
        req.session.datos = req.body;
        return res.redirect('/iniciar-sesion');
    }

    // Generar un token JWT y almacenarlo en una cookie
    const token = jwt.sign({ id: existeUsuario.id }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });

    res.cookie('_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });

    // Almacenar el usuario en req.usuario para poder usarlo en la pagina
    req.usuario = existeUsuario;

    return res.redirect('/gastos');

}

const cerrarSesion = (req, res) => {
    // Eliminar la cookie del token
    res.clearCookie('_token');
    return res.redirect('/iniciar-sesion');
};


export {
    formCrearCuenta,
    crearCuenta,
    confirmarCuenta,
    obtenerErrores,
    formIniciarSesion,
    iniciarSesion,
    cerrarSesion
};
