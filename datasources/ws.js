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
        const sql1 = `SELECT * FROM chat WHERE roomName LIKE '${data.roomName}'`;
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
        const sql1 = `SELECT * FROM chat WHERE roomName LIKE '${data.roomName}'`;

        conn.query(sql1, (error, rows) => {
          console.log(rows);
          return this.io
            .to(data.roomName)
            .emit("RECEIVE_PRIVATE_MESSAGE", { chatList: rows });
        });

        conn.release();
      });
    });

    client.on("SEND_MESSAGE", (data) => {
      const { content, nickname } = data;
      const roomName = data.roomName;
      console.log(roomName);
      client.join(data.roomName);
      getConnection((conn) => {
        conn.query(
          "INSERT INTO chat ( content, nickname, createAt, roomName ) VALUES ?;",
          [[[content, nickname, new Date(), roomName]]],
          (error) => {
            if (error) {
              return console.log(error);
            }

            const sql1 = `SELECT * FROM chat WHERE roomName LIKE '${roomName}'`;

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
      const { content, nickname } = data;
      const roomName = data.roomName;
      client.join(roomName);
      getConnection((conn) => {
        conn.query(
          "INSERT INTO chat ( content, nickname, createAt, roomName ) VALUES ?;",
          [[[content, nickname, new Date(), roomName]]],
          (error) => {
            if (error) {
              return console.log(error);
            }

            const sql1 = `SELECT * FROM chat WHERE roomName LIKE '${roomName}'`;
            console.log(content, nickname, roomName);
            conn.query(sql1, (error, rows) => {
              console.log(rows);
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
