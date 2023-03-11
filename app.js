import cors from "cors";
import bodyParser from "body-parser";

import express from "express";
import userRouter from "./routes/userRouter.js";

const app = express();

app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/users", userRouter);

export default app;
