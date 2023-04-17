import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";

export const profile = async (req, res) => {
  getConnection((conn) => {
    const sql1 = `SELECT users.email, users.id, users.profile, location.lat, location.lng, users.nickname ,interestList.interestList, mbti.mbti, introduce.introduce FROM location JOIN users ON users.id = location.memberId JOIN mbti ON mbti.memberId = location.memberId JOIN interestList ON interestList.memberId = location.memberId JOIN introduce ON introduce.memberId = location.memberId WHERE location.memberId LIKE '${req.memberId}'`;

    conn.query(sql1, (error, rows) => {
      const row = {
        ...rows[0],
        interestList: JSON.parse(rows[0].interestList),
      };
      return res.status(StatusCodes.OK).send(row);
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

export const upload = async (req, res) => {
  const timestamp = new Date().toISOString().replace(/:/g, "-").slice(0, 13);
  const aa = timestamp + "-" + decodeURIComponent(req.file.originalname);

  getConnection((conn) => {
    const sql1 = `UPDATE users SET profile = '${aa}' WHERE id = '${req.memberId}'`;

    conn.query(sql1, (error, rows) => {
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).send(error);
      }
      return res.status(StatusCodes.OK).send("OK");
    });

    conn.release();
  });
};
