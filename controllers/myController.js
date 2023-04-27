import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";

export const profile = async (req, res) => {
  getConnection((conn) => {
    const sql1 = `SELECT users.email, users.user_id, users.profile, location.lat, location.lng, users.nickname ,interestList.interestList, mbti.mbti, introduce.introduce FROM location JOIN users ON users.user_id = location.memberId JOIN mbti ON mbti.memberId = location.memberId JOIN interestList ON interestList.memberId = location.memberId JOIN introduce ON introduce.memberId = location.memberId WHERE location.memberId LIKE '${req.memberId}'`;

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
    const sql1 = `UPDATE users SET profile = '${aa}' WHERE user_id = '${req.memberId}'`;

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

  const checkQuery = `SELECT * FROM friendList WHERE senderId = ${userId} AND receiverId = ${receiverId}`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, results) {
      if (error) throw error;

      // 친구 추가 요청이 없으면 요청을 수락한다
      if (results.length === 0) {
        const insertQuery = `INSERT INTO friendList (senderId, receiverId) VALUES (${userId}, ${receiverId})`;
        conn.query(insertQuery, function (error, rows) {
          if (error) throw error;

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

  const checkQuery = `SELECT * FROM friendList WHERE senderId = ${userId} AND receiverId = ${receiverId}`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, results) {
      if (error) throw error;

      if (results.length !== 0) {
        const insertQuery = `DELETE from friendList WHERE senderId = '${userId}' AND receiverId = '${receiverId}'`;
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

  const checkQuery = `SELECT users.user_id, friendList.senderId, friendList.receiverId, users.profile, users.nickname, mbti.mbti, introduce.introduce FROM friendList JOIN users ON users.user_id = friendList.receiverId JOIN mbti ON mbti.memberId = users.user_id JOIN introduce ON introduce.memberId = users.user_id WHERE senderId = '${userId}' OR receiverId = '${userId}'`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, rows) {
      if (error) throw error;

      const isSame = (a, b) => {
        return a.senderId === b.receiverId && a.receiverId === b.senderId;
      };

      let sameIds = [];

      for (let i = 0; i < rows.length; i++) {
        for (let j = i + 1; j < rows.length; j++) {
          if (isSame(rows[i], rows[j])) {
            sameIds.push(rows[i]);
            sameIds.push(rows[j]);
          }
        }
      }

      sameIds = sameIds.filter((item) => item.user_id !== userId);

      return res.status(StatusCodes.OK).send(
        sameIds.map((item) => ({
          userId: item.receiverId,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          introduce: item.introduce,
        }))
      );
    });
    conn.release();
  });
};

export const friendReceiveList = async (req, res) => {
  const userId = req.memberId;

  const checkQuery = `SELECT users.user_id, friendList.senderId, friendList.receiverId, users.profile, users.nickname, mbti.mbti, introduce.introduce FROM friendList JOIN users ON users.user_id = friendList.senderId JOIN mbti ON mbti.memberId = users.user_id JOIN introduce ON introduce.memberId = users.user_id WHERE senderId = '${userId}' OR receiverId = '${userId}'`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, rows) {
      if (error) throw error;

      const removeDuplicates = (arr) => {
        return arr.filter((item, index) => {
          const isDuplicate =
            arr.findIndex((el, idx) => {
              return (
                idx !== index &&
                el.receiverId === item.senderId &&
                el.senderId === item.receiverId
              );
            }) !== -1;
          return !isDuplicate;
        });
      };

      rows = removeDuplicates(rows).filter(
        (a) => Number(a.receiverId) === userId
      );

      return res.status(StatusCodes.OK).send(
        rows.map((item) => ({
          userId: item.senderId,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          introduce: item.introduce,
        }))
      );
    });
    conn.release();
  });
};

export const friendRequestList = async (req, res) => {
  const userId = req.memberId;

  const checkQuery = `SELECT users.user_id, friendList.senderId, friendList.receiverId, users.profile, users.nickname, mbti.mbti, introduce.introduce FROM friendList JOIN users ON users.user_id = friendList.receiverId JOIN mbti ON mbti.memberId = users.user_id JOIN introduce ON introduce.memberId = users.user_id WHERE senderId = '${userId}' OR receiverId = '${userId}'`;
  getConnection((conn) => {
    conn.query(checkQuery, function (error, rows) {
      if (error) throw error;

      const removeDuplicates = (arr) => {
        return arr.filter((item, index) => {
          const isDuplicate =
            arr.findIndex((el, idx) => {
              return (
                idx !== index &&
                el.receiverId === item.senderId &&
                el.senderId === item.receiverId
              );
            }) !== -1;
          return !isDuplicate;
        });
      };

      rows = removeDuplicates(rows).filter(
        (a) => Number(a.senderId) === userId
      );

      return res.status(StatusCodes.OK).send(
        rows.map((item) => ({
          userId: item.receiverId,
          profile: item.profile,
          nickname: item.nickname,
          mbti: item.mbti,
          introduce: item.introduce,
        }))
      );
    });
    conn.release();
  });
};

export const chatList = async (req, res) => {
  const userId = req.memberId;

  const checkQuery = `SELECT users.profile, users.nickname, chat.content, chat.roomName, chat.createAt 
  FROM chat 
  JOIN users ON users.user_id = chat.memberId 
  WHERE roomName NOT IN ("room1") AND (roomName LIKE '${userId}\\_%' OR roomName LIKE '%\\_${userId}%')
  ORDER BY roomName ASC;`;

  getConnection((conn) => {
    conn.query(checkQuery, function (error, rows) {
      if (error) throw error;

      const groupByRoom = {};
      rows.forEach((obj) => {
        if (groupByRoom[obj.roomName]) {
          groupByRoom[obj.roomName].push(obj);
        } else {
          groupByRoom[obj.roomName] = [obj];
        }
      });

      const result = Object.values(groupByRoom).flatMap((objs) => {
        objs.sort((a, b) => a.createAt - b.createAt);
        return objs;
      });

      const result2 = [];

      for (let i = 0; i < result.length; i++) {
        if (result[i].roomName !== result[i + 1]?.roomName) {
          result2.push(result[i]);
        }
      }

      return res.status(StatusCodes.OK).send(result2);
    });
    conn.release();
  });
};
