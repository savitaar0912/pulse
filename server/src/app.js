import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import "dotenv/config";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import notificationRoutes from "./routes/notifications.js";
import streamRoutes from "./routes/stream.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet()); // checkpoint 1: sets security headers
const isDev = process.env.NODE_ENV !== "production";
app.use(
  cors({
    // checkpoint 2: checks if this origin is allowed
    origin: isDev ? true : process.env.CLIENT_URL,
    credentials: true, // required for cookies to cross origins
  }),
);
app.use(morgan("dev")); // checkpoint 3: logs the request
app.use(express.json()); // checkpoint 4: parses the body from raw text to JS object
app.use(cookieParser()); // checkpoint 5: parses cookies into req.cookies

app.get('/debug', (req, res) => {
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    CLIENT_URL: process.env.CLIENT_URL,
  });
});

// Every single request to your backend passes all five before reaching any route.
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/stream", streamRoutes);

//  Instead of writing try/catch + res.status(400).json(...) in every single controller, you have one central place that handles all errors.
app.use(errorHandler); // must be last

export default app;
