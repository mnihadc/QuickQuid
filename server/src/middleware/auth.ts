import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

// 1. Define the shape of the data inside your Token
interface CustomJwtPayload extends JwtPayload {
  id: string;
  role: "seller" | "buyer"; // explicitly define roles
}

// 2. Extend the Express Request to include your custom properties
export interface AuthRequest extends Request {
  userId?: string;
  userRole?: "seller" | "buyer";
}

// 3. Middleware to authenticate JWT
export const authorize = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No authentication token, authorization denied." });
    }

    const secret = process.env.JWT_SECRET || "test_secret_key"; // Use .env secret if available
    const decoded = jwt.verify(token, secret) as CustomJwtPayload;

    (req as AuthRequest).userId = decoded.id;
    (req as AuthRequest).userRole = decoded.role;


    next();
  } catch (error) {
    res.status(401).json({ message: "Token verification failed, authorization denied." });
  }
};

// 4. Middleware for role-based authorization
export const authorizeRole = (role: "seller" | "buyer") => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.userRole !== role) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }
    next();
  };
};
