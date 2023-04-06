import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";

export const profile = async (req, res) => {
  getConnection((conn) => {
    const sql1 = `SELECT users.email, users.id, location.lat, location.lng, users.nickname FROM location JOIN users ON users.id = location.memberId WHERE location.memberId LIKE '${req.memberId}'`;

    conn.query(sql1, (error, rows) => {
      return res.status(StatusCodes.OK).send(rows[0]);
    });

    conn.release();
  });
};

export const location = async (req, res) => {
  const { lat, lng } = req.body;

  getConnection((conn) => {
    const sql1 = `INSERT INTO location (memberId, lat, lng ) VALUES ('${req.memberId}', '${lat}', '${lng}' ) ON DUPLICATE KEY UPDATE memberId = '${req.memberId}', lat = '${lat}', lng = '${lng}'`;

    conn.query(sql1, (error, rows) => {
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).send(error);
      }
      return res.status(StatusCodes.OK).send("OK");
    });

    conn.release();
  });
};
