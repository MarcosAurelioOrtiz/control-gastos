import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: 'variables.env' });
import Gastos from '../models/Gastos.js';

const gastos = (req, res) => {
    res.sendFile(path.resolve('views', 'gastos.html'));
}

const obtenerUsuario = (req, res) => {
    res.json({ nombreUsuario: req.usuario.nombre });
}


// Función para mostrar el formulario de registrar gasto
const formRegistrarGasto = (req, res) => {
    res.sendFile(path.resolve('views', 'form-gastos.html'));
}

const registrarGasto = async (req, res) => {
    const { descripcion, monto, fecha } = req.body;

    try {
        
        await Gastos.create({
            descripcion,
            monto,
            fecha,
            usuarioId: req.usuario.id
        });

        return res.redirect('/gastos');
    } catch (error) {
        console.error('Error al registrar el gasto:', error);
        res.redirect('/form-gastos');
    }
}

// Función para mostrar todos los gastos del usuario
const mostrarGastos = async (req, res) => {
    try {
        const gastos = await Gastos.findAll({ where: { usuarioId: req.usuario.id } });
        res.json(gastos);  // Enviamos los gastos en formato JSON para usarlos en el frontend
    } catch (error) {
        console.error('Error al obtener los gastos:', error);
        res.status(500).json({ error: 'Error al obtener los gastos' });
    }
}

export {
    gastos,
    obtenerUsuario,
    formRegistrarGasto,
    registrarGasto,
    mostrarGastos
};