let SOCKET_PORT = process.env.SOCKET_PORT;

let https = require('https');
let fs    = require('fs');

let app = https.createServer({
    key:    fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/privkey.pem'),
    cert:   fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/fullchain.pem'),
    ca:     fs.readFileSync('/home/vollkorn/.config/letsencrypt/live/torusgo.com/chain.pem')
});

let sanitizer = require('sanitizer');

let mysql = require('promise-mysql');
let db_credentials = {
    host     : 'example.org',
    user     : 'bob',
    password : 'secret',
    database : 'my_db'
};

let io = require('socket.io').listen(app);

let register_user = (accountData, socket) => {
  let connection;
  const {username, password, email} = accountData;
  mysql.createConnection(db_credentials)
    .then((conn) => { 
      connection = conn;
    })
    .then(() => {
      // first check whether username or email is duplicate
      let sql = "FROM users SELECT 1 WHERE username = ? OR email = ?";
      sql = mysql.format(sql, [username, email]);
      let duplicates = connection.query(sql);
      if (duplicates.length !== 0) {
        if (duplicates[0].username === username) throw {name: "FeedbackError", message: "Username in use."};
        if (duplicates[0].email === email) throw {name: "FeedbackError", message: "Email in use."};
      }
    })
    // TODO actually create account
    .then(() => {
      socket.emit("success", "Account was created.");
    })
    .catch((err) => {
      console.log(err);
      if (err.name === "FeedbackError") {
        socket.emit("failure", err.message);
      } else {
        socket.emit("failure", "DB error without feedback... try again later");
      }
    });
};

io.on('connection', (socket) => {
  socket.on('account creation', (accountData) => {
    register_user(accountData, socket);
  });

  socket.on('token request', (tokenPacket) => {
   if ('tokentype' in tokenPacket) {
    let tokentype = sanitizer.sanitize(tokenPacket.tokentype);
    switch (tokentype) {
     case 'userid':
      socket.emit('token provision', {
       token: 'asdf'
      });
      break;
     default:
      socket.emit('failure', 'tokentype not recognised');
    }
    return;
   }
   socket.emit('failure', 'tokentype missing');
  });

  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

});

app.listen(SOCKET_PORT, () => {
    console.log('socket listening on *: ', SOCKET_PORT);
});
