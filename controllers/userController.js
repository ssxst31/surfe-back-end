import { StatusCodes } from "http-status-codes";

import { verifyToken } from "../utils/authorizeUtils.js";
import getConnection from "../routes/pool.js";
import { getDistance } from "../utils/map.js";

export const userListByMeDistance = async (req, res) => {
  getConnection((conn) => {
    conn.query(
      `SELECT * FROM chat.users WHERE email LIKE '${req.email}';`,
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
  getConnection((conn) => {
    const sql1 = `SELECT users.email, users.id, location.lat, location.lng, users.nickname FROM location JOIN users ON users.email = location.email WHERE location.email LIKE '${req.email}'`;
    console.log(sql1);
    conn.query(sql1, (error, rows) => {
      console.log(rows[0]);
      return res.status(StatusCodes.OK).send(rows[0]);
    });

    conn.release();
  });
};

export const location = async (req, res) => {
  const { lat, lng, email } = req.body;
  console.log(lat, lng, email);
  getConnection((conn) => {
    const sql1 = `INSERT INTO location (email, lat, lng ) VALUES ('${email}', '${lat}', '${lng}' ) ON DUPLICATE KEY UPDATE email = '${email}', lat = '${lat}', lng = '${lng}'`;

    conn.query(sql1, (error, rows) => {
      return res.status(StatusCodes.OK).send(rows[0]);
    });

    conn.release();
  });
};
