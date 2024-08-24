import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config({ path: 'variables.env' });

const db = new Sequelize(process.env.BD_NOMBRE, process.env.BD_USER, process.env.BD_PASSWORD,{
    host: process.env.BD_HOST,
    port: 5432,
    dialect: 'postgres',
    define:{
        timestamps: true
    },
    pool:{
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false
})

export default db;