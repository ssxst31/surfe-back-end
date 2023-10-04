import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";
import { getDistance } from "../utils/map.js";

export const userListByMeDistance = async (req, res) => {
  getConnection((conn) => {
    const sql = `
    SELECT 
    * 
    FROM
    user;`;

    conn.query(sql, (error, rows) => {
      const me = rows.find((row) => row.id === req.memberId);
      const sql2 = `SELECT * FROM friend WHERE sender_id LIKE'${req.memberId}' OR receiver_id LIKE'${req.memberId}'`;
      console.log(1);
      conn.query(sql2, (error, rows22) => {
        if (error) {
          return console.log(error);
        }

        const userList = rows
          .filter((row) => {
            const distance =
              getDistance(
                Number(me.lat),
                Number(me.lng),
                Number(row.lat),
                Number(row.lng)
              ) / 1000;

            // 거리가 5km 이내이고, 현재 사용자(me)와 다른 사용자인 경우에만 필터링합니다.
            return distance < 5 && me.id !== row.id;
          })
          .map((row) => {
            const sentRequests = rows22.filter(
              (row22) => Number(row22.sender_id) === row.id
            );
            const receivedRequests = rows22.filter(
              (row22) => Number(row22.receiver_id) === row.id
            );

            const hasMatchingIds = sentRequests.some((itemA) => {
              return receivedRequests.some((itemB) => {
                return (
                  itemA.sender_id === itemB.receiver_id &&
                  itemA.receiver_id === itemB.sender_id
                );
              });
            });

            let friendStatus = "other";
            if (hasMatchingIds) {
              friendStatus = "friend";
            } else if (receivedRequests.length > 0) {
              friendStatus = "requesting";
            } else if (sentRequests.length > 0) {
              friendStatus = "requested";
            }

            return {
              id: row.id,
              loginId: row.login_id,
              nickname: row.nickname,
              profile: row.profile,
              profileImage: row.profile_image,
              statusMessage: row.status_message,
              friendStatus: friendStatus,
            };
          })
          .filter((a) => a);

        return res.status(StatusCodes.OK).send(userList);
      });
    });
    conn.release();
  });
};

export const profile = async (req, res) => {
  const { userId } = req.params;

  getConnection((conn) => {
    const sql1 = `
    SELECT DISTINCT
    user.login_id,
    user.id,
    user.profile_image,
    user.nickname,
    user.mbti,
    user.status_message,
    interest.member_id,
    interest.title
    FROM user
    join interest on user.id = interest.member_id
    WHERE user.id LIKE '${userId}'
   `;

    conn.query(sql1, (error, rows) => {
      const row = {
        loginId: rows[0].login_id,
        id: rows[0].id,
        nickname: rows[0].nickname,
        profileImage: rows[0].profile_image,
        statusMessage: rows[0].status_message,
        interestList: [rows[0].title, rows[1].title, rows[2].title],
        mbti: rows[0].mbti,
      };
      return res.status(StatusCodes.OK).send(row);
    });

    conn.release();
  });
};
