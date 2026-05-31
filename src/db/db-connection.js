import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}?appName=Cluster0`
    );
    console.log("MongoDB connected successfully!");
    console.log(`Host :${connectionInstance.connection.host}`);
    console.log(`DB :${connectionInstance.connection.name}`);
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1);
  }
};

export default connectDB;
