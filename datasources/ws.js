const { Server } = require("socket.io");

const getConnection = require("../routes/pool.js");

class WebSocket {
  constructor() {
    this.io = null;
  }

  init(server) {
    this.io = new Server(server);

    this.io.on("connection", (client) => {
      this.onConnect(client);
    });
  }

  createIO(server) {
    const io =
      (server,
      {
        cors: {
          origin: "*",
        },
      });
    return io;
  }

  onConnect(client) {
    client.on("JOIN_ROOM", (data) => {
      const roomName = data.roomName;
      client.join(roomName);
    });

    client.on("JOIN_PRIVATE_ROOM", (data) => {
      client.join(data.roomName);

      getConnection((conn) => {
        const sql1 = `SELECT chat.id, users.login_id, chat.content, users.nickname, users.profile, chat.createAt, chat.roomName FROM chat JOIN users ON users.login_id = chat.memberId WHERE roomName LIKE '${data.roomName}'`;

        conn.query(sql1, (error, rows) => {
          rows = rows.map((row) => {
            return {
              id: row.id,
              message: row.message,
              createdAt: row.created_at,
              senderId: row.sender_id,
              nickname: row.nickname,
            };
          });

          return this.io
            .to(data.roomName)
            .emit("RECEIVE_PRIVATE_MESSAGE", { chatList: rows });
        });

        conn.release();
      });
    });

    client.on("SEND_MESSAGE", (data) => {
      const { content, memberId, roomName } = data;

      client.join(data.roomName);
      getConnection((conn) => {
        const sql = `INSERT INTO room (room_id, last_message, created_at)
        VALUES ('${roomName}', '${content}', CONVERT_TZ(NOW(), 'GMT', 'Asia/Seoul'))
        ON DUPLICATE KEY UPDATE last_message='${content}', updated_at=CONVERT_TZ(NOW(), 'GMT', 'Asia/Seoul');`;

        conn.query(sql, (error, rows) => {
          if (error) {
            return console.log(error);
          }
          conn.query(
            "INSERT INTO chat ( message, sender_id, created_at, room_id ) VALUES ?;",
            [[[content, memberId, new Date(), roomName]]],
            (error) => {
              if (error) {
                return console.log(error);
              }
              const pageSize = 30; // 페이지당 표시할 항목 수

              const sql1 = `
              SELECT chat.id, chat.message, chat.created_at, chat.room_id, chat.sender_id, user.nickname, user.profile_image
              FROM chat 
              JOIN user on user.id = chat.sender_id
              WHERE room_id LIKE '${roomName}' 
              ORDER BY chat.id DESC 
              LIMIT ${pageSize};
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
                return this.io
                  .to(roomName)
                  .emit("RECEIVE_MESSAGE", { chatList: rows.reverse() });
              });
            }
          );
        });

        conn.release();
      });
    });

    client.on("SEND_PRIVATE_MESSAGE", (data) => {
      const { content, memberId } = data;
      const roomName = data.roomName;
      client.join(roomName);
      getConnection((conn) => {
        conn.query(
          "INSERT INTO chat ( content, memberId, createAt, roomName ) VALUES ?;",
          [[[content, memberId, new Date(), roomName]]],
          (error) => {
            if (error) {
              return console.log(error);
            }

            const sql1 = `SELECT
            chat.id, users.login_id, chat.content, users.nickname, chat.createAt, users.profile, chat.roomName 
            FROM chat JOIN users ON users.login_id = chat.memberId WHERE roomName LIKE '${roomName}'`;

            conn.query(sql1, (error, rows) => {
              rows = rows.map((row) => {
                let newObj = Object.assign(
                  {},
                  { ["userId"]: row["login_id"] },
                  row
                );
                delete newObj["login_id"];
                return newObj;
              });

              return this.io
                .to(roomName)
                .emit("RECEIVE_PRIVATE_MESSAGE", { chatList: rows });
            });
          }
        );

        conn.release();
      });
    });
  }

  emit(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = new WebSocket();
