import { Server } from "socket.io";

import getConnection from "../routes/pool.js";

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
      console.log(`${data.nickname}님이 입장하였습니다.`);

      getConnection((conn) => {
        const sql1 = `SELECT chat.id, chat.content, users.nickname, users.profile, chat.createAt, chat.roomName FROM chat JOIN users ON users.id = chat.memberId WHERE roomName LIKE '${roomName}'`;
        conn.query(sql1, (error, rows) => {
          return this.io
            .to(roomName)
            .emit("RECEIVE_MESSAGE", { chatList: rows });
        });

        conn.release();
      });
    });

    client.on("JOIN_PRIVATE_ROOM", (data) => {
      console.log(`${data.nickname}님이 입장하였습니다.`);
      client.join(data.roomName);

      getConnection((conn) => {
        const sql1 = `SELECT chat.id, chat.content, users.nickname, users.profile, chat.createAt, chat.roomName FROM chat JOIN users ON users.id = chat.memberId WHERE roomName LIKE '${data.roomName}'`;

        conn.query(sql1, (error, rows) => {
          return this.io
            .to(data.roomName)
            .emit("RECEIVE_PRIVATE_MESSAGE", { chatList: rows });
        });

        conn.release();
      });
    });

    client.on("SEND_MESSAGE", (data) => {
      const { content, memberId } = data;
      const roomName = data.roomName;

      client.join(data.roomName);
      getConnection((conn) => {
        conn.query(
          "INSERT INTO chat ( content, memberId, createAt, roomName ) VALUES ?;",
          [[[content, memberId, new Date(), roomName]]],
          (error) => {
            if (error) {
              return console.log(error);
            }

            const sql1 = `SELECT chat.id, chat.content, users.nickname, users.profile, chat.createAt, chat.roomName FROM chat JOIN users ON users.id = chat.memberId WHERE roomName LIKE '${roomName}'`;

            conn.query(sql1, (error, rows) => {
              return this.io
                .to(roomName)
                .emit("RECEIVE_MESSAGE", { chatList: rows });
            });
          }
        );

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

            const sql1 = `SELECT chat.id, chat.content, users.nickname, chat.createAt, users.profile, chat.roomName FROM chat JOIN users ON users.id = chat.memberId WHERE roomName LIKE '${roomName}'`;

            conn.query(sql1, (error, rows) => {
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

export default new WebSocket();
