import http from "http";
import ws from "./datasources/ws.js";

import app from "./app.js";

const port = 3389;
const server = http.createServer(app);

ws.init(server);

server.listen(port, () => {
  console.log(`${port}번 포트 대기`);
});
