import { StatusCodes } from "http-status-codes";

import { createError } from "../utils/responseUtils.js";
import { loginValidator, USER_VALIDATION_ERRORS } from "../utils/validator.js";
import { createToken } from "../utils/authorizeUtils.js";
import getConnection from "../routes/pool.js";
import { createHashedPassword, verifyPassword } from "../utils/hash.js";

export const signUp = async (req, res) => {
  const { email, password, nickname, interestList } = req.body;

  const { hashedPassword, salt } = await createHashedPassword(password);

  const { isValid, message } = loginValidator({ email, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  getConnection((conn) => {
    const sql1 = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE email LIKE '${email}';`;

    conn.query(sql1, (error, rows) => {
      if (rows.length > 0) {
        return res.status(StatusCodes.CONFLICT).send({
          message: USER_VALIDATION_ERRORS.EXIST_USER,
        });
      } else {
        const dsa = `INSERT INTO users ( nickname, email, password, salt ) VALUES ('${nickname}', '${email}', '${hashedPassword}', '${salt}');`;

        conn.query(dsa, (error) => {
          if (error) {
            return console.log(error);
          }

          const sql1 = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE email LIKE '${email}';`;
          conn.query(sql1, (error, rows2) => {
            if (error) {
              return console.log(error);
            }

            conn.query(
              `INSERT INTO location (memberId, lat, lng ) VALUES ('${
                rows2[0].id
              }', '0', '0' );
              INSERT INTO interestList (memberId, interestList) VALUES ('${
                rows2[0].id
              }', '${JSON.stringify(interestList)}' );`,
              (error) => {
                if (error) {
                  return console.log(error);
                }
              },
              res
                .cookie(
                  "token",
                  createToken({ email, nickname, memberId: rows2[0].id }),
                  {
                    maxAge: 3600 * 24 * 7,
                  }
                )
                .status(StatusCodes.OK)
                .send({
                  message: "계정이 성공적으로 생성되었습니다",
                })
            );
          });
        });
      }
    });

    conn.release();
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  const { isValid, message } = loginValidator({ email, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  getConnection((conn) => {
    const query = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE email LIKE '${email}';`;

    conn.query(query, async (error, rows) => {
      if (error) throw error;
      else {
        if (rows.length === 0) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "없는 아이디 입니다.",
          });
        } else {
          const row = rows[0];
          const memberId = row.id;
          const nickname = row.nickname;
          const verified = await verifyPassword(
            password,
            row.salt,
            row.password
          );
          if (!verified) {
            return res.status(StatusCodes.BAD_REQUEST).send({
              message: "비밀번호가 틀렸습니다.",
            });
          } else {
            return res
              .cookie("token", createToken({ email, nickname, memberId }), {
                maxAge: 3600 * 24 * 7,
              })
              .status(StatusCodes.OK)
              .send({
                message: "성공적으로 로그인 했습니다",
              });
          }
        }
      }
    });

    conn.release();
  });
};

export const logout = async (req, res) => {
  return res.clearCookie("token").end();
};
