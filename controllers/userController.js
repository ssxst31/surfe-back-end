import { StatusCodes } from "http-status-codes";

import { verifyToken } from "../utils/authorizeUtils.js";
import getConnection from "../routes/pool.js";

export const list = async (req, res) => {
  getConnection((conn) => {
    const sql1 = `SELECT * FROM users`;
    conn.query(sql1, (error, rows) => {
      return res.status(StatusCodes.OK).send({
        data: rows,
      });
    });

    conn.release();
  });
};

export const profile = async (req, res) => {
  const cookies = req.headers.cookies;

  if (!cookies) {
    return res.status(StatusCodes.BAD_REQUEST).send("토큰이 없습니다.");
  }

  const token = cookies.split("=")[1].split(";")[0];
  getConnection((conn) => {
    const sql1 = `SELECT id, nickname, email, lat, lng FROM chat.users WHERE email LIKE '${
      verifyToken(token).email
    }'`;
    conn.query(sql1, (error, rows) => {
      return res.status(StatusCodes.OK).send(rows[0]);
    });

    conn.release();
  });
};
