const mysql = require('mysql2');

const connectionOptions = {
  host: "127.0.0.1",
  user: "root",
  password: "12345",
  database: "projeto_db"
};

const connection = mysql.createConnection(connectionOptions);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao ligar à base de dados:", err);
  } else {
    console.log("Ligado à base de dados MySQL");
  }
});

module.exports = connection;
