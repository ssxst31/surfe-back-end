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
          const sql2 = `SELECT * FROM friendList WHERE senderId LIKE'${req.memberId}' OR receiverId LIKE'${req.memberId}'`;

          conn.query(sql2, (error, rows22) => {
            if (error) {
              return console.log(error);
            }

            const userList = rows
              .map((row, i) => {
                if (
                  getDistance(
                    Number(rows1[0].lat),
                    Number(rows1[0].lng),
                    Number(rows[i].lat),
                    Number(rows[i].lng)
                  ) /
                    1000 <
                    5 &&
                  rows1[0].user_id !== row.user_id
                ) {
                  const a = rows22.filter(
                    (row22) => Number(row22.senderId) === row.user_id
                  );
                  const b = rows22.filter(
                    (row22) => Number(row22.receiverId) === row.user_id
                  );

                  const hasMatchingIds = a.some((itemA) => {
                    return b.some((itemB) => {
                      return (
                        itemA.senderId === itemB.receiverId &&
                        itemA.receiverId === itemB.senderId
                      );
                    });
                  });
                  let friendStatus = "other";
                  if (hasMatchingIds) friendStatus = "friend";
                  else if (
                    rows22.some(
                      (row22) =>
                        Number(row22.receiverId) === Number(row.user_id)
                    )
                  )
                    friendStatus = "requesting";
                  else friendStatus = "other";

                  return {
                    id: row.user_id,
                    nickname: row.nickname,
                    profile: row.profile,
                    friendStatus: friendStatus,
                  };
                }
              })
              .filter((a) => a);

            return res.status(StatusCodes.OK).send({
              userList,
            });
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
