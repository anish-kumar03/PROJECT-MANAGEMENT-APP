import mongoose from "mongoose"

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`)
        console.log("MongoDB connected successfully")

    } catch (error) {
        console.error("Mongo DB connection error", error)
        process.exit(1)
    }
}


export default connectDB