import jwt from "jsonwebtoken";

export const JWT_TOKEN_SALT = "jwtTokenSalt";

export const createToken = (value) => {
  return jwt.sign(value, JWT_TOKEN_SALT);
};

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_TOKEN_SALT);
};
