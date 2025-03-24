const {Sequelize} = require('sequelize');
require("dotenv").config()

const db = new Sequelize(process.env.DB_NAME,process.env.DB_USER, process.env.DB_PASSWORD,{
    host: process.env.DB_LOCAL,
    dialect: process.env.DB_DIALECT,
})

async function connectDB() {
    try {
        await db.authenticate();
        console.log("Connected to database");
        await db.sync({force: true});
        console.log("database synced")
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

module.exports = {db, connectDB};

