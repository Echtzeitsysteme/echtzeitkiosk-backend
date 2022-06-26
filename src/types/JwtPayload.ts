import { RoleType } from 'consts/RoleType';

//! TODO improve
export type JwtPayload = {
  id: string;
  role: RoleType;
  iat: number; // issued at
  exp: number; // expiration
};
