import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import config from "./config";
import GlobalErrorHandler from "./app/middlewares/globalErrorHandler";
import router from "./app/routes";
import logger from "./utils/logger";

const app: Application = express();

export const corsOptions = {
  origin: [
    config.url.frontend_url || "http://localhost:3000",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:5173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

// Middleware setup
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Serve static files from "uploads" directory
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Log incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Root endpoint
app.get("/", (req: Request, res: Response) => {
  res.send({
    success: true,
    message: "Welcome to the Backend API!",
  });
});

// Health check endpoint
app.get("/api/v1/health", (req: Request, res: Response) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: "Server is healthy and running!",
    uptime: process.uptime(),
    environment: config.env || "development",
    version: process.env.npm_package_version || "1.0.0",
    serverTime: new Date().toISOString(),
    port: config.port,
  });
});

// Setup API routes
app.use("/api/v1", router);

// Error handling middleware
app.use(GlobalErrorHandler);

// 404 Not Found handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
