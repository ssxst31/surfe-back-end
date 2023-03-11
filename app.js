import cors from "cors";

import express from "express";
import bodyParser from "body-parser";

import userRouter from "./routes/userRouter.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/users", userRouter);

export default app;
