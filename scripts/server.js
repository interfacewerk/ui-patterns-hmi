const express = require('express')
const auth = require('http-auth');
const path = require('path');

const app = express();
app.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Request-Method", "GET, HEAD, OPTIONS, POST");
  // res.setHeader('Content-Type','text/css');
  return next();
});

// serve client
const basic = auth.basic({
  realm: 'NgAppSeed'
}, (username, password, callback) => {
  callback(username === 'someuser' && password === 'somepassword');
});
app.use(auth.connect(basic));
app.use(express.static(path.join(__dirname + '/../dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/../dist/index.html'));
});

app.listen(process.env.PORT || 5000);