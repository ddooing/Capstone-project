const mysql = require('mysql');

const connection = mysql.createConnection({
  host:'127.0.0.1',
  user: 'root', 
  password: '1', 
  database: 'DB', 
  charset: 'utf8mb4' 
});


connection.connect((err) => {
  if (err) {
    console.error('MySQL connection failed: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

module.exports = connection;