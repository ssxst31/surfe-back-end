import { StatusCodes } from "http-status-codes";

import { verifyToken } from "../utils/authorizeUtils.js";
import getConnection from "../routes/pool.js";
import { getDistance } from "../utils/map";

export const userListByMeDistance = async (req, res) => {
  getConnection((conn) => {
    conn.query(
      `SELECT * FROM chat.users WHERE nickname LIKE '${req.userNickname}';`,
      (error, rows1) => {
        if (error) {
          return console.log(error);
        }

        const sql1 = `SELECT * FROM users`;

        conn.query(sql1, (error, rows) => {
          let userList = [];

          for (let i = 0; i < rows.length; i++) {
            if (
              getDistance(
                rows1[0].lat,
                rows1[0].lng,
                rows[i].lat,
                rows[i].lng
              ) /
                1000 <
                5 &&
              rows1[0].id !== rows[i].id
            ) {
              userList.push({ id: rows[i].id, nickname: rows[i].nickname });
            }
          }

          return res.status(StatusCodes.OK).send({
            userList,
          });
        });
      }
    );

    conn.release();
  });
};

export const profile = async (req, res) => {
  const cookies = req.headers.cookies ?? req.headers.cookie;

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
