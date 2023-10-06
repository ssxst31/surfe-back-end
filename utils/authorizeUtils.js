const jwt = require("jsonwebtoken");

const JWT_TOKEN_SALT = "jwtTokenSalt";

const createToken = (value) => {
  return jwt.sign(value, JWT_TOKEN_SALT);
};

const verifyToken = (token) => {
  return jwt.verify(token, JWT_TOKEN_SALT);
};

module.exports = {
  JWT_TOKEN_SALT,
  createToken,
  verifyToken,
};
