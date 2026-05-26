import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import mongooseConnection from "./models/mongo/connection.js";
import apiRoutes from "./routes/announcementRoutes.js";
import authRoutes from "./routes/authMe.js";

dotenv.config();
const app = express();

/* ===== CORS (MUST BE FIRST) ===== */
app.use(
  cors({
    origin: "http://localhost:5173", // 👈 EXACT frontend URL
    credentials: true,               // 👈 VERY IMPORTANT (cookies, JWT)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* ===== BODY & COOKIE PARSERS ===== */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===== ROUTES ===== */
app.use("/api", apiRoutes);
app.use("/api/auth", authRoutes);

/* ===== HEALTH CHECK ===== */
app.get("/", (req, res) => {
  res.send("Server is running!");
});


/* ===== DB ===== */
mongooseConnection();



/* ===== SERVER ===== */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
