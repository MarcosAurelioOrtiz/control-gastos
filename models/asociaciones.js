import Usuarios from './Usuarios.js';
import Gastos from './Gastos.js';

// Definir la relación de uno a muchos
Usuarios.hasMany(Gastos, { foreignKey: 'usuarioId' });
Gastos.belongsTo(Usuarios, { foreignKey: 'usuarioId' });

export {
    Usuarios,
    Gastos
};
