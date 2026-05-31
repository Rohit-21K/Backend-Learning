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

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

export { app };
