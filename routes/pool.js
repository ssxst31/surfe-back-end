const mysql = require("mysql2");
const dotenv = require("dotenv");

const path = require("path");

const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
(() => {
  const result = dotenv.config({
    path: path.join(__dirname, "..", envFile),
  });
  if (result.error) {
    throw new Error("Cannot load environment variables file.");
  }
})();

const dbConfig = {
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
