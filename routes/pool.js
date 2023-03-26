import mysql from "mysql2";

import dotenv from "dotenv";

function isProduction() {
  return process.env.NODE_ENV === "production";
}

dotenv.config();

const dbConfig = isProduction()
  ? {
      uri: process.env.DATABASE_URL,
      multipleStatements: true,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      multipleStatements: true,
    };

const pool = mysql.createPool(dbConfig);

export default function getConnection(callback) {
  pool.getConnection((error, conn) => {
    if (error) {
      return console.log(error);
    }

    callback(conn);
  });
}
