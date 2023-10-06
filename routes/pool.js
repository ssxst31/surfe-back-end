const mysql = require("mysql2");
const dotenv = require("dotenv");

function isProduction() {
  return process.env.NODE_ENV === "production";
}

dotenv.config();

const dbConfig = 2
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

function getConnection(callback) {
  pool.getConnection((error, conn) => {
    if (error) {
      return console.log(error);
    }

    callback(conn);
  });
}

module.exports = getConnection;
