import { Server } from "socket.io";

class WebSocket {
  constructor() {
    this.io = null;
    this.chatList = [];
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
      this.io.to(roomName).emit("RECEIVE_MESSAGE", { chatList: this.chatList });
    });

    client.on("SEND_MESSAGE", (data) => {
      this.chatList.push(data);

      this.io.to(roomName).emit("RECEIVE_MESSAGE", { chatList: this.chatList });
    });
  }

  emit(event, data) {
    this.io.emit(event, data);
  }
}

export default new WebSocket();
