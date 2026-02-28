import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

/**
 * Extend Express Request to include userId injected by auth middleware
 */
export interface AuthRequest extends Request {
  userId?: string;
}

/**
 * JWT payload shape expected after verification
 */
interface JwtPayload {
  userId: string;
}

/**
 * Authentication Middleware
 * Verifies JWT token from request headers
 * Protects routes by ensuring user is authenticated
 *
 * How it works:
 * 1. Extract token from Authorization header (format: "Bearer <token>")
 * 2. Verify token using JWT secret
 * 3. Attach decoded user data to request object
 * 4. Allow request to proceed if valid, otherwise return error
 */
export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    // Check if token exists
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'No token provided. Authorization denied.'
      });
      return;
    }

    // Extract the actual token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];

    // Verify token and decode payload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    // Attach userId to request object for use in route handlers
    req.userId = decoded.userId;

    // Continue to next middleware or route handler
    next();

  } catch (error: unknown) {
    // Handle expired or invalid tokens
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
      return;
    }

    res.status(401).json({
      success: false,
      message: 'Invalid token. Authorization denied.'
    });
  }
};