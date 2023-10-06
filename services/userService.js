const { StatusCodes } = require("http-status-codes");

const getConnection = require("../routes/pool.js");
const { createError } = require("../utils/responseUtils.js");
const { USER_VALIDATION_ERRORS } = require("../utils/validator.js");

const createUser = async ({ nickname, email, password }) => {
  getConnection((conn) => {
    conn.query("INSERT INTO users ( nickname, email, password ) VALUES ?;", [
      [[nickname, email, password]],
      (error) => {
        if (error) {
          return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            error,
          });
        }
      },
    ]);
    conn.release();
  });
};

const findUser = async (predicate) => {
  let dsa = [];
  getConnection((conn) => {
    const sql1 = `SELECT SQL_CALC_FOUND_ROWS * FROM users WHERE nickname LIKE '%${predicate}%';`;

    conn.query(sql1, (error, rows) => {
      if (rows.length > 0) {
        throw 1;
      }
    });

    conn.release();
  });
};

module.exports = {
  createUser,
  findUser,
};
