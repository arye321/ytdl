const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const http = require('http').Server(app);
const io = require('socket.io')(http);



app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.static("./"));
app.use(bodyParser.json());
io.on('connection', (socket) => {


    io.emit('counter', Date());


});
app.get("/", (res) => {
    res.render("index.html");
  });
  
app.post('/', function (req, res) {
    res.send('POST request to homepage')
    const url = req.body.ytlink
    console.log(req.body.ytlink)

    
})

app.listen(5000, () => {
    console.log('Server is listening on port 5000....')
  })