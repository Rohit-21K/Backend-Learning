import express from "express";
import cors from "cors";
const app = express();

// cors settings

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// defining routes
import userRouter from "./routes/user.routes.js";

app.use("/api/v1/user", userRouter);

export { app };
