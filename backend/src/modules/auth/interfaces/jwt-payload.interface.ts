export interface JwtPayload {
  sub: string;       // user_id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}
