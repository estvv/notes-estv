import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';

export function validateContent(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.body.content && req.body.content.length > 1048576) {
    return res.status(400).json({ 
      success: false, 
      error: 'Content exceeds 1MB limit' 
    });
  }
  next();
}