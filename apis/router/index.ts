import { Router } from "express";
// Import your route modules here
// import userRoutes from "./user.routes.ts";
// import authRoutes from "./auth.routes.ts";

const router = Router();

// Register all routes
// router.use("/users", userRoutes);
// router.use("/auth", authRoutes);

// Example route to show API is working
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is working",
    version: "1.0.0"
  });
});

export const routes = router; 