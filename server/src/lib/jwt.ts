import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "SECRETE-KEY-TRIP";

export interface TokenPayload {
  userId: number;
  email?: string | null;
  phone?: string | null;
}

export const generateToken = (payload: TokenPayload, expiresIn: string = "7d"): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
