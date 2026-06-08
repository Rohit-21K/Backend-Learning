import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/db-connection.js";

// configuring dotenv
dotenv.config({
  path: "../.env",
});

// listennig to port and connecting Database

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server connected to port :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("MongoDb Connection Failed");
  });
