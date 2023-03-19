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
    const roomName = "room1";
    client.join(roomName);

    client.on("JOIN_ROOM", (data) => {
      console.log(`${data.nickname}님이 입장하였습니다.`);

      getConnection((conn) => {
        const sql1 = `SELECT * FROM chat`;
        conn.query(sql1, (error, rows) => {
          return this.io
            .to(roomName)
            .emit("RECEIVE_MESSAGE", { chatList: rows });
        });

        conn.release();
      });
    });

    client.on("SEND_MESSAGE", (data) => {
      const { content, nickname } = data;

      getConnection((conn) => {
        conn.query(
          "INSERT INTO chat ( content, nickname, createAt ) VALUES ?;",
          [[[content, nickname, new Date()]]],
          (error) => {
            if (error) {
              return console.log(error);
            }

            const sql1 = `SELECT * FROM chat`;

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
  }

  emit(event, data) {
    this.io.emit(event, data);
  }
}

export default new WebSocket();
