const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const express = require("express");
const authRouter = require("./routes/authRouter.js");
const userRouter = require("./routes/userRouter.js");
const myRouter = require("./routes/myRouter.js");

const app = express();

const ALLOWED_HOSTS = ["http://localhost:3000", "https://surfe.store"];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      const isTrue = ALLOWED_HOSTS.indexOf(origin) !== -1;
      callback(null, isTrue);
    },
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/uploads", express.static("uploads"));
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/my", myRouter);

module.exports = app;
