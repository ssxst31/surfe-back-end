import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import express from "express";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";
import myRouter from "./routes/myRouter.js";

const app = express();

const ALLOWED_HOSTS = ["http://localhost:3000", "https://www.surfe.store"];

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

export default app;
