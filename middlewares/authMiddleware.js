import { StatusCodes } from "http-status-codes";

import { verifyToken } from "../utils/authorizeUtils";
import getConnection from "../routes/pool.js";

export const authMiddleware = async (req, res, next) => {
  const cookie = req.get("cookie") ?? req.get("cookies");

  if (!cookie) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: "토큰이 유효하지 않습니다.",
    });
  }
  const token = cookie.split("=")[1];

  try {
    const user = verifyToken(token);

    getConnection((conn) => {
      const query = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE email LIKE '%${user.email}%';`;
      conn.query(query, async (error, rows) => {
        if (error) throw error;
        if (!rows.length) {
          return res.status(StatusCodes.UNAUTHORIZED).send({
            message: "토큰이 유효하지 않습니다.",
          });
        }
      });

      conn.release();
    });

    req.userNickname = user.nickname;
    next();
  } catch (error) {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      message: "토큰이 유효하지 않습니다.",
    });
  }
};
