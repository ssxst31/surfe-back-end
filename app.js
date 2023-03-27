import cors from "cors";
import bodyParser from "body-parser";

import express from "express";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

const app = express();

const ALLOWED_HOSTS = ["http://localhost:3000", "https://surfe.netlify.app"];

app.use(
  cors({
    credentials: true,
    origin: (origin, callback) => {
      const isTrue = ALLOWED_HOSTS.indexOf(origin) !== -1;
      callback(null, isTrue);
    },
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/auth", authRouter);
app.use("/user", userRouter);

export default app;
