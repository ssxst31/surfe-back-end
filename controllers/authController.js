const { StatusCodes } = require("http-status-codes");

const { createError } = require("../utils/responseUtils.js");
const {
  loginValidator,
  USER_VALIDATION_ERRORS,
} = require("../utils/validator.js");
const { createToken } = require("../utils/authorizeUtils.js");
const getConnection = require("../routes/pool.js");
const {
  createHashedPassword,
  verifyPassword,
  createKakaoId,
} = require("../utils/hash.js");
const { isProduction } = require("../utils/env.js");

const signUp = async (req, res) => {
  const { id, password, nickname, interestList, mbti, statusMessage } =
    req.body;

  const { hashedPassword, salt } = await createHashedPassword(password);

  const { isValid, message } = loginValidator({ id, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  getConnection((conn) => {
    const sql = `SELECT sql_calc_found_rows * from user
    WHERE login_id LIKE '${id}';`;

    conn.query(sql, (error, rows) => {
      if (rows.length > 0) {
        return res.status(StatusCodes.CONFLICT).send({
          message: USER_VALIDATION_ERRORS.EXIST_USER,
        });
      } else {
        const sql = `INSERT INTO user(nickname, login_id, password, salt, mbti, status_message)
        VALUES ('${nickname}', '${id}', '${hashedPassword}', '${salt}', '${mbti}', '${statusMessage}');`;

        conn.query(sql, (error, rows) => {
          if (error) {
            return console.log(error);
          }

          const sql = `SELECT id FROM user WHERE login_id LIKE '${id}';`;

          conn.query(sql, (error) => {
            if (error) {
              return console.log(error);
            }

            const sql = `INSERT INTO interest(title, member_id)
            VALUES 
            ('${interestList[0]}', '${rows.insertId}'),
            ('${interestList[1]}', '${rows.insertId}'),
            ('${interestList[2]}', '${rows.insertId}')
            ;`;

            conn.query(
              sql,
              (error, rows) => {
                if (error) {
                  return console.log(error);
                }
              },
              res
                .cookie("token", createToken({ memberId: rows.insertId }), {
                  maxAge: 1000 * 60 * 60 * 24 * 7,
                  secure: isProduction(),
                  httpOnly: true,
                  samesite: "none",
                  domain: isProduction() ? ".surfe.store" : undefined,
                })
                .status(StatusCodes.OK)
                .send({
                  message: "계정이 성공적으로 생성되었습니다.",
                })
            );
          });
        });
      }
    });

    conn.release();
  });
};

const kakaoLogin = async (req, res) => {
  const { kakaoId } = req.body;

  const data = await createKakaoId(kakaoId);

  getConnection((conn) => {
    const sql = `SELECT sql_calc_found_rows * from user
    WHERE login_id LIKE '${data}';`;

    conn.query(sql, (error, rows) => {
      if (rows.length > 0) {
        return res
          .cookie("token", createToken({ memberId: rows[0].id }), {
            maxAge: 1000 * 60 * 60 * 24 * 7,
            secure: isProduction(),
            httpOnly: true,
            samesite: "none",
            domain: isProduction() ? ".surfe.store" : undefined,
          })
          .status(StatusCodes.OK)
          .send({
            message: "OK",
          });
      } else {
        const sql = `INSERT INTO user(nickname, login_id,  mbti, status_message)
        VALUES ('${String(new Date().getTime()).slice(
          0,
          8
        )}', '${data}', '${"ISTJ"}', '${""}');`;

        conn.query(sql, (error, rows) => {
          if (error) {
            return console.log(error);
          }
          res
            .cookie("token", createToken({ memberId: rows.insertId }), {
              maxAge: 1000 * 60 * 60 * 24 * 7,
              secure: isProduction(),
              httpOnly: true,
              samesite: "none",
              domain: isProduction() ? ".surfe.store" : undefined,
            })
            .status(StatusCodes.OK)
            .send({
              message: "OK",
            });
        });
      }
    });

    conn.release();
  });
};

const login = async (req, res) => {
  const { id, password } = req.body;

  const { isValid, message } = loginValidator({ id, password });

  if (!isValid) {
    return res.status(StatusCodes.BAD_REQUEST).send(createError(message));
  }

  getConnection((conn) => {
    const query = `SELECT SQL_CALC_FOUND_ROWS * FROM user WHERE login_id LIKE '${id}';`;

    conn.query(query, async (error, rows) => {
      if (error) throw error;
      else {
        if (rows.length === 0) {
          return res.status(StatusCodes.BAD_REQUEST).send({
            message: "없는 아이디 입니다.",
          });
        } else {
          const row = rows[0];

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
              .cookie("token", createToken({ memberId: row.id }), {
                maxAge: 1000 * 60 * 60 * 24 * 7,
                secure: isProduction(),
                httpOnly: true,
                samesite: "none",
                domain: isProduction() ? ".surfe.store" : undefined,
              })
              .status(StatusCodes.OK)
              .send({
                message: "성공적으로 로그인 했습니다.",
              });
          }
        }
      }
    });

    conn.release();
  });
};

const logout = async (req, res) => {
  return res
    .clearCookie("token", {
      domain: isProduction() ? ".surfe.store" : undefined,
    })
    .end();
};

module.exports = {
  signUp,
  login,
  logout,
  kakaoLogin,
};
