import { StatusCodes } from "http-status-codes";

import * as userService from "../services/userService";
import { createError } from "../utils/responseUtils.js";
import { loginValidator, USER_VALIDATION_ERRORS } from "../utils/validator.js";
import { createToken } from "../utils/authorizeUtils.js";
import getConnection from "../routes/pool.js";

export const signUp = async (req, res) => {
  const { email, password, nickname } = req.body;

  const { isValid, message } = loginValidator({ email, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  getConnection((conn) => {
    const sql1 = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE email LIKE '%${email}%';`;

    conn.query(sql1, (error, rows) => {
      if (rows.length > 0) {
        return res.status(StatusCodes.CONFLICT).send({
          message: USER_VALIDATION_ERRORS.EXIST_USER,
        });
      } else {
        conn.query(
          "INSERT INTO users ( nickname, email, password ) VALUES ?;",
          [
            [[nickname, email, password]],
            (error) => {
              if (error) {
                return console.log(error);
              }
            },
            res.status(StatusCodes.OK).send({
              message: "계정이 성공적으로 생성되었습니다",
              token: createToken(email),
            }),
          ]
        );
      }
    });

    conn.release();
  });
};

export const login = async (req, res) => {
  const { id, password, nickname } = req.body;

  const { isValid, message } = loginValidator({ email, password });
  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  const user = userService.findUser(
    (user) => user.email === email && user.password === password
  );

  if (user) {
    return res.status(StatusCodes.OK).send({
      message: "성공적으로 로그인 했습니다",
      token: createToken(email),
    });
  } else {
    return res
      .status(StatusCodes.BAD_REQUEST)
      .send(createError(USER_VALIDATION_ERRORS.USER_NOT_FOUND));
  }
};
