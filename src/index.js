import "./constants.js";
import { app } from "./app.js";
import connectDB from "./db/db-connection.js";

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
      