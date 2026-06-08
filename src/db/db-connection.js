import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");
    console.log(`Host :${connectionInstance.connection.host}`);
    console.log(`DB :${connectionInstance.connection.name}`);
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
