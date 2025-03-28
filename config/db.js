const {Sequelize} = require('sequelize');
require("dotenv").config()

const db = new Sequelize("firstDatabase","root", "12345678",{
    host: "localhost",
    dialect: "mysql",
})

async function connectDB() {
    try {
        await db.authenticate();
        console.log("Connected to database");
        // await db.sync({force: true});
        // console.log("database synced")
    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

module.exports = {db, connectDB};

