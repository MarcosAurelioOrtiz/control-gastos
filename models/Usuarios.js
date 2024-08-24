import { DataTypes } from "sequelize";
import db from '../config/db.js'
import bcrypt from 'bcrypt'

const Usuarios = db.define('usuarios',{
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nombre:{
        type:DataTypes.STRING(60),
        allowNull: false
    },
    email:{
        type: DataTypes.STRING(60),
        allowNull: false,
        validate: {
            isEmail: true // Valida que sea un email
        }
    },
    password:{
        type: DataTypes.STRING(60),
        allowNull: false
    },
    verificado:{
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    tokenPassword: DataTypes.STRING,
    expiraToken: DataTypes.DATE 
},{
    hooks:{
        beforeCreate: async (usuario) => {
            const salt = await bcrypt.genSalt(10)
            usuario.password = await bcrypt.hash(usuario.password, salt)
        }
    },
    scopes:{
        eliminarPassword:{
            attributes:{
                exclude:['password','token','confirmado','createdAt','updatedAt']
            }
        }
    }
})

// Método para comparar los passwords
Usuarios.prototype.verificarPassword = function(password){
    return bcrypt.compareSync(password, this.password);
}

export default Usuarios;