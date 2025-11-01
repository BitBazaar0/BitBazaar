import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  id: string;
  email: string;
  username: string;
}

export const generateToken = (payload: TokenPayload): string => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  
  return jwt.sign(payload, jwtSecret, {
    expiresIn
  } as SignOptions);
};

export const verifyToken = (token: string): TokenPayload => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.verify(token, jwtSecret) as TokenPayload;
};

