const http = require("http");
const ws = require("./datasources/ws.js");

const app = require("./app.js");

const port = 3389;
const server = http.createServer(app);

ws.init(server);

server.listen(port, () => {
  console.log(`${port}번 포트 대기`);
});
