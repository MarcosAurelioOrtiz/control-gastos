import emailConfig from '../config/emailConfig.js';
import nodemailer from 'nodemailer';

// Configurar el transporte de nodemailer con Mailtrap
const transport = nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    auth: {
        user: emailConfig.user,
        pass: emailConfig.pass
    }
});

// Función para enviar el correo con HTML puro
const enviarEmail = async (opciones) => {
    try {
        // Contenido HTML del correo
        const html = `
            <h1>Confirma tu cuenta</h1>
            <p>Hola ${opciones.usuario.nombre},</p>
            <p>Por favor confirma tu cuenta haciendo clic en el siguiente enlace:</p>
            <a href="${opciones.url}">Confirmar Cuenta</a>
        `;

        // Configurar el correo electrónico
        const opcionesEmail = {
            from: 'Control de Gastos <no-reply@controlgastos.com>',
            to: opciones.usuario.email,
            subject: opciones.subject,
            html: html  // Aquí usamos HTML puro
        };

        // Enviar el correo electrónico
        await transport.sendMail(opcionesEmail);

    } catch (error) {
        console.error('Error al enviar el email:', error);
        throw new Error('Error en el proceso de envío de email');
    }
};

export {
    enviarEmail
};
