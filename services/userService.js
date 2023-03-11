import { StatusCodes } from "http-status-codes";

import getConnection from "../routes/pool.js";
import { createError } from "../utils/responseUtils.js";
import { USER_VALIDATION_ERRORS } from "../utils/validator.js";

export const createUser = async ({ nickname, email, password }) => {
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

export const findUser = async (predicate) => {
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
