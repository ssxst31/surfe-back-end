import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";

export const profile = async (req, res) => {
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
    WHERE user.id LIKE '${req.memberId}'
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

export const location = async (req, res) => {
  const { lat, lng } = req.body;

  getConnection((conn) => {
    const sql1 = `UPDATE user 
    SET lat = '${lat}', lng = '${lng}'
    WHERE id = ${req.memberId}`;

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
    const sql1 = `UPDATE users SET profile = '${aa}' WHERE login_id = '${req.memberId}'`;

    conn.query(sql1, (error, rows) => {
      if (error) {
        return res.status(StatusCodes.BAD_REQUEST).send(error);
      }
      return res.status(StatusCodes.OK).send("OK");
    });

    conn.release();
  });
};

export const addFriend = async (req, res) => {
  const userId = req.memberId;
  const receiverId = req.body.friendId;

  const sql = `SELECT * 
  FROM friend 
  WHERE sender_id = '${userId}' 
  AND receiver_id = '${receiverId}'`;

  getConnection((conn) => {
    conn.query(sql, function (error, rows) {
      if (error) {
        return console.log(error);
      }

      if (rows.length === 0) {
        const sql = `INSERT INTO friend
        (sender_id, receiver_id) 
        VALUES (${userId}, ${receiverId})`;

        conn.query(sql, function (error, rows) {
          if (error) {
            return console.log(error);
          }

          return res.status(StatusCodes.OK).send({
            message: "OK",
          });
        });
      } else {
        return res.status(400).send({
          message: "이미 친구 추가 요청을 보냈습니다.",
        });
      }
    });
    conn.release();
  });
};

export const deleteFriend = async (req, res) => {
  const userId = req.memberId;
  const receiverId = req.body.friendId;

  const checkQuery = `SELECT * FROM friend WHERE sender_id = ${userId} AND receiver_id = ${receiverId}`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, results) {
      if (error) throw error;

      if (results.length !== 0) {
        const insertQuery = `DELETE from friend WHERE sender_id = '${userId}' AND receiver_id = '${receiverId}'`;
        conn.query(insertQuery, function (error, rows) {
          if (error) throw error;

          return res.status(StatusCodes.OK).send({
            message: "OK",
          });
        });
      } else {
        return res.status(400).send({
          message: "이미 친구가 아닙니다.",
        });
      }
    });
    conn.release();
  });
};

export const friendList = async (req, res) => {
  const userId = req.memberId;

  const sql = `
  SELECT
  user.login_id,
  user.id,
  user.profile_image,
  user.nickname,
  user.mbti,
  user.status_message,
  friend.receiver_id,
  friend.sender_id
  FROM friend
  join user on user.id = friend.receiver_id
  `;

  getConnection((conn) => {
    conn.query(sql, function (error, rows) {
      if (error) throw error;

      const isSame = (a, b) => {
        return a.sender_id === b.receiver_id && a.receiver_id === b.sender_id;
      };

      const findDuplicateItems = (data, userId) => {
        const duplicateItems = [];
        const seen = {};

        data.forEach((item, index) => {
          for (let j = index + 1; j < data.length; j++) {
            if (!seen[j] && isSame(item, data[j])) {
              duplicateItems.push(item);
              duplicateItems.push(data[j]);
              seen[j] = true;
            }
          }
        });

        return duplicateItems.filter((item) => item.id !== userId);
      };

      const duplicateItems = findDuplicateItems(rows, userId);
      return res.status(StatusCodes.OK).send(
        duplicateItems.map((item) => ({
          userId: item.receiver_id,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          statusMessage: item.status_message,
          profileImage: item.profile_image,
        }))
      );
    });
    conn.release();
  });
};

export const friendReceiveList = async (req, res) => {
  const userId = req.memberId;

  const sql = `
  SELECT
  user.login_id,
  user.id,
  user.profile_image,
  user.nickname,
  user.mbti,
  user.status_message,
  friend.receiver_id,
  friend.sender_id
  FROM friend
  join user on user.id = friend.sender_id
  `;
  getConnection((conn) => {
    conn.query(sql, function (error, rows) {
      if (error) throw error;

      const removeDuplicates = (arr) => {
        return arr.filter((item, index) => {
          const isDuplicate = arr.some((el, idx) => {
            return (
              idx !== index &&
              el.receiver_id === item.sender_id &&
              el.sender_id === item.receiver_id
            );
          });
          return !isDuplicate;
        });
      };

      rows = removeDuplicates(rows).filter(
        (a) => Number(a.receiver_id) === userId
      );

      return res.status(StatusCodes.OK).send(
        rows.map((item) => ({
          userId: item.sender_id,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          statusMessage: item.status_message,
          profileImage: item.profile_image,
        }))
      );
    });
    conn.release();
  });
};

export const friendRequestList = async (req, res) => {
  const userId = req.memberId;

  const sql = `
  SELECT
  user.login_id,
  user.id,
  user.profile_image,
  user.nickname,
  user.mbti,
  user.status_message,
  friend.receiver_id,
  friend.sender_id
  FROM friend
  join user on user.id = friend.receiver_id
  `;

  getConnection((conn) => {
    conn.query(sql, function (error, rows) {
      if (error) throw error;

      const removeDuplicates = (arr) => {
        return arr.filter((item, index) => {
          return (
            arr.findIndex(
              (el, idx) =>
                idx !== index &&
                el.receiver_id === item.sender_id &&
                el.sender_id === item.receiver_id
            ) === -1
          );
        });
      };

      rows = removeDuplicates(rows).filter(
        (a) => Number(a.sender_id) === userId
      );

      return res.status(StatusCodes.OK).send(
        rows.map((item) => ({
          userId: item.receiver_id,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          statusMessage: item.status_message,
          profileImage: item.profile_image,
        }))
      );
    });
    conn.release();
  });
};

export const chatList = async (req, res) => {
  const userId = req.memberId;

  const checkQuery = `SELECT * FROM room  WHERE NOT room_id IN ('room1');`;

  getConnection((conn) => {
    conn.query(checkQuery, function (error, rows) {
      if (error) throw error;

      rows = rows
        .filter((item) => item.room_id.includes(userId))
        .map((row) => {
          return {
            id: row.id,
            roomName: row.room_id,
            lastMessage: row.last_message,
            updatedAt: row.updated_at ?? row.created_at,
          };
        });
      return res.status(StatusCodes.OK).send(rows);
    });
    conn.release();
  });
};

export const loadChat = async (req, res) => {
  const { limit, roomName } = req.query;

  getConnection((conn) => {
    const sql1 = `
    SELECT chat.id, chat.message, chat.created_at, chat.sender_id, user.nickname, user.profile_image
    FROM chat 
    JOIN user on user.id = chat.sender_id
    WHERE room_id LIKE '${roomName ?? "room1"}' 
    ORDER BY chat.id DESC 
    LIMIT ${limit};
    `;

    conn.query(sql1, (error, rows) => {
      rows = rows.map((row) => {
        return {
          id: row.id,
          message: row.message,
          createdAt: row.created_at,
          senderId: row.sender_id,
          nickname: row.nickname,
          profileImage: row.profile_image,
        };
      });

      return res.status(StatusCodes.OK).send(rows.reverse());
    });

    conn.release();
  });
};
