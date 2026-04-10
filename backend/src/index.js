import app from "./app.js";
import dbConnection from "./config/db.js";
import dotenv from 'dotenv'

dotenv.config()

dbConnection()
    .then(() => {
        app.listen(process.env.PORT || 7000, () => {
            console.log(`Server is running on Port: ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log('Mongodb connection failed', err)
    })