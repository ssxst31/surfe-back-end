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

  const token = cookies.split("=")[1].split(";")[0];

  return res.status(StatusCodes.OK).send({ data: verifyToken(token) });
};
