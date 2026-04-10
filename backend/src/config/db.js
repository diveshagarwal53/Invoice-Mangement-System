import mongoose from "mongoose";

const dbConnection = async () => {
    try {
        const connect = await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDb connect successfully ${connect.connection.host}`)


    } catch (error) {
        console.log('MongoDb connection failed', error.message)
        process.exit(1)

    }
}

export default dbConnection;