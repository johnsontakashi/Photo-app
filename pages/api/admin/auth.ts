import type { NextApiRequest, NextApiResponse } from 'next';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

interface AuthRequest extends NextApiRequest {
  body: {
    password: string;
  };
}

interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export default function handler(
  req: AuthRequest,
  res: NextApiResponse<AuthResponse>
) {
  if (req.method === 'POST') {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    if (password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = sign(
        { 
          role: 'admin',
          timestamp: Date.now()
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(200).json({
        success: true,
        token
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }
  }

  if (req.method === 'GET') {
    // Verify token endpoint
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    try {
      const decoded = verify(token, JWT_SECRET);
      return res.status(200).json({
        success: true
      });
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}