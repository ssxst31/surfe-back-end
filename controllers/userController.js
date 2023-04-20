import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";
import { getDistance } from "../utils/map.js";

export const userListByMeDistance = async (req, res) => {
  getConnection((conn) => {
    conn.query(
      `SELECT users.user_id, location.lat, location.lng, users.nickname FROM location JOIN users ON users.user_id = location.memberId WHERE location.memberId LIKE '${req.memberId}'`,
      (error, rows1) => {
        if (error) {
          return console.log(error);
        }

        const sql1 = `SELECT users.user_id, users.profile, location.lat, location.lng, users.nickname FROM location JOIN users ON users.user_id = location.memberId`;

        conn.query(sql1, (error, rows) => {
          let userList = [];

          for (let i = 0; i < rows.length; i++) {
            if (
              getDistance(
                Number(rows1[0].lat),
                Number(rows1[0].lng),
                Number(rows[i].lat),
                Number(rows[i].lng)
              ) /
                1000 <
                5 &&
              rows1[0].user_id !== rows[i].user_id
            ) {
              userList.push({
                id: rows[i].user_id,
                nickname: rows[i].nickname,
                profile: rows[i].profile,
              });
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
  const { userId } = req.params;

  getConnection((conn) => {
    const sql1 = `SELECT  users.nickname, users.profile ,interestList.interestList, mbti.mbti, introduce.introduce FROM interestList JOIN users ON users.user_id = interestList.memberId JOIN mbti ON mbti.memberId = interestList.memberId JOIN introduce ON introduce.memberId = interestList.memberId WHERE interestList.memberId LIKE '${userId}'`;

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
